import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {WebProvider} from "./web-provider";
import {NativeStorage} from "@ionic-native/native-storage";
import {ServiceResponse} from "./location";
import {Timer} from "../pages/home/home";

/*
 Generated class for the MonthlyCalendarProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class MonthlyCalendarProvider {

  calendars: Array<CalendarResponse>;

  constructor(public http: Http, private webProvider: WebProvider, private nativeStorage: NativeStorage) {
    console.log('Hello MonthlyCalendarProvider Provider');
  }

  public getCalendars(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      if (source == "dom") {
        this.calendars = null;
        resolve(new ServiceResponse(-1, null));
      } else {
        this.nativeStorage.getItem("calendars").then(data => {
          this.calendars = data;
          resolve(new ServiceResponse(0, this.calendars));
        }, error => {
          console.log("Calendar not saved in storage.");
          resolve(new ServiceResponse(-2, null));
        });
      }
    });
  }

  public saveCalendars(source: string, calendars: Array<CalendarResponse>): Promise<ServiceResponse> {
    this.calendars = calendars;
    return new Promise<ServiceResponse>(resolve => {
      if (source != "dom") {
        this.nativeStorage.setItem("calendars", calendars);
      }
      resolve(new ServiceResponse(0, this.calendars));
    });
  }


  public calculateTimer(): Timer {
    for (let cr of this.calendars) {
      let cresponse: CalendarResponse = cr;
      let datums: Array<Datum> = cresponse.data;
      for (let dt of datums) {
        let datum: Datum = dt;
        let timing: CTimings = datum.timings;
        if (timing.ishaTS > 0) {
          //Found current datum
          return this.calculateTimerFromTimings(datum);
        }
      }
    }
    return null;
  }

  private calculateTimerFromTimings(datum: Datum): Timer {
    console.log("Found timing:" + JSON.stringify(datum));
    return null;
  }
}


export class CalendarResponse {
  data: Array<Datum>;

  constructor() {
  }

}

export class Datum {
  timings: CTimings;
  date: CDate;

  constructor() {
  }
}

export class CTimings {
  fajr: string;
  sunrise: string;
  sunriseTS: number;
  dhuhr: string;
  dhuhrTS: number;
  asr: string;
  asrTS: number;
  sunset: string;
  sunsetTS: number;
  maghrib: string;
  isha: string;
  ishaTS: number;
  imsak: string;
  imsakTS: number;
  midnight: string;

  constructor() {
  }

}

export class CDate {
  readable: string;

  constructor() {
  }
}
