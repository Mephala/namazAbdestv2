import {Component} from "@angular/core";
import {IonicPage, Loading, LoadingController, NavController, NavParams} from "ionic-angular";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {Kuran, StartupData, Sure, WebProvider} from "../../providers/web-provider";
import {NativeStorage} from "@ionic-native/native-storage";
import {InterstitialProvider} from "../../providers/interstitial-provider";

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
              public loadingController: LoadingController, public wordingProvider: WordingProvider,
              public webProvider: WebProvider) {
    this.dictionary = this.wordingProvider.dictionary;
    this.startupData = this.webProvider.startupData;
    let loader = this.loadingController.create({
      content: this.dictionary.pleaseWait
    });
    loader.present();

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
          console.log("Error fetching kuran from storage:" + error);
          console.log("Getting kuran from web....");
          this.loadQuranFromWeb(loader);
        });
      } else {
        console.log("User disabled saving kuran to storage. Loading it from web.");
        this.loadQuranFromWeb(loader);
      }
    } catch (err) {
      //TODO push err
      console.log("Device storage is not accessible. Getting kuran from web.");
      this.loadQuranFromWeb(loader);
    }

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
          this.nativeStorage.setItem('kuran', this.kuran);
        }
      } else {
        alert("Failed to get Kuran");
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
