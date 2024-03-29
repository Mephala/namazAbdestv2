import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {StartupData, WebProvider} from "./web-provider";
import {NativeStorage} from "@ionic-native/native-storage";
import {ServiceResponse} from "./location";
import {Dictionary, WordingProvider} from "./wording-provider";

/*
 Generated class for the MonthlyCalendarProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class MonthlyCalendarProvider {

  calendars: Array<CalendarResponse>;
  dictionary: Dictionary;

  constructor(public http: Http, private webProvider: WebProvider, private nativeStorage: NativeStorage, private wordingProvider: WordingProvider) {
    console.log('Hello MonthlyCalendarProvider Provider');
  }

  public getCalendars(source: string): Promise<ServiceResponse> {
    this.dictionary = this.wordingProvider.dictionary;
    return new Promise<ServiceResponse>(resolve => {
      if (source == "dom") {
        this.calendars = null;
        resolve(new ServiceResponse(-1, null));
      } else {
        this.nativeStorage.getItem("calendars").then(data => {
          console.log("Monthly-calendar is found in storage. Showing it quickly.");
          this.calendars = data;
          resolve(new ServiceResponse(0, this.calendars));
        }, error => {
          console.log("Calendar not saved in storage. err:" + error);
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


  public calculateTimer(): Promise<ServiceResponse> {
    if (this.dictionary == null) {
      this.dictionary = this.wordingProvider.dictionary;
    }
    return new Promise<ServiceResponse>(resolve => {
      let date: Date = new Date();
      let nowTS = date.getTime();
      let found: boolean = false;
      console.log("Searching in calendars:" + JSON.stringify(this.calendars));
      for (let cr of this.calendars) {
        let cresponse: CalendarResponse = cr;
        let datums: Array<Datum> = cresponse.data;
        for (let dt of datums) {
          let datum: Datum = dt;
          let timing: CTimings = datum.timings;
          let cdate = datum.date;
          let year: number = cdate.year;
          let month: number = cdate.month;
          let day: number = cdate.day;
          let ishaDate: Date = new Date();
          ishaDate.setFullYear(year, month, day);
          let ishaTime = timing.Isha;
          this.assignHourAndMinutes(ishaTime, ishaDate, day, month, year);
          let ishaTS = ishaDate.getTime();
          if (ishaTS > nowTS) {
            found = true;
            //Found current datum
            console.log("Found date for timings, day:" + day + ", month:" + month + ", year:" + year);
            console.log("Found offline datum:" + JSON.stringify(datum));
            let startupData: StartupData = this.calculateTimerFromTimings(datum, day, month, year);
            console.log("Monthly Calendar Provider calculated startupData:" + JSON.stringify(startupData));
            startupData.locationText = cr.clientLocationText;
            startupData.gregorianDateString = datum.date.readable;
            resolve(new ServiceResponse(0, startupData));
            break;
          }

        }
      }

      if (!found) {
        //Calendar is too old.
        resolve(new ServiceResponse(-1, null));
      }
    });
  }

  private assignHourAndMinutes(namazTime: string, namazDate: Date, day: number, month: number, year: number) {
    namazTime = namazTime.split(" ")[0];
    let hm: Array<string> = namazTime.split(":");
    let hour: number = Number(hm[0]);
    let minute: number = Number(hm[1]);
    namazDate.setHours(hour);
    namazDate.setMinutes(minute);
    namazDate.setDate(day);
    namazDate.setMonth(month);
    namazDate.setFullYear(year);
    // return {hm, hour, minute};
  }


  private calculateTimerFromTimings(datum: Datum, day: number, month: number, year: number): StartupData {
    console.log("Found timing:" + JSON.stringify(datum));
    let namazText = "";
    let startupData = new StartupData();
    startupData.namazText = namazText;
    startupData.imsakText = this.dictionary.imsakText;
    startupData.imsakTime = datum.timings.Imsak.split(" ")[0];
    startupData.gunesText = this.dictionary.gunesText;
    startupData.gunesTime = datum.timings.Sunrise.split(" ")[0];
    startupData.ogleText = this.dictionary.ogleText;
    startupData.ogleTime = datum.timings.Dhuhr.split(" ")[0];
    startupData.ikindiText = this.dictionary.ikindiText;
    startupData.ikindiTime = datum.timings.Asr.split(" ")[0];
    startupData.aksamText = this.dictionary.aksamText;
    startupData.aksamTime = datum.timings.Sunset.split(" ")[0];
    startupData.yatsiText = this.dictionary.yatsiText;
    startupData.yatsiTime = datum.timings.Isha.split(" ")[0];
    let imsak: boolean = false;
    let gunes: boolean = false;
    let ogle: boolean = false;
    let ikindi: boolean = false;
    let aksam: boolean = false;
    let timings = datum.timings;
    let now: Date = new Date();
    let nowTS = now.getTime();
    let pDate: Date = new Date();
    this.assignHourAndMinutes(timings.Imsak, pDate, day, month, year);
    let pTS = pDate.getTime();
    if (pTS >= nowTS) {
      imsak = true;
    } else {
      this.assignHourAndMinutes(timings.Sunrise, pDate, day, month, year);
      pTS = pDate.getTime();
      if (pTS >= nowTS) {
        gunes = true;
      } else {
        this.assignHourAndMinutes(timings.Dhuhr, pDate, day, month, year);
        pTS = pDate.getTime();
        if (pTS >= nowTS) {
          ogle = true;
        } else {
          this.assignHourAndMinutes(timings.Asr, pDate, day, month, year);
          pTS = pDate.getTime();
          if (pTS >= nowTS) {
            ikindi = true;
          } else {
            this.assignHourAndMinutes(timings.Sunset, pDate, day, month, year);
            pTS = pDate.getTime();
            if (pTS >= nowTS) {
              aksam = true;
            } else {
              this.assignHourAndMinutes(timings.Isha, pDate, day, month, year);
              pTS = pDate.getTime();
            }
          }
        }
      }
    }
    if (imsak) {
      namazText = this.dictionary.timeUntilImsak;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subduedd";
    } else if (gunes) {
      namazText = this.dictionary.timeUntilGunes;
      startupData.imsakClass = "subduedd";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
    } else if (ogle) {
      namazText = this.dictionary.timeUntilOgle;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subduedd";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
    } else if (ikindi) {
      namazText = this.dictionary.timeUntilIkindi;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subduedd";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
    } else if (aksam) {
      namazText = this.dictionary.timeUntilAksam;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subduedd";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
    } else {
      namazText = this.dictionary.timeUntilYatsi;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subduedd";
      startupData.yatsiClass = "subdued";
    }
    startupData.offlineTimerRemainingTS = pTS - nowTS;
    startupData.namazText = namazText;
    return startupData;
  }

  public saveCalendarTS(timeStamp: number) {
    this.nativeStorage.setItem("lastCalendarCalculationTS", timeStamp);
  }
}


export class CalendarResponse {
  data: Array<Datum>;
  clientLocationText: string;

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
  Fajr: string;
  Sunrise: string;
  sunriseTS: number;
  Dhuhr: string;
  dhuhrTS: number;
  Asr: string;
  asrTS: number;
  Sunset: string;
  sunsetTS: number;
  Maghrib: string;
  Isha: string;
  ishaTS: number;
  Imsak: string;
  imsakTS: number;
  midnight: string;

  constructor() {
  }

}

export class CDate {
  readable: string;
  year: number;
  month: number;
  day: number;

  constructor() {
  }
}
