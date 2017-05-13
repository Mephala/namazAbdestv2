import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadQuran');
  }

  public searchSure(ev: any) {
    let val = ev.target.value;
  }

}
