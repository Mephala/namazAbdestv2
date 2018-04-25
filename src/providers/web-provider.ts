import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import {LocationDuple, LocationProvider, ServiceResponse} from "./location";
import {WordingProvider} from "./wording-provider";
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import {CalendarResponse} from "./monthly-calendar-provider";
import {Events} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";

/*
 Generated class for the WebProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class WebProvider {

  appToken: string = "21891fh8291f2812192819h8129f8h34729fh7))_(8128ddh218hf7fh71f21hj1299d218912777898"; //default
  // serverRoot: string = "http://192.168.1.105:8080/namazAppServer";
  serverRoot: string = "http://ec2-52-27-157-90.us-west-2.compute.amazonaws.com";
  version: string = "2.1.2";
  timeout: number = 30000;
  startupData: StartupData;
  regt: string = "";
  pushAllowed: boolean = true;
  turkishKuran: Kuran;
  source: string;
  noInternet: boolean = false;

  constructor(public http: Http, public locationProvider: LocationProvider, public wordingProvider: WordingProvider, private push: Push, public events: Events, private nativeStorage: NativeStorage) {
    console.log('Hello WebProvider Provider');
  }


  public getStartupData(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {

      if (source != "dom") {
        // to check if we have permission.
        this.push.hasPermission()
          .then((res: any) => {

            if (res.isEnabled) {
              this.processPush(resolve);
            } else {
              try {
                // Trying anyways to trigger Apple push permissions.
                this.processPush(resolve);
              } catch (err) {
                alert("Failed to init push process...");
                console.log('We do not have permission and received error after trying err:' + err);
                this.pushError("Code 15", "Push init error received:" + err);
                this.pushAllowed = false;
                this.resolveStartup(resolve);
              }
            }
          });
      } else {
        // alert("Resolving startup without push settings...");
        this.resolveStartup(resolve);
      }
    });
  }

  private processPush(resolve) {
    console.log('We have permission to send push notifications');
    // to initialize push notifications

    const options: PushOptions = {
      android: {
        senderID: '925153129457'
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {}
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: any) => {

      console.log("Received notification:" + JSON.stringify(notification));
      if (notification.additionalData.type == 0) {
        let pushNotificationMessage = notification.additionalData.hadisId;
        if (notification.additionalData.coldstart) {
          console.log("Coldstart notification received, processing data...");
          //Uygulama kapaliyken geldiyse goster
          this.events.publish("hadisNotificationReceived", pushNotificationMessage);
        }
      }

    });

    pushObject.on('registration').subscribe((registration: any) => {
      this.regt = registration.registrationId;
      this.appToken = this.regt;
      this.resolveStartup(resolve);
    });

    pushObject.on('error').subscribe(error => {
      alert("Push error!!! :" + JSON.stringify(error));
      console.log('Error with Push plugin, problem:' + JSON.stringify(error));
      this.resolveStartup(resolve);
    });
  }

  public updateStartupData(locationDuple: LocationDuple): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      let lat = locationDuple.lat;
      let lng = locationDuple.lng;
      let time = new Date();
      let timeStamp = time.getTime();
      console.log("Startup timestamp:" + timeStamp);
      let day = time.getDate();
      let month = time.getMonth();
      let preferredLanguage = this.wordingProvider.preferredLanguage;
      let response: StartupData;
      this.http.get(this.serverRoot + "/getStartupData?lat=" + lat + "&longt=" + lng + "&regt=" + this.regt + "&time=" + time +
        "&day=" + day + "&month=" + month + "&preferredLanguage=" + preferredLanguage + "&timeStamp=" + timeStamp + "&callType=cache&version=" + this.version, options).timeout(this.timeout).map(res => {
        console.log(res.json());
        console.log("-----------------------------------");
        console.log(JSON.stringify(res.json()));
        response = res.json();
      }).subscribe(data => {
        this.startupData = response;
        this.assignDateParams(time);
        resolve(new ServiceResponse(0, response));
      }, (err) => {
        this.noInternet = true;
        console.log("Failed http request:" + err);
        resolve(new ServiceResponse(-1, JSON.stringify(err)));
      });
    });
  }


  private resolveStartup(resolve) {
    let options = this.getOptions();
    let locationDuple = this.locationProvider.ld;
    let lat = locationDuple.lat;
    let lng = locationDuple.lng;
    let time = new Date();
    let timeStamp = time.getTime();
    console.log("Startup timestamp:" + timeStamp);
    let day = time.getDate();
    let month = time.getMonth();
    let preferredLanguage = this.wordingProvider.preferredLanguage;
    let response: StartupData;
    this.http.get(this.serverRoot + "/getStartupData?lat=" + lat + "&longt=" + lng + "&regt=" + this.regt + "&time=" + time +
      "&day=" + day + "&month=" + month + "&preferredLanguage=" + preferredLanguage + "&timeStamp=" + timeStamp + "&callType=cache&version=" + this.version, options).timeout(this.timeout).map(res => {
      response = res.json();
    }).subscribe(data => {
      this.startupData = response;
      if (this.startupData.errorFound) {
        resolve(new ServiceResponse(-1, "Error"));
      } else {
        this.assignDateParams(time);
        resolve(new ServiceResponse(0, response));
      }
    }, (err) => {
      this.noInternet = true;
      console.log("Failed http request:" + err);
      resolve(new ServiceResponse(-1, JSON.stringify(err)));
    });
  }

  private assignDateParams(time: Date) {
    this.startupData.month = time.getMonth();
    this.startupData.year = time.getFullYear();
    this.startupData.day = time.getDate();
  }

  public loadMoreHadis(lastHadisId: string, hadisCount: number): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      let preferredLanguage = this.wordingProvider.preferredLanguage;
      let moreHadis: Array<Hadith>;
      this.http.get(this.serverRoot + "/loadMoreHadis?hadisCount=" + hadisCount + "&lastHadisId=" + lastHadisId + "&preferredLanguage=" + preferredLanguage,
        options).timeout(this.timeout).map(res => {
        moreHadis = res.json();
      }).subscribe(data => {
        resolve(new ServiceResponse(0, moreHadis));
      }, (err) => {
        console.log("Failed http request:" + err);
        resolve(new ServiceResponse(-1, JSON.stringify(err)));
      });
    });
  }

  public getTurkishKuran(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      let kuran: Kuran;
      this.http.get(this.serverRoot + "/getTurkishKuran", options).timeout(this.timeout).map(res => {
        kuran = res.json();
      }).subscribe(data => {
        this.turkishKuran = kuran;
        resolve(new ServiceResponse(0, this.turkishKuran));
      }, (err) => {
        console.log("Failed http request:" + err);
        resolve(new ServiceResponse(-1, JSON.stringify(err)));
      });
    });
  }


  private getOptions(): RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf8');
    headers.append('appToken', this.appToken);
    let options = new RequestOptions({headers: headers});
    return options;
  }


  public saveSettings(wantsDaily: boolean, wantsSpecial: boolean, wantsLocal: boolean, wantsKuran: boolean): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      this.http.get(this.serverRoot + "/updateSettings?wantsDailyHadis=" + wantsDaily + "&wantsSpecialDayMessage=" + wantsSpecial
        + "&wantsLocalNotification=" + wantsLocal + "&wantsKuranDownloaded=" + wantsKuran, options).timeout(this.timeout).map(res => {
      }).subscribe(data => {
        resolve(new ServiceResponse(0, null));
      }, (err) => {
        console.log("Failed http request:" + err);
        resolve(new ServiceResponse(-1, JSON.stringify(err)));
      });
    });
  }

  public getCalendars(ld: LocationDuple, timeStamp: number, date: Date): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      let cresponse: Array<CalendarResponse>;
      this.http.get(this.serverRoot + "/getMonthlyNamazTimes?lat=" + ld.lat + "&longt=" + ld.lng + "&timeStamp=" + timeStamp + "&time=" + date + "&preferredLanguage=" +
        this.wordingProvider.preferredLanguage + "&year=" + date.getFullYear() + "&month=" + date.getMonth() + "&day=" + date.getDate() + "&hour=" + date.getHours() + "&minute=" + date.getMinutes()
        + "&second=" + date.getSeconds() + "&tzOffset=" + date.getTimezoneOffset(), options).timeout(this.timeout).map(res => {
        cresponse = res.json();
      }).subscribe(data => {
        resolve(new ServiceResponse(0, cresponse));
      }, (err) => {
        console.log("Failed http request:" + err);
        resolve(new ServiceResponse(-1, JSON.stringify(err)));
      });
    });
  }

  public rateAppFinished(result: string) {
    try {
      let options = this.getOptions();
      this.http.get(this.serverRoot + "/rateAppCompleted?result=" + result, options).timeout(this.timeout).map(res => {
      }).subscribe(data => {
      }, (err) => {
        console.log("Failed http request:" + err);
        this.pushError("Code 12", 'Failed to submit rate my app decision' + JSON.stringify(err));
      });
    } catch (err) {
      console.log("Failed to make rate my app request. err:" + err);
      this.pushError("Code 13", 'Failed to submit rate my app decision' + err);
    }
  }

  public getMosques(ld: LocationDuple, preferredLanguage: string): Promise<WebResponse> {
    return new Promise<WebResponse>(resolve => {
      let options = this.getOptions();
      let webResponse: WebResponse;
      this.http.get(this.serverRoot + "/getNearbyMosques?lat=" + ld.lat + "&lng=" + ld.lng + "&preferredLanguage=" + preferredLanguage, options).timeout(this.timeout).map(res => {
        webResponse = res.json();
      }).subscribe(data => {
        resolve(webResponse);
      }, (err) => {
        console.log("Failed http request:" + err);
        webResponse = new WebResponse();
        webResponse.data = null;
        webResponse.code = -3;
        resolve(webResponse);
      });
    });
  }

  public saveWantsKuranOfflineSettings(value: boolean) {
    if (value != null) {
      this.nativeStorage.setItem("wantsQuranEnabledOffline", value).then(() => {
        console.log("Offline Quran read settings are saved as :" + value);
      }, error => {
        console.log("Offline Quran read settings failed to be saved on device:" + value);
      });
    }
  }


  public getWantsKuranOfflineSettings(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      try {
        this.nativeStorage.getItem("wantsQuranEnabledOffline").then(data => {
          if (data == null) {
            resolve(new ServiceResponse(-1, null));
          }
          resolve(new ServiceResponse(0, data));
        }, error => {
          this.pushError("Code 14", 'Failed to retrieve offline data from native storage' + JSON.stringify(error));
          console.log("Failed to get offline data from native storage");
          resolve(new ServiceResponse(-2, null));
        });
      } catch (err) {
        console.log("Failed to read from DB , err:" + err);
        resolve(new ServiceResponse(-3, null));
      }
    });
  }

  public pushError(code: string, details: string) {
    try {
      let options = this.getOptions();
      let preferredLanguage = this.wordingProvider.preferredLanguage;
      this.http.get(this.serverRoot + "/pushError?code=" + code + "&details=" + details + "&preferredLanguage=" + preferredLanguage, options).timeout(this.timeout).map(res => {

      }).subscribe(data => {
      }, (err) => {
        console.log("Failed http request:" + err);
      });
    } catch (err) {
      console.log("Failed to push error. err:" + err);
    }
  }

}

export class StartupData {
  informationTabTitle: string;
  hadisTabTitle: string;
  calendarTitle: string;
  namazText: string;
  importantDates: Array<ImportantDate>;
  previousHadith: Array<Hadith>;
  hadith: Array<Hadith>;
  locationText: string;
  namazCountDown: string;
  imsakText: string;
  imsakTime: string;
  gunesText: string;
  gunesTime: string;
  ogleText: string;
  ogleTime: string;
  ikindiText: string;
  ikindiTime: string;
  aksamText: string;
  aksamTime: string;
  yatsiText: string;
  yatsiTime: string;
  imsakClass: string;
  gunesClass: string;
  ogleClass: string;
  ikindiClass: string;
  aksamClass: string;
  yatsiClass: string;
  showNamazDayTimes: boolean;
  gregorianDateString: string;
  hicriDateString: string;
  errorFound: boolean;
  errorNotFound: boolean;
  errorMsg: string;
  specialDay: boolean;
  specialDayString: string;
  maxReadableHadisCount: number;
  settingsTabTitle: string;
  wantsDailyHadis: boolean;
  wantsSpecialDayMessages: boolean;
  kibleLocatorMsg: string;
  countDownRemaining: string;
  wantsLocalNotification: boolean;
  wantsKuranDownloaded: boolean;
  adThreshold: number;
  offlineTimerRemainingTS: number;
  day: number;
  month: number;
  year: number;
  historyToday: Array<string>;
  rateMyAppPrompt: boolean;

  constructor() {

  }
}

export class Hadith {
  id: string;
  title: string;
  text: string;
  avatar: string;
  htmlData: string;

  constructor() {

  }
}

export class ImportantDate {
  title: string;
  date: string;

  constructor() {

  }
}

export class Ayet {
  original: string;
  translation: string;

  constructor() {
  }
}

export class Sure {
  name: string;
  arabic: string;
  ayetList: Array<Ayet>;

  constructor() {
  }
}

export class Kuran {
  sureList: Array<Sure>;

  constructor() {
  }
}

export class PushNotificationMessage {
  type: number;
  data: any;
  title: string;
  message: string;

  constructor() {
  }
}

export class WebResponse {
  code: number;
  promptMsg: string;
  data: any;

  constructor() {
  }
}

