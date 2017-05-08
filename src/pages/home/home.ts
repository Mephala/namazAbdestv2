import {Component} from "@angular/core";
import {AlertController, Events, Loading, LoadingController, NavController, Platform} from "ionic-angular";
import {LocationProvider} from "../../providers/location";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {WebProvider} from "../../providers/web-provider";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  loader: Loading;
  dictionary: Dictionary;
  source: string;

  constructor(public navCtrl: NavController, public locationProvider: LocationProvider,
              public wordingProvider: WordingProvider,
              public alertController: AlertController, public loadingController: LoadingController, public events: Events, public platform: Platform, public webProvider: WebProvider) {
    this.createLoadingMsg("");
    this.platform.ready().then((readySource) => {
      this.source = readySource;
      console.log('Platform ready from', readySource);
      this.events.subscribe('mainLoadingStatus', loadingStatus => {
        if (loadingStatus != null) {
          this.loader.setContent(loadingStatus);
        }
      });
      this.wordingProvider.init().then(response => {
        this.dictionary = response.data;
        this.loader.setContent(this.dictionary.pleaseWait);
        this.locationProvider.initiate(readySource).then(response => {
          this.loader.dismissAll();
          if (response.errorCode >= 0) {
            console.log("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
            this.webProvider.getStartupData().then(response => {
              if (response.errorCode == 0) {
                console.log("Success:" + JSON.stringify(response.data));
              } else {
                alert("Fail:" + response.data);
              }
            });
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
