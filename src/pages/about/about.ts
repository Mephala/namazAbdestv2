import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {Hadith, WebProvider} from "../../providers/web-provider";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  hadisList: Array<Hadith>;

  constructor(public navCtrl: NavController, public webProvider: WebProvider) {
    this.hadisList = this.webProvider.startupData.previousHadith;
  }

  public readHadis(hadis: Hadith) {
    this.navCtrl.push('ReadHadithPage', {hadis: hadis});
  }

}
