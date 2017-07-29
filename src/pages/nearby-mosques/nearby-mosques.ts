import {Component} from '@angular/core';
import {Events, Loading, LoadingController, NavController, NavParams, Platform} from 'ionic-angular';
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {LocationDuple, LocationProvider} from "../../providers/location";
import {WebProvider} from "../../providers/web-provider";
import {LaunchNavigator, LaunchNavigatorOptions} from '@ionic-native/launch-navigator';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AlertProvider} from "../../providers/alert/alert";

/**
 * Generated class for the NearbyMosquesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-nearby-mosques',
  templateUrl: 'nearby-mosques.html',
})
export class NearbyMosquesPage {

  dictionary: Dictionary;
  loader: Loading;
  mosques: Array<Mosque>;
  load: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public wordingProvider: WordingProvider, public locationProvider: LocationProvider,
              public webProvider: WebProvider, public loadingController: LoadingController, public platform: Platform, private launchNavigator: LaunchNavigator, private ga: GoogleAnalytics
    , private alertProvider: AlertProvider) {
    this.dictionary = this.wordingProvider.dictionary;
    this.load = false;
    this.loader = this.loadingController.create({
      content: this.dictionary.updatingYourLocation
    });
    this.loader.present();

    this.platform.ready().then((readySource) => {
      this.locationProvider.getLocationDuplePrecise(readySource).then(response => {
        if (response.errorCode == 0) {
          let duple: LocationDuple = response.data;
          this.loader.setContent(this.dictionary.findingMosquesNearby);
          this.webProvider.getMosques(duple, this.wordingProvider.preferredLanguage).then(response => {
            /**
             * status codes:
             * 1 = no result
             * 0 = ok result
             * -1 = Google or mosque search failure
             * -2 = Security or server failure
             * -3 = Network or client failure
             */

            if (response.code == 0) {
              this.mosques = response.data;
              this.load = true;
            } else if (response.code == 1) {
              this.mosques = null;
              this.load = true;
              this.alertProvider.presentAlert(this.dictionary.noMosqueTitle, response.promptMsg);
              this.navCtrl.pop();
            } else if (response.code == -1) {
              this.mosques = null;
              this.load = true;
              this.alertProvider.presentAlert(this.dictionary.noMosqueTitle, response.promptMsg);
              this.navCtrl.pop();
            } else {
              this.mosques = null;
              this.load = true;
              this.alertProvider.presentAlert(this.dictionary.noMosqueTitle, this.dictionary.noMosqueErrorDescription);
              this.navCtrl.pop();
            }
            this.loader.dismissAll();

          });
        } else {
          this.loader.dismissAll();
          this.alertProvider.presentAlert(this.dictionary.noMosqueTitle, this.dictionary.activateGPS);
          this.navCtrl.pop();
        }
      });
    }, error => {
      this.loader.dismissAll();
      this.alertProvider.presentAlert(this.dictionary.noMosqueTitle, this.dictionary.noMosqueErrorDescription);
      //TODO Push error
      this.navCtrl.pop();
    });
  }


  ionViewDidEnter() {
    console.log('ionViewDidLoad NearbyMosquesPage');
    this.initAnalytics();
  }

  private initAnalytics() {
    this.ga.startTrackerWithId('UA-58168418-2')
      .then(() => {
        console.log('Google analytics is ready now');
        this.ga.trackView('NearbyMosques');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e)

      });
  }

  public navigateTo(lat: number, lng: number) {
    try {
      this.ga.trackEvent("MosqueEvent", "MosqueNavigateEvent");
    } catch (err) {
      //TODO Push err
      console.log("Failed to track event, err:" + err);
    }

    let options: LaunchNavigatorOptions = {
      start: this.locationProvider.ld.lat + ", " + this.locationProvider.ld.lng
    };

    this.launchNavigator.navigate(lat + ", " + lng, options)
      .then(
        success => {
          console.log('Launched navigator');
        },
        error => {
          console.log('Error launching navigator:' + error + ", errJSON:" + JSON.stringify(error));
          //TODO Push Error.
        }
      )
  }

}

export class Mosque {


  mosqueName: string;

  lat: number;

  lng: number;

  vicinity: string;

  pictureHref: string;

  imageExists: boolean;
  vicinityExists: boolean;

  constructor() {
  }
}
