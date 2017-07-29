import {Component} from "@angular/core";
import {IonicPage, Loading, LoadingController, NavController, NavParams} from "ionic-angular";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {Kuran, StartupData, Sure, WebProvider} from "../../providers/web-provider";
import {NativeStorage} from "@ionic-native/native-storage";
import {InterstitialProvider} from "../../providers/interstitial-provider";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AlertProvider} from "../../providers/alert/alert";

/**
 * Generated class for the ReadQuran page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-read-quran',
  templateUrl: 'read-quran.html',
})
export class ReadQuran {

  dictionary: Dictionary;
  kuran: Kuran;
  selectedSure: Sure;
  searchResultSureList: Array<Sure> = [];
  loaded: boolean = false;
  searchString: string;
  startupData: StartupData;
  sureNameList: Array<string> = [];
  selectedSureName: string;


  constructor(public navCtrl: NavController, public navParams: NavParams, private nativeStorage: NativeStorage, private adProvider: InterstitialProvider,
              public loadingController: LoadingController, public wordingProvider: WordingProvider, private alertProvider: AlertProvider,
              public webProvider: WebProvider, private ga: GoogleAnalytics) {
    this.dictionary = this.wordingProvider.dictionary;
    this.startupData = this.webProvider.startupData;
    let loader = this.loadingController.create({
      content: this.dictionary.pleaseWait
    });
    loader.present();

    if (this.startupData.wantsKuranDownloaded == null) {
      //Must be working in offline mode. Retrieving settings value from storage.
      this.webProvider.getWantsKuranOfflineSettings().then(response => {
        if (response.errorCode == 0) {
          this.startupData.wantsKuranDownloaded = response.data;
          this.loadQuran(loader);
        } else {
          //TODO add alerts based on error codes.
        }
      })
    } else {
      this.loadQuran(loader);
    }
  }

  private loadQuran(loader: Loading) {
    try {
      if (this.startupData.wantsKuranDownloaded) {
        this.nativeStorage.getItem('kuran').then(data => {
          if (data != null) {
            this.kuran = data;
            console.log("Kuran is retrieved from storage");
            this.selectedSure = this.kuran.sureList[0]; //Fatiha
            this.selectedSureName = this.selectedSure.name;
            let sureList: Array<Sure> = this.kuran.sureList;
            for (let sure of sureList) {
              this.sureNameList.push(sure.name);
            }
            this.loaded = true;
            loader.dismissAll();
          } else {
            console.log("Device storage empty, loading kuran from web.");
            this.loadQuranFromWeb(loader);
          }
        }, error => {
          //This might be first time user reading Quran from app, checking native storage for settings value; if it does not exist, set it.
          this.webProvider.getWantsKuranOfflineSettings().then(response => {
            if (response.errorCode != 0) {
              //settings does not exist or can't be fetched. Trying to set it nevertheless.
              this.webProvider.saveWantsKuranOfflineSettings(true);
            }
          });
          console.log("Error fetching kuran from storage:" + error);
          console.log("Getting kuran from web....");
          this.loadQuranFromWeb(loader);
          this.alertProvider.presentToast(this.dictionary.downloadingKuranFirstTimeOnly, 7000);
        });
      } else {
        console.log("User disabled saving kuran to storage. Loading it from web.");
        this.loadQuranFromWeb(loader);
        this.alertProvider.presentToast(this.dictionary.showingKuranFromWebBecauseYouDontWantItDownloaded, 3000);
      }
    } catch (err) {
      this.webProvider.pushError("Code 7","Device storage not accessible to get Kuran. err:" + err);
      console.log("Device storage is not accessible. Getting kuran from web. Problem:" + err);
      this.loadQuranFromWeb(loader);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad ReadQuranPage loaded.');
    this.initAnalytics();
  }

  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('ReadQuran');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e)

      });
  }

  private loadQuranFromWeb(loader: Loading) {
    this.webProvider.getTurkishKuran().then(response => {
      if (response.errorCode == 0) {
        this.kuran = response.data;
        this.selectedSure = this.kuran.sureList[0]; //Fatiha
        this.selectedSureName = this.selectedSure.name;
        let sureList: Array<Sure> = this.kuran.sureList;
        for (let sure of sureList) {
          this.sureNameList.push(sure.name);
        }
        this.loaded = true;
        if (this.startupData.wantsKuranDownloaded && this.webProvider.source != "dom") {
          console.log("Saving quran.");
          this.nativeStorage.setItem('kuran', this.kuran).then(() => {
            console.log("Saved quran")
          }, error => {
            console.log("Failed to save quran, problem:" + error + " , str:" + JSON.stringify(error));
          });
        }
      } else {
        console.log("Failed to get Kuran");
      }
      console.log("Fetched kuran from web. Dismissing loader");
      loader.dismissAll();
    });
  }


  public searchSure(ev: any) {
    let val = ev.target.value;
    if (val != null) {
      while (this.searchResultSureList.length) {
        this.searchResultSureList.pop(); //empty array.
      }
      val = val.toLowerCase();
      let sureler: Array<Sure> = this.kuran.sureList;
      for (let sure of sureler) {
        let sureName = sure.name;
        sureName = sureName.toLowerCase();
        if (sureName.includes(val)) {
          this.searchResultSureList.push(sure);
          if (this.searchResultSureList.length >= 5) {
            break;
          }
        }
      }
    } else {
      while (this.searchResultSureList.length) {
        this.searchResultSureList.pop(); //empty array.
      }
    }
  }

  public sureSelected() {
    this.adProvider.showInterstitial();
    let sureList: Array<Sure> = this.kuran.sureList;
    for (let sure of sureList) {
      if (this.selectedSureName == sure.name) {
        this.selectedSure = sure;
        break;
      }
    }
  }

  public selectSR(sr: Sure) {
    this.adProvider.showInterstitial();
    while (this.searchResultSureList.length) {
      this.searchResultSureList.pop();
    }
    this.selectedSure = sr;
    this.searchString = "";
  }

}
