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


  public calculateTimer(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      this.nativeStorage.getItem("lastCalendarCalculationTS").then(data => {
        let prevTS: number = data;
        let now: number = new Date().getTime();
        let offset: number = now - prevTS;
        this.applyOffsetToCalendars(offset);
        this.nativeStorage.setItem("lastCalendarCalculationTS", now).then(() => {
          for (let cr of this.calendars) {
            let cresponse: CalendarResponse = cr;
            let datums: Array<Datum> = cresponse.data;
            for (let dt of datums) {
              let datum: Datum = dt;
              let timing: CTimings = datum.timings;
              if (timing.ishaTS > 0) {
                //Found current datum
                let startupData: StartupData = this.calculateTimerFromTimings(datum);
                startupData.locationText = cr.clientLocationText;
                startupData.gregorianDateString = datum.date.readable;
                resolve(new ServiceResponse(0, startupData));
              }
            }
          }
          resolve(new ServiceResponse(-2, null));  // couldn't find what we look. Perhaps the client didn't connect to servers within 30 days ?
        }, error => {
          console.log("Failed to save calculation ts into device. Saved calendar is useless.");
          this.nativeStorage.remove("calendars");
          resolve(new ServiceResponse(-3, null));
        });
      }, error => {
        console.log("Failed to obtain last calendar calculationTS. Saved calendar is obsolete.");
        this.nativeStorage.remove("calendars");
        resolve(new ServiceResponse(-1, null));
      });
    });
  }

  private applyOffsetToCalendars(offset: number) {
    for (let cr of this.calendars) {
      let datums: Array<Datum> = cr.data;
      for (let dt of datums) {
        let timings: CTimings = dt.timings;
        timings.imsakTS = timings.imsakTS - offset;
        timings.sunriseTS = timings.sunriseTS - offset;
        timings.dhuhrTS = timings.dhuhrTS - offset;
        timings.asrTS = timings.asrTS - offset;
        timings.sunsetTS = timings.sunsetTS - offset;
        timings.ishaTS = timings.ishaTS - offset;
      }
    }
  }

  private calculateTimerFromTimings(datum: Datum): StartupData {
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
    let timings = datum.timings;
    if (timings.imsakTS > 0) {
      namazText = this.dictionary.timeUntilImsak;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subduedd";
      startupData.offlineTimerRemainingTS = timings.imsakTS;
    } else if (timings.sunriseTS > 0) {
      namazText = this.dictionary.timeUntilGunes;
      startupData.imsakClass = "subduedd";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
      startupData.offlineTimerRemainingTS = timings.sunriseTS;
    } else if (timings.dhuhrTS > 0) {
      namazText = this.dictionary.timeUntilOgle;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subduedd";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
      startupData.offlineTimerRemainingTS = timings.dhuhrTS;
    } else if (timings.asrTS > 0) {
      namazText = this.dictionary.timeUntilIkindi;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subduedd";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
      startupData.offlineTimerRemainingTS = timings.asrTS;
    } else if (timings.sunsetTS > 0) {
      namazText = this.dictionary.timeUntilAksam;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subduedd";
      startupData.aksamClass = "subdued";
      startupData.yatsiClass = "subdued";
      startupData.offlineTimerRemainingTS = timings.sunsetTS;
    } else {
      namazText = this.dictionary.timeUntilYatsi;
      startupData.imsakClass = "subdued";
      startupData.gunesClass = "subdued";
      startupData.ogleClass = "subdued";
      startupData.ikindiClass = "subdued";
      startupData.aksamClass = "subduedd";
      startupData.yatsiClass = "subdued";
      startupData.offlineTimerRemainingTS = timings.ishaTS;
    }
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

  constructor() {
  }
}
