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
  offlineQuranAvailable: boolean = false;
  noGPS: boolean = false;
  noInternet: boolean = false;
  title: string = "";


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public toastController: ToastController,
              public wordingProvider: WordingProvider, private adProvider: InterstitialProvider,
              public alertController: AlertController, public loadingController: LoadingController, private localNotifications: LocalNotifications,
              public events: Events, public platform: Platform, public webProvider: WebProvider) {
    this.createLoadingMsg("");
    this.platform.ready().then((readySource) => {
      this.source = readySource;
      this.webProvider.source = readySource;
      setTimeout(() => {
        this.adProvider.showInterstitial();
      }, 30000);
      console.log('Platform ready from', readySource);
      this.events.subscribe('mainLoadingStatus', loadingStatus => {
        if (loadingStatus != null) {
          this.loader.setContent(loadingStatus);
        }
      });
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

      this.wordingProvider.init(readySource).then(response => {
        this.dictionary = response.data;
        this.title = this.dictionary.prayerTime;
        this.loader.setContent(this.dictionary.pleaseWait);
        this.locationProvider.initiate(readySource).then(response => {
          if (response.errorCode >= 0) {
            console.log("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
            this.webProvider.getStartupData(this.source).then(response => {
              this.loader.dismissAll();
              if (response.errorCode == 0) {
                this.processStartupData(response.data);
              } else {
                this.noInternet = true;
                //TODO Implement this after offline namaz vakitleri is available
                // this.showAlert(this.dictionary.failedToReceiveGPSText, this.dictionary.failedToReceiveGPSText, this.dictionary.ok);
                this.processOfflineStuff();
              }
            });
          } else {
            this.noGPS = true;
            this.showAlert(this.dictionary.failedToReceiveGPSText, this.dictionary.failedToReceiveGPSText, this.dictionary.ok);
            this.processOfflineStuff();
          }
        });
      });
    });
  }

  ionViewWillEnter() {
    console.log("Tobias");
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
    this.loaded = true;
  }

  private tickTimer() {
    //TODO implement home&back functionality.
    setTimeout(() => {
      let timer = this.timer;
      let totalSeconds = (timer.hour * 60 * 60) + (timer.minutes * 60) + timer.seconds;
      if (totalSeconds == 0) {
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
                this.tickTimer();
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
        this.tickTimer();
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

  public processOfflineStuff() {

  }

  public toastMsg(msg: string) {
    let toast = this.toastController.create({
      message: msg,
      duration: 3000
    });
    toast.present();
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
