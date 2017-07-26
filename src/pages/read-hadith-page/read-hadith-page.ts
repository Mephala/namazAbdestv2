import {Component} from "@angular/core";
import {Events, IonicPage, NavParams} from "ionic-angular";
import {Hadith} from "../../providers/web-provider";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

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

  constructor(public navParams: NavParams, private wordingProvider: WordingProvider, public events: Events, private ga: GoogleAnalytics) {
    this.dictionary = this.wordingProvider.dictionary;
    this.hadis = this.navParams.get("hadis");
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad ReadHadithPage');
    this.initAnalytics();
  }


  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('hadisReadScreen');
        this.ga.trackEvent("hadisReadEvent", "reading_" + this.hadis.id, this.hadis.id);
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e)

      });
  }

}
