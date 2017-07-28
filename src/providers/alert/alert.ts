import {Injectable} from '@angular/core';
import {AlertController} from "ionic-angular";
import {WordingProvider} from "../wording-provider";

/*
  Generated class for the AlertProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AlertProvider {

  constructor(private alertController: AlertController, private wordingProvider: WordingProvider) {
    console.log('Hello AlertProvider Provider');
  }


  public presentAlert(title: string, message: string, buttonText = this.wordingProvider.dictionary.ok) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: [buttonText]
    });
    alert.present();
  }


}
