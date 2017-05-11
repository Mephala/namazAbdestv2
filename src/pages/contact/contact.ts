import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {ImportantDate, WebProvider} from "../../providers/web-provider";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  importantDayList: Array<ImportantDate>;

  constructor(public navCtrl: NavController, public webProvider: WebProvider) {
    this.importantDayList = this.webProvider.startupData.importantDates;

  }

}
