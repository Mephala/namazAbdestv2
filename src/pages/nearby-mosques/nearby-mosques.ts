import {Component} from '@angular/core';
import {Events, Loading, LoadingController, NavController, NavParams, Platform} from 'ionic-angular';
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {LocationDuple, LocationProvider} from "../../providers/location";
import {WebProvider} from "../../providers/web-provider";
import {LaunchNavigator, LaunchNavigatorOptions} from '@ionic-native/launch-navigator';

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
              public webProvider: WebProvider, public loadingController: LoadingController, public platform: Platform, private launchNavigator: LaunchNavigator) {
    this.dictionary = this.wordingProvider.dictionary;
    this.load = false;
    this.loader = this.loadingController.create({
      content: this.dictionary.updatingYourLocation
    });
    this.loader.present();

    this.platform.ready().then((readySource) => {
      this.locationProvider.getLocationDuple(readySource).then(response => {
        if (response.errorCode == 0) {
          let duple: LocationDuple = response.data;
          this.loader.setContent(this.dictionary.findingMosquesNearby);
          this.webProvider.getMosques(duple, this.wordingProvider.preferredLanguage).then(response => {
            if (response.errorCode == 0) {
              this.mosques = response.data;
              this.load = true;
            } else {
              //TODO Handle error case
            }
            this.loader.dismissAll();

          });
        } else {
          this.loader.dismissAll();
          //TODO Handle no location error
        }
      });
    }, error => {
      //TODO Handle Fail.
      this.loader.dismissAll();
    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad NearbyMosquesPage');
  }

  public navigateTo(lat: number, lng: number) {
    let options: LaunchNavigatorOptions = {
      start: this.locationProvider.ld.lat + ", " + this.locationProvider.ld.lng
    };

    this.launchNavigator.navigate(lat + ", " + lng, options)
      .then(
        success => {
          alert('Launched navigator');
        },
        error => {
          alert('Error launching navigator:' + error + ", errJSON:" + JSON.stringify(error));
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
