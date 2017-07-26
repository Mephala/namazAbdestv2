import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {ImportantDate, WebProvider} from "../../providers/web-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  importantDayList: Array<ImportantDate>;
  dictionary: Dictionary;
  noInternet: boolean = false;
  loaded: boolean = false;

  constructor(public navCtrl: NavController, public webProvider: WebProvider, public wordingProvider: WordingProvider, private ga:GoogleAnalytics) {
    this.dictionary = this.wordingProvider.dictionary;
    this.noInternet = this.webProvider.noInternet;
    if (this.webProvider.startupData != null) {
      this.importantDayList = this.webProvider.startupData.importantDates;
      this.loaded = true;
    }


  }

  ionViewDidEnter() {
    console.log('Important dates list populated.');
    this.initAnalytics();
  }

  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('ImportantDates');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {console.log('Error starting GoogleAnalytics', e)

      });
  }

}
