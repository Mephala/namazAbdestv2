import {Component} from "@angular/core";
import {IonicPage, NavParams} from "ionic-angular";
import {Hadith} from "../../providers/web-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";

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
  dictionary: Dictionary;

  constructor(public navParams: NavParams, private wordingProvider: WordingProvider) {
    this.dictionary = this.wordingProvider.dictionary;
    this.hadis = this.navParams.get("hadis");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadHadithPage');
  }

}
