import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadHadithPage');
  }

}
