import {Component} from "@angular/core";
import {
  AlertController,
  Events,
  Loading,
  LoadingController,
  NavController,
  Platform,
  ToastController
} from "ionic-angular";
import {LocationDuple, LocationProvider} from "../../providers/location";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {Hadith, StartupData, WebProvider} from "../../providers/web-provider";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {InterstitialProvider} from "../../providers/interstitial-provider";
import {CalendarResponse, MonthlyCalendarProvider} from "../../providers/monthly-calendar-provider";
import {AppRate} from "@ionic-native/app-rate";
import {NearbyMosquesPage} from "../nearby-mosques/nearby-mosques";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  loader: Loading;
  dictionary: Dictionary;
  source: string;
  startupData: StartupData;
  timer: Timer;
  loaded: boolean = false;
  offlineLoaded: boolean = false;
  offlineQuranAvailable: boolean = false;
  noGPS: boolean = false;
  noInternet: boolean = false;
  title: string = "";
  offlineTimer: Timer;
  eventsTodayEnabled: boolean;
  onlyOffline = false;


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public toastController: ToastController,
              public wordingProvider: WordingProvider, private adProvider: InterstitialProvider, private monthlyCalendarProvider: MonthlyCalendarProvider,
              public alertController: AlertController, public loadingController: LoadingController, private localNotifications: LocalNotifications,
              public events: Events, public platform: Platform, public webProvider: WebProvider, private appRate: AppRate, private ga: GoogleAnalytics) {
    this.createLoadingMsg("");
    this.platform.ready().then((readySource) => {
      this.source = readySource;
      this.webProvider.source = readySource;
      this.subscribeNotificationEvents();
      this.initAppStartAdds();
      this.initAppStartRateMe();
      this.subscribeLoadingStatus();
      this.subscribePreciseLocationUpdateEvent();
      this.startMainProcess(readySource);
      this.subscribeResume();
    });
  }

  ionViewDidEnter() {
    console.log('Mainpage loaded.');
    this.platform.ready().then((readySource) => {
      this.initAnalytics();
    });

  }

  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('v2Main');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics. err:' + e);

      });
  }

  private subscribeResume() {
    this.platform.resume.subscribe(() => {
      this.resume();
    });
  }


  private subscribeNotificationEvents() {
    this.events.subscribe("hadisNotificationReceived", hadis => {
      this.navCtrl.push('ReadHadithPage', {hadis: hadis});
    });
  }


  private startMainProcess(readySource) {
    this.wordingProvider.init(readySource).then(response => {
      this.dictionary = response.data;
      this.title = this.dictionary.prayerTime;
      this.loader.setContent(this.dictionary.pleaseWait);
      if (this.onlyOffline) {
        this.startupOfflineOnly();
      } else {
        this.startupRegularOnlineOfflineMix(response, readySource);
      }

    });
  }

  private startupOfflineOnly() {
    this.locationProvider.getLocationDuple("dom").then(response => {
      console.log("Location fetched.");
      let ld: LocationDuple = response.data;
      let date = new Date();
      this.webProvider.getCalendars(ld, date.getDay(), date).then(response => {
        console.log("Calendar response retrieved from server for offline only processing...");
        let cr: Array<CalendarResponse> = response.data;
        this.monthlyCalendarProvider.calendars = cr;
        this.monthlyCalendarProvider.calculateTimer().then(response => {
          console.log("Calculating offline times for offline only mode is completed.");
          this.startupData = response.data;
          console.log("Startup data for offline times:" + JSON.stringify(this.startupData));
          this.processOfflineStartup();
          this.loader.dismissAll(); // showing saved times.
        });
      });
    });

  }

  private startupRegularOnlineOfflineMix(response, readySource) {
    this.processOfflineTimes();
    this.locationProvider.initiate(readySource).then(response => {
      if (response.errorCode >= 0) {
        console.log("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
        this.webProvider.getStartupData(this.source).then(response => {
          this.loader.dismissAll();
          if (response.errorCode == 0) {
            this.processStartupData(response.data);
            console.log("WebSource live calculations are finished");
          } else {
            this.noInternet = true;
            //TODO Implement this after offline namaz vakitleri is available
            // this.showAlert(this.dictionary.failedToReceiveGPSText, this.dictionary.failedToReceiveGPSText, this.dictionary.ok);
          }
        });
      } else {
        this.loader.dismissAll();
        this.noGPS = true;
        this.showAlert(this.dictionary.failedToReceiveGPSText, this.dictionary.failedToReceiveGPSText, this.dictionary.ok);
      }
    });
  }

  private subscribeLoadingStatus() {
    this.events.subscribe('mainLoadingStatus', loadingStatus => {
      if (loadingStatus != null) {
        this.loader.setContent(loadingStatus);
      }
    });
  }

  private initAppStartRateMe() {
    setTimeout(() => {
      console.log("RATEMYAPP!!!");
      if (this.source != "dom") {
        this.appRate.preferences.storeAppURL = {
          ios: '4214214124',
          android: 'market://details?id=com.ionicframework.myapp244359'
        };

        this.appRate.promptForRating(true);
      }
    }, 10000);
  }

  private initAppStartAdds() {
    setTimeout(() => {
      this.adProvider.showInterstitial();
    }, 30000);
  }

  private processOfflineTimes() {
    this.monthlyCalendarProvider.getCalendars(this.source).then(response => {
      if (response.errorCode == 0) {
        this.monthlyCalendarProvider.calculateTimer().then(response => {
          if (response.errorCode == 0) {
            console.log("Offline calendar fetched from monthlyCalendarProvider");
            this.startupData = response.data;
            this.webProvider.startupData = this.startupData; // For other functions to share startup data.
            this.processOfflineStartup();
            this.loader.dismissAll(); // showing saved times.

            //Saving current new calendar to filesystem.
            this.saveNewCalendarBasedOnNewLocation();
          } else {
            console.log("Fetching calendar calculate timer response not good, respCode:" + response.errorCode);
            //TODO inspect codes.
            this.fetchAndSaveOfflineMonthlyCalendar();
          }
        });
      } else {
        console.log("Fetching calendar response not good, respCode:" + response.errorCode);
        this.fetchAndSaveOfflineMonthlyCalendar();
      }

    });
  }

  private saveNewCalendarBasedOnNewLocation() {
    try {
      //After showing offline times, trying to refresh offline times for current location.
      this.locationProvider.getLocationDuple(this.source).then(response => {
        if (response.errorCode == 0) {
          let newLd: LocationDuple = response.data;
          let date: Date = new Date();
          this.webProvider.getCalendars(newLd, date.getTime(), date).then(response => {
            if (response.errorCode == 0) {
              //New calendars based on current location is fetched. Now saving it to filesystem.
              this.monthlyCalendarProvider.saveCalendars(this.source, response.data);
            }
          });
        }
      });
    } catch (err) {
      //TODO Push failure
      console.log("Failed to retrieve new monthly calendar timings. err:" + err);
    }

  }

  private fetchAndSaveOfflineMonthlyCalendar() {
    setTimeout(() => {
      let date = new Date();
      let timeStamp = date.getTime();
      if (this.locationProvider.ld == null) {
        this.locationProvider.initiate(this.source).then(response => {
          if (response.errorCode >= 0) {
            console.log("Calculating monthly calendars for the first time");
            this.webProvider.getCalendars(this.locationProvider.ld, timeStamp, date).then(response => {
              if (response.errorCode >= 0) {
                this.saveCalendarData(response, timeStamp);
                console.log("Monthly calendars are saved to storage.");
              } else {
                console.log("Failed to retrieve calendars response:" + response.errorCode);
              }
            });

          } else {
            //TODO Do something.
            //No Location, No saved monthly calendar...
          }
        });
      } else {
        console.log("Location provider is ready, getting monthly calendars..");
        this.webProvider.getCalendars(this.locationProvider.ld, timeStamp, date).then(response => {
          if (response.errorCode >= 0) {
            this.saveCalendarData(response, timeStamp);
            console.log("offline processing ended");
          } else {
            console.log("Failed to retrieve calendars response:" + response.errorCode);
          }
        });
      }
    }, 5000);
  }

  private saveCalendarData(response, timeStamp: number) {
    this.monthlyCalendarProvider.saveCalendars(this.source, response.data);
    this.monthlyCalendarProvider.saveCalendarTS(timeStamp);
  }

  public processOfflineStartup() {
    let remainingTime = this.startupData.offlineTimerRemainingTS;
    let {hour, minute, second} = this.calculateTimerFields(remainingTime);
    this.offlineTimer = new Timer(hour, minute, second);
    this.tickOfflineTimer();
    this.offlineLoaded = true;
  }

  private calculateTimerFields(remainingTime: number) {
    console.log("Calculating remaining time:" + remainingTime);
    let hours = 1000 * 60 * 60;
    let minutes = 1000 * 60;
    let seconds = 1000;
    let hour = remainingTime / hours;
    hour = Math.floor(hour);
    console.log("Hour:" + hour);
    remainingTime = remainingTime - (hour * hours);
    let minute = remainingTime / minutes;
    minute = Math.floor(minute);
    console.log("Minute:" + minute);
    remainingTime = remainingTime - (minute * minutes);
    let second = remainingTime / seconds;
    second = Math.floor(second);
    console.log("Second:" + second);
    return {hour, minute, second};
  }


  private subscribePreciseLocationUpdateEvent() {
    this.events.subscribe('preciseLocationUpdated', locationDuple => {
      console.log("Updating times according to precise location update");
      this.webProvider.updateStartupData(locationDuple).then(response => {
        if (response.errorCode >= 0) {
          let startupNew: StartupData = response.data;
          if (startupNew.locationText != this.startupData.locationText) {
            this.startupData = startupNew;
            let countDownString: string = this.startupData.countDownRemaining;
            let timerVals = countDownString.split(":");
            this.timer = new Timer(Number(timerVals[0]), Number(timerVals[1]), Number(timerVals[2]));
            this.toastMsg("Location updated");
          }
        }
      });
    });
  }


  private resume() {
    console.log("Resuming app.");
    if (this.offlineLoaded && !this.loaded) {
      //Running on offline mode.
      this.monthlyCalendarProvider.calculateTimer().then(response => {
        this.processOfflineResume(response);
      });
    } else if (this.loaded) {
      //Running on online mode
      let requireReFetch: boolean = this.isRefetchReq();
      if (requireReFetch) {
        this.updateTimes();
      } else {
        this.updateOnlineTimerWithoutFetch();
      }
    }
    //TODO Add location change control. ( Postponed it to later sprint )
  }

  private updateOnlineTimerWithoutFetch() {
    let now: Date = new Date();
    let sd: StartupData = this.startupData;
    let imsakTime: string = sd.imsakTime;
    let gunesTime: string = sd.gunesTime;
    let ogleTime: string = sd.ogleTime;
    let ikindiTime: string = sd.ikindiTime;
    let aksamTime: string = sd.aksamTime;
    let yatsiTime: string = sd.yatsiTime;
    if (this.beforeTime(now, imsakTime)) {
      this.adjustTimer(now, this.timer, imsakTime);
      this.startupData.imsakClass = "subdued";
      this.startupData.gunesClass = "subdued";
      this.startupData.ogleClass = "subdued";
      this.startupData.ikindiClass = "subdued";
      this.startupData.aksamClass = "subdued";
      this.startupData.yatsiClass = "subduedd";
      this.startupData.namazText = this.dictionary.timeUntilImsak;
    } else if (this.beforeTime(now, gunesTime)) {
      this.adjustTimer(now, this.timer, gunesTime);
      this.startupData.imsakClass = "subduedd";
      this.startupData.gunesClass = "subdued";
      this.startupData.ogleClass = "subdued";
      this.startupData.ikindiClass = "subdued";
      this.startupData.aksamClass = "subdued";
      this.startupData.yatsiClass = "subdued";
      this.startupData.namazText = this.dictionary.timeUntilGunes;
    } else if (this.beforeTime(now, ogleTime)) {
      this.adjustTimer(now, this.timer, ogleTime);
      this.startupData.imsakClass = "subdued";
      this.startupData.gunesClass = "subduedd";
      this.startupData.ogleClass = "subdued";
      this.startupData.ikindiClass = "subdued";
      this.startupData.aksamClass = "subdued";
      this.startupData.yatsiClass = "subdued";
      this.startupData.namazText = this.dictionary.timeUntilOgle;
    } else if (this.beforeTime(now, ikindiTime)) {
      this.adjustTimer(now, this.timer, ikindiTime);
      this.startupData.imsakClass = "subdued";
      this.startupData.gunesClass = "subdued";
      this.startupData.ogleClass = "subduedd";
      this.startupData.ikindiClass = "subdued";
      this.startupData.aksamClass = "subdued";
      this.startupData.yatsiClass = "subdued";
      this.startupData.namazText = this.dictionary.timeUntilIkindi;
    } else if (this.beforeTime(now, aksamTime)) {
      this.adjustTimer(now, this.timer, aksamTime);
      this.startupData.imsakClass = "subdued";
      this.startupData.gunesClass = "subdued";
      this.startupData.ogleClass = "subdued";
      this.startupData.ikindiClass = "subduedd";
      this.startupData.aksamClass = "subdued";
      this.startupData.yatsiClass = "subdued";
      this.startupData.namazText = this.dictionary.timeUntilAksam;
    } else {
      this.adjustTimer(now, this.timer, yatsiTime);
      this.startupData.imsakClass = "subdued";
      this.startupData.gunesClass = "subdued";
      this.startupData.ogleClass = "subdued";
      this.startupData.ikindiClass = "subdued";
      this.startupData.aksamClass = "subduedd";
      this.startupData.yatsiClass = "subdued";
      this.startupData.namazText = this.dictionary.timeUntilYatsi;
    }
  }

  private adjustTimer(now: Date, timer: Timer, time: string) {
    let nowTs: number = now.getTime();
    let targetTs: number = this.getTsOfTime(time);
    let differ: number = targetTs - nowTs;
    let hours = differ / (1000 * 60 * 60);
    hours = Math.floor(hours);
    differ = differ - (hours * 1000 * 60 * 60);
    let minutes = differ / (1000 * 60);
    minutes = Math.floor(minutes);
    differ = differ - (minutes * 1000 * 60);
    let seconds = differ / 1000;
    seconds = Math.floor(seconds);
    timer.hour = hours;
    timer.minutes = minutes;
    timer.seconds = seconds;
  }

  private beforeTime(now: Date, time: string): boolean {
    let tmpTs: number = this.getTsOfTime(time);
    return now.getTime() <= tmpTs;
  }

  private getTsOfTime(time: string): number {
    let tmp: Date = new Date();
    let vals = time.split(":");
    let hours: number = Number(vals[0]);
    let minutes: number = Number(vals[1]);
    tmp.setHours(hours);
    tmp.setMinutes(minutes);
    let tmpTs: number = tmp.getTime();
    return tmpTs;
  }

  private isRefetchReq(): boolean {
    let now: Date = new Date();
    let nowTS: number = now.getTime();
    let sdDate: Date = new Date();
    sdDate.setFullYear(this.startupData.year, this.startupData.month, this.startupData.day);
    let ishaTime: string = this.startupData.yatsiTime;
    let ishaHour: number = Number(ishaTime.split(":")[0]);
    let ishaMinute: number = Number(ishaTime.split(":")[1]);
    sdDate.setMinutes(ishaMinute);
    sdDate.setHours(ishaHour);
    let sdTS = sdDate.getTime();
    return nowTS >= sdTS;
  }

  private processOfflineResume(response) {
    if (response.errorCode == 0) {
      this.startupData = response.data;
      let remaining = this.startupData.offlineTimerRemainingTS;
      let {hour, minute, second} = this.calculateTimerFields(remaining);
      this.offlineTimer.hour = hour;
      this.offlineTimer.minutes = minute;
      this.offlineTimer.seconds = second;
    } else {
      //TODO implement
    }
  }


  public showAlert(title: string, content: string, buttonName: string) {
    let alert = this.alertController.create({
      title: title,
      subTitle: content,
      buttons: [buttonName]
    });
    alert.present();
  }

  private processStartupData(data: StartupData) {
    this.startupData = data;
    this.adProvider.initAds(this.source, this.startupData.adThreshold);
    let countDownString: string = this.startupData.countDownRemaining;
    let timerVals = countDownString.split(":");
    this.timer = new Timer(Number(timerVals[0]), Number(timerVals[1]), Number(timerVals[2]));
    this.tickTimer();
    this.eventsTodayEnabled = this.startupData.historyToday != null && this.startupData.historyToday.length > 0;
    this.loaded = true;
  }

  private tickTimer() {
    //TODO implement home&back functionality.
    setTimeout(() => {
      let timer = this.timer;
      let totalSeconds = (timer.hour * 60 * 60) + (timer.minutes * 60) + timer.seconds;
      if (totalSeconds == 0 || this.timer.displayTime() == "00:00:00") {
        this.updateTimes();
      } else {
        if (timer.seconds > 0) {
          timer.seconds--;
        } else if (timer.minutes > 0) {
          timer.minutes--;
          timer.seconds += 59;
        } else {
          timer.hour--;
          timer.minutes += 59;
          timer.seconds += 59;
        }
      }
      this.tickTimer();
    }, 1000);
  }

  private updateTimes() {
    let refetchNeeded: boolean = this.isRefetchReq();
    if (refetchNeeded) {
      this.updateTimesFromServer();
    } else {
      if (this.startupData.imsakClass == "subduedd") {
        this.startupData.imsakClass = "subdued";
        this.startupData.gunesClass = "subduedd";
        this.updateTimer(this.startupData.ogleTime, this.timer);
      } else if (this.startupData.gunesClass == "subduedd") {
        this.startupData.gunesClass = "subdued";
        this.startupData.ogleClass = "subduedd";
        this.updateTimer(this.startupData.ikindiTime, this.timer);
      } else if (this.startupData.ogleClass == "subduedd") {
        this.startupData.ogleClass = "subdued";
        this.startupData.ikindiClass = "subduedd";
        this.updateTimer(this.startupData.aksamTime, this.timer);
      } else if (this.startupData.yatsiClass == "subduedd") {
        this.startupData.yatsiClass = "subdued";
        this.startupData.imsakClass = "subduedd";
        this.updateTimer(this.startupData.gunesTime, this.timer);
      } else if (this.startupData.ikindiClass == "subduedd") {
        this.startupData.ikindiClass = "subdued";
        this.startupData.aksamClass = "subduedd";
        this.updateTimer(this.startupData.yatsiTime, this.timer);
      } else {
        //TODO push error, this branching should never occur.
      }
    }
  }

  private updateTimer(nextTime: string, timer: Timer) {
    let times = nextTime.split(":");
    let hour: number = Number(times[0]);
    let minutes: number = Number(times[1]);
    timer.hour = hour;
    timer.minutes = minutes;
  }

  private updateTimesFromServer() {
    console.log("Updating times...");
    let loader = this.loadingController.create({
      content: this.dictionary.updatingTimes
    });
    loader.present();
    this.locationProvider.getLocationDuple(this.source).then(locationResponse => {
      if (locationResponse.errorCode == 0) {
        let ld: LocationDuple = locationResponse.data;
        loader.setContent(this.dictionary.locationUpdatedNowGettingTimes);
        this.webProvider.updateStartupData(ld).then(response => {
          if (response.errorCode >= 0) {
            this.startupData = response.data;
            let countDownString: string = this.startupData.countDownRemaining;
            let timerVals = countDownString.split(":");
            this.timer = new Timer(Number(timerVals[0]), Number(timerVals[1]), Number(timerVals[2]));
            loader.dismissAll();
          } else {
            this.toastMsg(this.dictionary.noInternetFail);
            loader.dismissAll();
            //TODO Add offline functionality...
          }
        })
      } else {
        this.toastMsg(this.dictionary.failedToReceiveGPSText);
        loader.dismissAll();
      }
    });
  }

  private tickOfflineTimer() {
    //TODO implement home&back functionality.
    setTimeout(() => {
      let timer = this.offlineTimer;
      let totalSeconds = (timer.hour * 60 * 60) + (timer.minutes * 60) + timer.seconds;
      if (totalSeconds == 0) {
        //TODO implement this.
      } else {
        if (timer.seconds > 0) {
          timer.seconds--;
        } else if (timer.minutes > 0) {
          timer.minutes--;
          timer.seconds += 59;
        } else {
          timer.hour--;
          timer.minutes += 59;
          timer.seconds += 59;
        }
        if (!this.loaded) {
          this.tickOfflineTimer();
        }
      }
    }, 1000);
  }

  public getClassColor(className: string) {
    if (className == "subduedd") {
      return "#488aff";
    } else {
      return "black";
    }
  }

  public readQuran() {
    this.navCtrl.push('ReadQuran');
  }


  private createLoadingMsg(loadingMsg: string) {
    this.loader = this.loadingController.create({
      content: loadingMsg
    });
    this.loader.present();
  }

  public readHadis(hadis: Hadith) {
    this.navCtrl.push('ReadHadithPage', {hadis: hadis});
  }


  public toastMsg(msg: string) {
    let toast = this.toastController.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }

  public showClosestMosques() {
    this.navCtrl.push(NearbyMosquesPage);
  }

}

export class Timer {
  seconds: number;
  minutes: number;
  hour: number;

  constructor(h: number, m: number, s: number) {
    this.hour = h;
    this.minutes = m;
    this.seconds = s;
  }

  public displayTime(): string {
    let hourString: string = "0";
    let minuteString: string = "0";
    let secondsString: string = "0";
    if (this.hour < 10) {
      hourString += this.hour;
    } else {
      hourString = String(this.hour);
    }
    if (this.minutes < 10) {
      minuteString += this.minutes;
    } else {
      minuteString = String(this.minutes);
    }
    if (this.seconds < 10) {
      secondsString += this.seconds;
    } else {
      secondsString = String(this.seconds);
    }
    return hourString + ":" + minuteString + ":" + secondsString;
  }


}
