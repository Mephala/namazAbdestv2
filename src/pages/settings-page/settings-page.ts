import {Component} from "@angular/core";
import {AlertController, LoadingController, NavController, NavParams, ToastController} from "ionic-angular";
import {StartupData, WebProvider} from "../../providers/web-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {NativeStorage} from "@ionic-native/native-storage";
import {LocationProvider} from "../../providers/location";

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-settings-page',
  templateUrl: 'settings-page.html',
})
export class SettingsPage {

  dictionary: Dictionary;
  startupData: StartupData;
  wantsDailyHadis: boolean;
  wantsSpecialDayMsg: boolean;
  wantsKuranDL: boolean;
  wantsLocalNotification: boolean;
  noInternet: boolean = false;
  loaded: boolean = false;
  noGps: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public webProvider: WebProvider, public alertController: AlertController,
              public loadingController: LoadingController, public wordingProvider: WordingProvider, private locationProvider: LocationProvider
    , private toastController: ToastController, private nativeStorage: NativeStorage) {
    this.noGps = this.locationProvider.ld == null;
    this.dictionary = this.wordingProvider.dictionary;
    this.noInternet = this.webProvider.noInternet;
    if (!this.noInternet && this.webProvider.startupData != null) {
      this.startupData = this.webProvider.startupData;
      this.wantsDailyHadis = this.startupData.wantsDailyHadis;
      this.wantsSpecialDayMsg = this.startupData.wantsSpecialDayMessages;
      this.wantsKuranDL = this.startupData.wantsKuranDownloaded;
      this.wantsLocalNotification = this.startupData.wantsLocalNotification;
      this.loaded = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage'); //Push.
  }

  public saveSettings() {
    if (this.webProvider.source == "dom") {
      alert("Settings are disabled for dom source. Sorry pal.");
      return;
    }
    let loader = this.loadingController.create({
      content: this.dictionary.pleaseWait
    });
    loader.present();

    this.webProvider.saveSettings(this.wantsDailyHadis, this.wantsSpecialDayMsg, this.wantsLocalNotification, this.wantsKuranDL).then(response => {
      loader.dismissAll();
      let msg = "";
      if (response.errorCode == 0) {
        msg = this.dictionary.settingsSavedSuccess;
        this.removeQuranFromStorageIfNecessary();
        this.webProvider.startupData.wantsLocalNotification = this.wantsLocalNotification;
        this.webProvider.startupData.wantsDailyHadis = this.wantsDailyHadis;
        this.webProvider.startupData.wantsKuranDownloaded = this.wantsKuranDL;
        this.webProvider.startupData.wantsSpecialDayMessages = this.wantsSpecialDayMsg;
        this.webProvider.saveWantsKuranOfflineSettings(this.wantsKuranDL);
      } else {
        msg = this.dictionary.settingsSavedError;
      }
      let toast = this.toastController.create({
        message: msg,
        duration: 3000
      });
      toast.present();

    });
  }


  private removeQuranFromStorageIfNecessary() {
    if (this.webProvider.startupData.wantsKuranDownloaded && !this.wantsKuranDL) {
      try {
        //Decided not to keep Quran on phone. Deleting from native storage.
        this.nativeStorage.remove("kuran");
      } catch (err) {
        //TODO Push error
        console.log("Failed to remove kuran from local Storage. err:" + err);
      }
    }
  }

  public saveSettingsQuran() {
    if (this.wantsKuranDL = false) {
      this.nativeStorage.remove("kuran");
    }
    this.saveSettings();
  }

  public showDownloadKuranTutorial() {
    let alert = this.alertController.create({
      title: this.dictionary.informative,
      subTitle: this.dictionary.whatIsdownloadKuran,
      buttons: [this.dictionary.ok]
    });
    alert.present();
  }

}
