import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import {LocationProvider, ServiceResponse} from "./location";
import {WordingProvider} from "./wording-provider";
import {Push, PushObject, PushOptions} from "@ionic-native/push";

/*
 Generated class for the WebProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class WebProvider {

  appToken: string = "21891fh8291f2812192819h8129f8h34729fh7))_(8128ddh218hf7fh71f21hj1299d218912777898"; //default
  // serverRoot: string = "http://192.168.0.109:8080/namazAppServer";
  serverRoot: string = "http://ec2-52-27-157-90.us-west-2.compute.amazonaws.com";
  version: string = "2.0.0";
  timeout: number = 30000;
  startupData: StartupData;
  regt: string = "";
  pushAllowed: boolean = true;

  constructor(public http: Http, public locationProvider: LocationProvider, public wordingProvider: WordingProvider, private push: Push) {
    console.log('Hello WebProvider Provider');
  }


  public getStartupData(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {

      if (source != "dom") {
        // to check if we have permission
        this.push.hasPermission()
          .then((res: any) => {

            if (res.isEnabled) {
              console.log('We have permission to send push notifications');
              // to initialize push notifications

              const options: PushOptions = {
                android: {
                  senderID: '950472212062'
                },
                ios: {
                  alert: 'true',
                  badge: true,
                  sound: 'false'
                },
                windows: {}
              };

              const pushObject: PushObject = this.push.init(options);

              pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

              pushObject.on('registration').subscribe((registration: any) => {
                this.regt = registration.registrationId;
                this.resolveStartup(resolve);
              });

              pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
            } else {
              console.log('We do not have permission to send push notifications');
              this.pushAllowed = false;
              this.resolveStartup(resolve);
            }

          });


      } else {
        this.resolveStartup(resolve);
      }

    });
  }

  private resolveStartup(resolve) {
    let options = this.getOptions();
    let locationDuple = this.locationProvider.ld;
    let lat = locationDuple.lat;
    let lng = locationDuple.lng;
    let time = new Date();
    let day = time.getDate();
    let month = time.getMonth();
    let preferredLanguage = this.wordingProvider.preferredLanguage;
    let response: StartupData;
    this.http.get(this.serverRoot + "/getStartupData?lat=" + lat + "&longt=" + lng + "&regt=" + this.regt + "&time=" + time +
      "&day=" + day + "&month=" + month + "&preferredLanguage=" + preferredLanguage + "&callType=cache&version=" + this.version, options).timeout(this.timeout).map(res => {
      response = res.json();
    }).subscribe(data => {
      this.startupData = response;
      resolve(new ServiceResponse(0, response));
    }, (err) => {
      alert("Failed http request:" + err);
      resolve(new ServiceResponse(-1, JSON.stringify(err)));
    });
  }


  private getOptions(): RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf8');
    headers.append('appToken', this.appToken);
    let options = new RequestOptions({headers: headers});
    return options;
  }


  public handlePush(source: string) {

    if (source != "dom") {

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

