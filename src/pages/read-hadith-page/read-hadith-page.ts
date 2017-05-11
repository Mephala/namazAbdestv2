import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Hadith} from "../../providers/web-provider";

/**
 * Generated class for the ReadHadithPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-read-hadith-page',
  templateUrl: 'read-hadith-page.html',
})
export class ReadHadithPage {

  hadis: Hadith;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.hadis = this.navParams.get("hadis");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadHadithPage');
  }

}
