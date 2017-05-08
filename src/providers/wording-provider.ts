import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {ServiceResponse} from "./location";
import {Globalization} from "@ionic-native/globalization";


/*
 Generated class for the WordingProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class WordingProvider {

  dictionary: Dictionary;
  preferredLanguage: string;

  constructor(public globalization: Globalization) {
    console.log('Hello WordingProvider Provider');
  }

  public init(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      if (source != "dom") {
        this.globalization.getPreferredLanguage().then(res => {
          console.log("Determine preferred language:" + res);
          this.lanDetermined(res);
          resolve(new ServiceResponse(0, this.dictionary));
        }).catch(e => {
          alert(e);
          console.log("Failed to determine preferred language, English as default is being used." + e);
          this.preferredLanguage = "en-Us";
          this.createEnglishDictionary();
          resolve(new ServiceResponse(0, this.dictionary));
        });
      } else {
        console.log("Test configuration detected. Returning turkish dictionary as test defaults");
        this.preferredLanguage = "tr-test";
        this.createTurkishDictionary();
        resolve(new ServiceResponse(0, this.dictionary));
      }
    });
  }

  private lanDetermined(lan) {
    let val = lan.value;
    this.preferredLanguage = val;
    alert("Determining language:" + lan.value + " , " + val.startsWith("tr"));
    if (val.startsWith("tr")) {
      alert("Creating tr dictionary");
      this.createTurkishDictionary();
    } else {
      this.createEnglishDictionary();
    }
  }

  private createTurkishDictionary() {
    this.dictionary = new Dictionary();
    this.dictionary.pleaseWait = "Lütfen Bekleyiniz...";
    this.dictionary.gettingReadyForTheFirstTime = "Uygulama ilk kulanım için hazırlanıyor, konum bilgileriniz alınıyor...";


  }

  private createEnglishDictionary() {
    this.dictionary = new Dictionary();
    this.dictionary.pleaseWait = "Please wait...";
    this.dictionary.gettingReadyForTheFirstTime = "Application is getting ready for the first use...";
  }

}

export class Dictionary {
  compassFunctionalityTutorial: string;
  kibleLocatorTutorialMsg: string;
  kibleLocatorHeadingMessage: string;
  wantDailyHadisToggleString: string;
  kibleLocatorMsg: string;
  wantsSpecialDayMessagesToggleString: string;
  settingsTabTitle: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  failedToReceiveGPSTitle: string;
  failedToReceiveGPSText: string;
  gatheringInformation: string;
  checkYourInternetConnection: string;
  activateGpsAndNet: string;
  gettingReadyForTheFirstTime: string;
  successfullyCreatedCachesForTheFirstTime: string;
  yourLocationIsSavedToOurServersForTheFirstUse: string;
  failedToWriteToDisk: string;
  pleaseAllowDiskWriting: string;
  prayerTime: string;
  hadiths: string;
  importantDays: string;
  back: string;
  errorMsg: string;
  disabledGpsTerminalMsg: string;
  disabledNetworkTerminalMsg: string;
  disabledGpsNonTerminalMsg: string;
  pleaseWait: string;
}