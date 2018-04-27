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
  determinedLan: string;

  constructor(public globalization: Globalization, public events: Events) {
    console.log('Hello WordingProvider Provider');
  }

  public init(source: string): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      if (source != "dom") {
        this.globalization.getPreferredLanguage().then(res => {
          console.log("Determine preferred language:" + JSON.stringify(res));
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
        this.determinedLan = "tr";
        // this.preferredLanguage = "en-US";
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
      this.determinedLan = "tr";
    } else {
      this.createEnglishDictionary();
      this.determinedLan = "en";
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
    this.dictionary.hadisOfTheDay = "Günün Hadisi";
    this.dictionary.readQuran = "Kuran Okuyun";
    this.dictionary.failedToReceiveGPSTitle = "Lütfen Konum Bilgisini Aktive Ediniz";
    this.dictionary.failedToReceiveGPSText = "Cihazınızdan konum bilgisi alamadık. Lütfen en doğru zaman bilgisine ulaşmak için cihazınızın konum bilgisini aktive ediniz.";
    this.dictionary.checkYourInternetConnection = "İnternet Bağlantınızı Kontrol Ediniz";
    this.dictionary.activateGpsAndNet = "En güncel namaz vakitlerini görebilmek için lütfen konum bilginizi aktif, internet bağlantınızı çalışır duruma getiriniz";
    this.dictionary.noInternetFailExplanation = "Lütfen en güncel namaz vakitlerini alabilmek için internet bağlantınızı ve mobil konum izinlerini kontrol ediniz.";
    this.dictionary.noInternetFail = "Sisteme Bağlanılamıyor";
    this.dictionary.updatingTimes = "Vakitler güncelleniyor...";
    this.dictionary.locationUpdatedNowGettingTimes = "Konumunuz tespit edildi, sistemden güncel namaz vakitleri alınıyor...";
    this.dictionary.readQuranTitle = "Kuran-ı Kerim";
    this.dictionary.imsakText = "İmsak";
    this.dictionary.gunesText = "Güneş";
    this.dictionary.ogleText = "Öğle";
    this.dictionary.ikindiText = "İkindi";
    this.dictionary.aksamText = "Akşam";
    this.dictionary.yatsiText = "Yatsı";
    this.dictionary.timeUntilImsak = "İmsak vaktine kalan süre:";
    this.dictionary.timeUntilGunes = "Gün doğumuna kalan süre:";
    this.dictionary.timeUntilOgle = "Öğle vaktine kalan süre:";
    this.dictionary.timeUntilIkindi = "İkindi vaktine kalan süre:";
    this.dictionary.timeUntilAksam = "Akşam vaktine kalan süre:";
    this.dictionary.timeUntilYatsi = "Yatsı vaktine kalan süre:";
    this.dictionary.currentlyShowingOfflineData = "Şu anda sistemimize son bağlandığınız lokasyona ait namaz vakitlerini görmektesiniz. Yeniden bağlantı kurulduğunda lokasyon ve namaz bilgileri güncellenecektir.";
    this.dictionary.mosques = "Camiler";
    this.dictionary.updatingYourLocation = "Konum bilginiz yenileniyor...";
    this.dictionary.findingMosquesNearby = "Yakındaki camiler bulunuyor...";
    this.dictionary.navigate = "Adres Tarifi";
    this.dictionary.nearbyMosques = "Yakınınızdaki Camiler";
    this.dictionary.eventsOccuredToday = "Tarihte Bugün";
    this.dictionary.appName = "Namaz Vakitleri ve Dini Bilgiler";
    this.dictionary.canYouRateUs = "Uygulamamızdan memnun musunuz ?";
    this.dictionary.rateUsWontTakeMuchTime = "Uygulamamıza destek olmak, görmek istediğiniz özelliklerden bahsetmek ya da beğenmediğiniz yönlerini belirtmek için lütfen bize ulaşın.";
    this.dictionary.rateNoThanks = "Hayır, bir daha sorma";
    this.dictionary.rateDelay = "Sonra Hatırlat";
    this.dictionary.rateNow = "Şimdi Oy Ver";
    this.dictionary.noMosqueTitle = "Cami Bulunamadı";
    this.dictionary.noMosqueErrorDescription = "Üzgünüz, yakınınızdaki camileri arayamadık. Lütfen çalışan bir internet bağlantınızın olduğunu ve GPS paylaşımınızın açık olduğundan emin olup tekrar deneyiniz.";
    this.dictionary.activateGPS = "Lütfen cihazınızın GPS (Konum) özelliğinin aktif olduğundan, uygulamaya konum bilgisine erişim izni verdiğinizden ve cihazınızın konumunuzu tespit edebileceği bir ortamda olduğunuzdan emin olunuz.";
    this.dictionary.noGpsFail = "Konum Bilginize Erişemedik";
    this.dictionary.noGpsFailExplanation = "Lütfen cihazınızın GPS (Konum) özelliğinin aktif olduğundan, uygulamaya konum bilgisine erişim izni verdiğinizden ve cihazınızın konumunuzu tespit edebileceği bir ortamda olduğunuzdan emin olunuz.";
    this.dictionary.preciseLocationUpdateFailure = "Cihazınızdan şu anda bulunduğunuz konum bilgisini alamadık. Bilinen son konumunuza uygun bilgileri görmektesiniz. Lütfen GPS'in aktif ve Konum izinlerinin açık olduğundan emin olunuz.";
    this.dictionary.showingKuranFromWebBecauseYouDontWantItDownloaded = "Kuran okuyabilmeniz için sistemimizden gerekli bilgiler yükleniyor. Eğer Ayarlar -> Kuran İndir kısmını aktive ederseniz internet bağlantısı olmadan da Kuran okuyabilirsiniz.";
    this.dictionary.downloadingKuranFirstTimeOnly = "Kuran okuyabilmeniz için gerekli bilgiler sistemimizden alınıp cihazınıza yükleniyor. Bundan sonraki kullanımlarınızda internet bağlantınız olmadan da Kuran okuyabileceksiniz. Eğer telefonunuza yüklenmesini istemiyorsanız Ayarlar-> Kuran İndir bölümünde değişiklik yapabilirsiniz.";
    this.dictionary.yesclamation = "Evet!";
    this.dictionary.notReally = "Pek Sayılmaz";
    this.dictionary.doYouLikeUsingOurApp = "Uygulamamızdan memnun musunuz ?";
    this.dictionary.mindGivingUsFeedBack = "Lütfen fikirlerinizi paylaşın";
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
    this.dictionary.hadisOfTheDay = "Hadith of the day";
    this.dictionary.readQuran = "Read Quran";
    this.dictionary.failedToReceiveGPSTitle = "Please activate your location services";
    this.dictionary.failedToReceiveGPSText = "We can not receive your device's location properly, please ensure your location services are working in order to receive prayer times correctly";
    this.dictionary.checkYourInternetConnection = "Please Check Your Internet Connection";
    this.dictionary.activateGpsAndNet = "Please turn-on your GPS and mobile data to get latest prayer times";
    this.dictionary.noInternetFailExplanation = "Please turn-on your GPS and mobile data to get latest prayer times";
    this.dictionary.noInternetFail = "Fail to connect our servers";
    this.dictionary.updatingTimes = "Updating prayer times...";
    this.dictionary.locationUpdatedNowGettingTimes = "Your location is updated, now connecting servers...";
    this.dictionary.readQuranTitle = "Holy Quran";
    this.dictionary.imsakText = "Imsak";
    this.dictionary.gunesText = "Sun";
    this.dictionary.ogleText = "Dhuhr";
    this.dictionary.ikindiText = "Asr";
    this.dictionary.aksamText = "Maghrib";
    this.dictionary.yatsiText = "Isha";
    this.dictionary.timeUntilImsak = "Remaining time until Suhr:";
    this.dictionary.timeUntilGunes = "Remaining time until Sunrise:";
    this.dictionary.timeUntilOgle = "Remaining time until Dhuhr:";
    this.dictionary.timeUntilIkindi = "Remaining time until Asr:";
    this.dictionary.timeUntilAksam = "Remaining time until Maghrib:";
    this.dictionary.timeUntilYatsi = "Remaining time until Isha:";
    this.dictionary.currentlyShowingOfflineData = "You are now viewing offline data based on your last known location to our servers. After connection established with our servers, your location information and prayer times will updated. ";
    this.dictionary.mosques = "Mosques";
    this.dictionary.updatingYourLocation = "Updating your location information...";
    this.dictionary.findingMosquesNearby = "Getting nearby mosques...";
    this.dictionary.navigate = "Navigate";
    this.dictionary.nearbyMosques = "Nearby Mosques";
    this.dictionary.eventsOccuredToday = "Historical events for today";
    this.dictionary.appName = "Salah Times and Islamic Information";
    this.dictionary.canYouRateUs = "Would you mind rating our application ?";
    this.dictionary.rateUsWontTakeMuchTime = "Your opinion and support matters for us. Please let us know what you think!";
    this.dictionary.rateNoThanks = "No Thanks";
    this.dictionary.rateDelay = "Later";
    this.dictionary.rateNow = "Rate Now";
    this.dictionary.noMosqueTitle = "We couldn't find Mosques";
    this.dictionary.noMosqueErrorDescription = "Sorry, we failed to search for nearby mosques. Please ensure that your GPS is on and you have a working internet connection.";
    this.dictionary.activateGPS = "Please make sure that your device's GPS is on and you have given our app permission to reach your location data.";
    this.dictionary.noGpsFail = "Can't get your location";
    this.dictionary.noGpsFailExplanation = "Please make sure that your device's GPS is on and you have given our app permission to reach your location data.";
    this.dictionary.preciseLocationUpdateFailure = "We have failed to retrieve location data from your device. Please make sure GPS is on and Location Permissions are granted.";
    this.dictionary.showingKuranFromWebBecauseYouDontWantItDownloaded = "Connecting to our system for you to read Quran. Please notice that you can change this from Settings-> Download Quran so that you may read without active Internet connection.";
    this.dictionary.downloadingKuranFirstTimeOnly = "Getting necessary information from our system and downloading it to your device. From now on, you may read Quran without active internet connection. If you don't want anything to be stored in your phone, you may change Settings-> Download Quran to disable it.";
    this.dictionary.yesclamation = "Yes!";
    this.dictionary.notReally = "Not Really";
    this.dictionary.doYouLikeUsingOurApp = "Do you enjoy using our application";
    this.dictionary.mindGivingUsFeedBack = "Would you mind giving us a feed-back ?";
  }

}

export class Dictionary {
  wantDailyHadisToggleString: string;
  wantsSpecialDayMessagesToggleString: string;
  settingsTabTitle: string;
  failedToReceiveGPSTitle: string;
  failedToReceiveGPSText: string;
  checkYourInternetConnection: string;
  activateGpsAndNet: string;
  gettingReadyForTheFirstTime: string;
  prayerTime: string;
  hadiths: string;
  importantDays: string;
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
  hadisOfTheDay: string;
  readQuran: string;
  noInternetFailExplanation: string;
  noInternetFail: string;
  updatingTimes: string;
  locationUpdatedNowGettingTimes: string;
  readQuranTitle: string;
  imsakText: string;
  gunesText: string;
  ogleText: string;
  ikindiText: string;
  aksamText: string;
  yatsiText: string;
  timeUntilImsak: string;
  timeUntilGunes: string;
  timeUntilOgle: string;
  timeUntilIkindi: string;
  timeUntilAksam: string;
  timeUntilYatsi: string;
  currentlyShowingOfflineData: string;
  mosques: string;
  updatingYourLocation: string;
  findingMosquesNearby: string;
  navigate: string;
  nearbyMosques: string;
  eventsOccuredToday: string;
  appName: string;
  canYouRateUs: string;
  rateUsWontTakeMuchTime: string;
  rateNoThanks: string;
  rateDelay: string;
  rateNow: string;
  noMosqueTitle: string;
  noMosqueErrorDescription: string;
  activateGPS: string;
  noGpsFail: string;
  noGpsFailExplanation: string;
  preciseLocationUpdateFailure: string;
  showingKuranFromWebBecauseYouDontWantItDownloaded: string;
  downloadingKuranFirstTimeOnly: string;
  yesclamation: string;
  notReally: string;
  doYouLikeUsingOurApp: string;
  mindGivingUsFeedBack: string;

  constructor() {
  }
}
