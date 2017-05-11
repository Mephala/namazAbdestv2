import {Component} from "@angular/core";
import {AlertController, Events, Loading, LoadingController, NavController, Platform} from "ionic-angular";
import {LocationProvider} from "../../providers/location";
import {Dictionary, WordingProvider} from "../../providers/wording-provider";
import {StartupData, WebProvider} from "../../providers/web-provider";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  loader: Loading;
  dictionary: Dictionary;
  source: string;
  startupData: StartupData;
  timer: Timer;
  loaded: boolean = false;

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
      this.wordingProvider.init(readySource).then(response => {
        this.dictionary = response.data;
        this.loader.setContent(this.dictionary.pleaseWait);
        this.locationProvider.initiate(readySource).then(response => {
          if (response.errorCode >= 0) {
            console.log("Code:" + response.errorCode + ", lat:" + response.data.lat + ", lng:" + response.data.lng);
            this.webProvider.getStartupData().then(response => {
              this.loader.dismissAll();
              if (response.errorCode == 0) {
                console.log("Success:" + JSON.stringify(response.data));
                this.processStartupData(response.data);
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

  private processStartupData(data: StartupData) {
    this.startupData = data;
    let countDownString: string = this.startupData.namazCountDown;
    let cds = countDownString.split(" ");
    let timerVals = cds[1].split(":");
    this.timer = new Timer(Number(timerVals[0]), Number(timerVals[1]), Number(timerVals[2]));
    this.tickTimer();
    this.loaded = true;
  }

  private tickTimer() {
    //TODO implement home&back functionality.
    setTimeout(() => {
      let timer = this.timer;
      let totalSeconds = (timer.hour * 60 * 60) + (timer.minutes * 60) + timer.seconds;
      if (totalSeconds == 0) {
        //TODO implement zero reach
      } else {
        if (timer.seconds > 0) {
          timer.seconds--;
        } else if (timer.minutes > 0) {
          timer.minutes--;
          timer.seconds += 59;
        } else {
          timer.hour--;
          timer.minutes += 59;
          timer.seconds += 59;
        }
        this.tickTimer();
      }
    }, 1000);
  }


  private createLoadingMsg(loadingMsg: string) {
    this.loader = this.loadingController.create({
      content: loadingMsg
    });
    this.loader.present();
  }

}

export class Timer {
  seconds: number;
  minutes: number;
  hour: number;

  constructor(h: number, m: number, s: number) {
    this.hour = h;
    this.minutes = m;
    this.seconds = s;
  }

  public displayTime(): string {
    let hourString: string = "0";
    let minuteString: string = "0";
    let secondsString: string = "0";
    if (this.hour < 10) {
      hourString += this.hour;
    } else {
      hourString = String(this.hour);
    }
    if (this.minutes < 10) {
      minuteString += this.minutes;
    } else {
      minuteString = String(this.minutes);
    }
    if (this.seconds < 10) {
      secondsString += this.seconds;
    } else {
      secondsString = String(this.seconds);
    }
    return hourString + ":" + minuteString + ":" + secondsString;
  }
}
