import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {ImportantDate, WebProvider} from "../../providers/web-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  importantDayList: Array<ImportantDate>;
  dictionary: Dictionary;
  noInternet: boolean = false;

  constructor(public navCtrl: NavController, public webProvider: WebProvider, public wordingProvider: WordingProvider) {
    this.dictionary = this.wordingProvider.dictionary;
    this.noInternet = this.webProvider.noInternet;
    if (this.webProvider.startupData != null) {
      this.importantDayList = this.webProvider.startupData.importantDates;
    }

  }

}
