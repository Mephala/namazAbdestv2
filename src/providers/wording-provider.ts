import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {ServiceResponse} from "./location";
import {Globalization} from "@ionic-native/globalization";
import {Events} from "ionic-angular";


/*
 Generated class for the WordingProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class WordingProvider {

  dictionary: Dictionary;
  preferredLanguage: string;

  constructor(public globalization: Globalization, public events: Events) {
    console.log('Hello WordingProvider Provider');
  }

  public init(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      if (source != "dom") {
        this.globalization.getPreferredLanguage().then(res => {
          console.log("Determine preferred language:" + res);
          this.lanDetermined(res);
          this.events.publish('wordingsConstructed', this.dictionary);
          resolve(new ServiceResponse(0, this.dictionary));
        }).catch(e => {
          alert("Globalization error:" + e);
          console.log("Failed to determine preferred language, English as default is being used." + e);
          this.preferredLanguage = "en-Us";
          this.createEnglishDictionary();
          this.events.publish('wordingsConstructed', this.dictionary);
          resolve(new ServiceResponse(0, this.dictionary));
        });
      } else {
        console.log("Test configuration detected. Returning turkish dictionary as test defaults");
        this.preferredLanguage = "tr-test";
        this.createTurkishDictionary();
        this.events.publish('wordingsConstructed', this.dictionary);
        resolve(new ServiceResponse(0, this.dictionary));
      }
    });
  }

  private lanDetermined(lan) {
    let val = lan.value;
    this.preferredLanguage = val;
    if (val.startsWith("tr")) {
      this.createTurkishDictionary();
    } else {
      this.createEnglishDictionary();
    }
  }

  private createTurkishDictionary() {
    this.dictionary = new Dictionary();
    this.dictionary.pleaseWait = "Lütfen Bekleyiniz...";
    this.dictionary.gettingReadyForTheFirstTime = "Uygulama ilk kulanım için hazırlanıyor, konum bilgileriniz alınıyor...";
    this.dictionary.settingsTabTitle = "Ayarlar";
    this.dictionary.prayerTime = "Namaz Vakti";
    this.dictionary.hadiths = "Dini Bilgiler";
    this.dictionary.importantDays = "Önemli Günler";
    this.dictionary.wantsSpecialDayMessagesToggleString = "Özel Günler Mesaj Alımı";
    this.dictionary.wantDailyHadisToggleString = "Günlük Mesaj Alımı";
    this.dictionary.localNotifications = "Bir sonraki vakitte uyarı";
    this.dictionary.downloadKuran = "Kuran İndir";
    this.dictionary.whatIsdownloadKuran = "Eğer bu özellik aktif ise, Kuran'ın bir kopyası cihazınıza indirilir ve internet olmaksızın okuyabilirsiniz."
    this.dictionary.informative = "Bilgilendirme";
    this.dictionary.ok = "Tamam";
    this.dictionary.genericSuccessMsg = "İşleminiz başarıyla tamamlanmıştır.";
    this.dictionary.genericErrorMsg = "İşlem başarısız.";
    this.dictionary.settingsSavedSuccess = "Ayarlarınız sistemimize kaydedildi.";
    this.dictionary.settingsSavedError = "Ayarlarınızı kaydedemedik. Lütfen daha sonra deneyiniz.";


  }

  private createEnglishDictionary() {
    this.dictionary = new Dictionary();
    this.dictionary.pleaseWait = "Please wait...";
    this.dictionary.gettingReadyForTheFirstTime = "Application is getting ready for the first use...";
    this.dictionary.settingsTabTitle = "Settings";
    this.dictionary.prayerTime = "Prayer Times";
    this.dictionary.hadiths = "Information";
    this.dictionary.importantDays = "Holy-Days";
    this.dictionary.wantsSpecialDayMessagesToggleString = "Holy Days Notification";
    this.dictionary.wantDailyHadisToggleString = "Daily Information Notification";
    this.dictionary.localNotifications = "Notify next prayer time";
    this.dictionary.downloadKuran = "Holy Quran Download";
    this.dictionary.whatIsdownloadKuran = "If enabled, a copy of Holy Quran is downloaded on your device so you can read without internet connection.";
    this.dictionary.informative = "Information";
    this.dictionary.ok = "OK";
    this.dictionary.genericSuccessMsg = "Successfully completed your request";
    this.dictionary.genericErrorMsg = "Failed to process your request";
    this.dictionary.settingsSavedSuccess = "Your settings updated.";
    this.dictionary.settingsSavedError = "Failed to save your settings to our system.Please try again later.";
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
  localNotifications: string;
  downloadKuran: string;
  whatIsdownloadKuran: string;
  informative: string;
  ok: string;
  genericSuccessMsg: string;
  genericErrorMsg: string;
  settingsSavedSuccess: string;
  settingsSavedError: string;

  constructor() {
  }
}
