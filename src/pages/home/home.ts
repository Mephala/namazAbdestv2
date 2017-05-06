import {Component} from "@angular/core";
import {AlertController, Events, Loading, LoadingController, NavController, Platform} from "ionic-angular";
import {LocationProvider} from "../../providers/location";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  loader: Loading;
  dictionary: Dictionary;

  constructor(public navCtrl: NavController, public locationProvider: LocationProvider,
              public wordingProvider: WordingProvider,
              public alertController: AlertController, public loadingController: LoadingController, public events: Events, public platform: Platform) {
    this.createLoadingMsg("");
    this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      this.events.subscribe('mainLoadingStatus', loadingStatus => {
        if (loadingStatus != null) {
          this.loader.setContent(loadingStatus);
        }
      });
      this.wordingProvider.init().then(response => {
        this.dictionary = response.data;
        this.loader.setContent(this.dictionary.pleaseWait);
        this.locationProvider.initiate().then(response => {
          this.loader.dismissAll();
          if (response.errorCode >= 0) {
            alert("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
          } else {
            alert("Large fail when retrieving location...");
          }
        });
      });
    });
  }


  private createLoadingMsg(loadingMsg: string) {
    this.loader = this.loadingController.create({
      content: loadingMsg
    });
    this.loader.present();
  }

}
