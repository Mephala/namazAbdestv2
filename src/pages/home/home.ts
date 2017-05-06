import {Component} from "@angular/core";
import {AlertController, Events, Loading, LoadingController, NavController} from "ionic-angular";
import {LocationProvider} from "../../providers/location";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  loader: Loading;

  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public alertController: AlertController, public loadingController: LoadingController, public events: Events) {
    this.createLoadingMsg("Please wait");
    this.events.subscribe('mainLoadingStatus', loadingStatus => {
      if (loadingStatus != null) {
        this.loader.setContent(loadingStatus);
      }
    });
    this.locationProvider.initiate().then(response => {
      this.loader.dismissAll();
      if (response.errorCode >= 0) {
        alert("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
      } else {
        alert("Large fail when retrieving location...");
      }
    });
  }


  private createLoadingMsg(loadingMsg: string) {
    this.loader = this.loadingController.create({
      content: loadingMsg
    });
    this.loader.present();
  }

}
