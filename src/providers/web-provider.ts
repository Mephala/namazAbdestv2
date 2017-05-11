import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import {LocationProvider, ServiceResponse} from "./location";
import {WordingProvider} from "./wording-provider";

/*
 Generated class for the WebProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class WebProvider {

  appToken: string = "21891fh8291f2812192819h8129f8h34729fh7))_(8128ddh218hf7fh71f21hj1299d218912777898"; //default
  serverRoot: string = "http://192.168.0.109:8080/namazAppServer";
  // serverRoot: string = "http://ec2-52-27-157-90.us-west-2.compute.amazonaws.com";
  version: string = "2.0.0";
  timeout: number = 30000;

  constructor(public http: Http, public locationProvider: LocationProvider, public wordingProvider: WordingProvider) {
    console.log('Hello WebProvider Provider');
  }


  public getStartupData(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      let options = this.getOptions();
      let locationDuple = this.locationProvider.ld;
      let lat = locationDuple.lat;
      let lng = locationDuple.lng;
      let time = new Date();
      let day = time.getDate();
      let month = time.getMonth();
      let preferredLanguage = this.wordingProvider.preferredLanguage;
      let regt = ""; // empty for now.
      let response: StartupData;
      this.http.get(this.serverRoot + "/getStartupData?lat=" + lat + "&longt=" + lng + "&regt=" + regt + "&time=" + time +
        "&day=" + day + "&month=" + month + "&preferredLanguage=" + preferredLanguage + "&callType=cache&version=" + this.version, options).timeout(this.timeout).map(res => {
        response = res.json();
      }).subscribe(data => {
        resolve(new ServiceResponse(0, response));
      }, (err) => {
        alert("Failed http request:" + err);
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

