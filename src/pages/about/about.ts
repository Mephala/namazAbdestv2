import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {Hadith, WebProvider} from "../../providers/web-provider";
import {InterstitialProvider} from "../../providers/interstitial-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  hadisList: Array<Hadith>;
  scrollingEnabled = false;
  noInternet: boolean;
  loaded: boolean;
  dictionary: Dictionary;

  constructor(public navCtrl: NavController, public webProvider: WebProvider, public adProvider: InterstitialProvider, private wordingProvider: WordingProvider, private ga: GoogleAnalytics) {
    this.noInternet = this.webProvider.noInternet;
    this.dictionary = this.wordingProvider.dictionary;
    console.log("Internet status:" + this.noInternet);
    if (!this.noInternet) {
      console.log("Processing load...");
      this.hadisList = this.webProvider.startupData.previousHadith;
      this.loaded = true;
    }
  }

  ionViewDidEnter() {
    console.log('HadisListPage loaded.');
    this.initAnalytics();
  }

  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('HadisList');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {console.log('Error starting GoogleAnalytics', e)

      });
  }

  public readHadis(hadis: Hadith) {
    this.adProvider.showInterstitial();
    this.navCtrl.push('ReadHadithPage', {hadis: hadis});
  }

  public getNextPage(infiniteScroll) {
    console.log("Loading more hadis...");
    this.adProvider.showInterstitial();
    let lastHadisId = this.hadisList[this.hadisList.length - 1].id;
    let hadisCount = this.hadisList.length;
    this.webProvider.loadMoreHadis(lastHadisId, hadisCount).then(response => {
      if (response.errorCode < 0) {
        console.log("Problem with loading more hadis");
        infiniteScroll.enable(false);
        //TODO Push error.
      } else {
        let moreHadis: Array<Hadith> = response.data;
        if (moreHadis == null || moreHadis.length == 0) {
          infiniteScroll.enable(false);
        } else {
          for (let newHadis of moreHadis) {
            this.hadisList.push(newHadis);
          }
          infiniteScroll.complete();
        }
      }
    });

  }

}
