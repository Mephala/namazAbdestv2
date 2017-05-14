import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {Hadith, WebProvider} from "../../providers/web-provider";
import {InterstitialProvider} from "../../providers/interstitial-provider";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  hadisList: Array<Hadith>;
  scrollingEnabled = false;

  constructor(public navCtrl: NavController, public webProvider: WebProvider, public adProvider: InterstitialProvider) {
    this.hadisList = this.webProvider.startupData.previousHadith;
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
        console.log("More hadis response:" + JSON.stringify(response));
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
