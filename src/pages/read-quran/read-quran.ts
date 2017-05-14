import {Component} from "@angular/core";
import {IonicPage, LoadingController, NavController, NavParams} from "ionic-angular";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {Kuran, WebProvider} from "../../providers/web-provider";

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingController: LoadingController, public wordingProvider: WordingProvider,
              public webProvider: WebProvider) {
    this.dictionary = this.wordingProvider.dictionary;
    let loader = this.loadingController.create({
      content: this.dictionary.pleaseWait
    });
    loader.present();
    this.webProvider.getTurkishKuran().then(response => {
      loader.dismissAll();
      if (response.errorCode == 0) {
        this.kuran = response.data;
      } else {
        alert("Failed to get Kuran");
      }
    });

  }


  public searchSure(ev: any) {
    let val = ev.target.value;
  }

}
