import {Component} from "@angular/core";
import {IonicPage, Loading, LoadingController, NavController, NavParams} from "ionic-angular";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {Kuran, StartupData, Sure, WebProvider} from "../../providers/web-provider";
import {NativeStorage} from "@ionic-native/native-storage";

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


  constructor(public navCtrl: NavController, public navParams: NavParams, private nativeStorage: NativeStorage,
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
        this.nativeStorage.getItem("kuran").then(data => {
          if (data != null) {
            this.kuran = data;
            this.selectedSure = this.kuran.sureList[0]; //Fatiha
            this.loaded = true;
            console.log("Loading Kuran from device storage");
            loader.dismissAll();
          } else {
            this.loadQuranFromWeb(loader);
          }
        });
      } else {
        this.loadQuranFromWeb(loader);
      }
    } catch (err) {
      //TODO push err
      this.loadQuranFromWeb(loader);
    }

  }

  private loadQuranFromWeb(loader: Loading) {
    this.webProvider.getTurkishKuran().then(response => {
      if (response.errorCode == 0) {
        this.kuran = response.data;
        this.selectedSure = this.kuran.sureList[0]; //Fatiha
        this.loaded = true;
        if (this.startupData.wantsKuranDownloaded && this.webProvider.source != "dom") {
          this.nativeStorage.setItem("kuran", this.kuran);
        }
      } else {
        alert("Failed to get Kuran");
      }
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

  public selectSR(sr: Sure) {
    while (this.searchResultSureList.length) {
      this.searchResultSureList.pop();
    }
    this.selectedSure = sr;
    this.searchString = "";
  }

}
