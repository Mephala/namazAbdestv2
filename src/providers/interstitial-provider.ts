import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {AdMob} from "@ionic-native/admob";
import {Platform} from "ionic-angular";

/*
 Generated class for the InterstitialProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class InterstitialProvider {

  underDevelopment: boolean = false;  //FIXME remember to change this value before production.


  adMobAndroidBannerId: string = "ca-app-pub-5091865704377150/5386042224";
  adMobAndroidInterstitialId = "ca-app-pub-5091865704377150/7649267426";
  adMobIOSBannerId: string = "ca-app-pub-5091865704377150/9126000627";
  admobIOSInterstitialId: string = "ca-app-pub-5091865704377150/1602733824";
  bannerId: string;
  interstitialId: string;
  isTest: boolean = false;
  interstitialReady: boolean = false;
  adsDisabled: boolean = false;
  adThreshold: number;
  lastAdTimeStamp: number;
  init: boolean = false;

  constructor(public http: Http, private admob: AdMob, private platform: Platform) {
    console.log('Hello InterstitialProvider Provider');
  }

  public initAds(source: string, threshold: number) {
    if (!this.init) {
      this.init = true; //preventing multiple inits.
      console.log("Initializing Ads with threshold:" + threshold);
      this.adThreshold = threshold;
      if (this.adThreshold == null) {
        this.adsDisabled = true; // Server fail.
      }
      if (source == "dom") {
        this.adsDisabled = true;
      } else {
        this.lastAdTimeStamp = new Date().getTime() - 60000;
        if (this.underDevelopment) {
          this.isTest = true;
        }
        if (this.platform.is('android')) {
          this.bannerId = this.adMobAndroidBannerId;
          this.interstitialId = this.adMobAndroidInterstitialId;
        } else {
          this.bannerId = this.adMobIOSBannerId;
          this.interstitialId = this.admobIOSInterstitialId;
        }
        this.initBanner();
        this.prepInterstitial();
      }
    }
  }

  private prepInterstitial() {
    this.admob.prepareInterstitial({
      adId: this.interstitialId,
      autoShow: false,
      isTesting: this.isTest,
      position: this.admob.AD_POSITION.BOTTOM_CENTER
    }).then((inter) => {
      this.interstitialReady = true;
      console.log("Interstitial is ready and stored:" + inter);
    });
  }

  public showInterstitial() {
    if (!this.adsDisabled) {
      if (this.interstitialReady == true) {
        let now: number = new Date().getTime();
        let difference = now - this.lastAdTimeStamp;
        if (difference >= this.adThreshold) {
          console.log("Interstitial is ready and will be shown now.");
          alert("Destroying banner");
          this.admob.removeBanner();
          alert("Banner must have destroyed");
          this.admob.showInterstitial();
          this.admob.onAdDismiss().subscribe( () => {
             alert("You dismissed add, congratz.");
             this.initBanner();
          });
          this.lastAdTimeStamp = new Date().getTime();
          this.interstitialReady = false;
          this.prepInterstitial();
        } else {
          console.log("Threshold not reached yet, must wait until new ad.");
        }
      } else {
        console.log("Interstitial is not ready and will not be shown now.");
      }
    }
  }

  private initBanner() {
    if (!this.adsDisabled) {
      this.admob.createBanner({
        adId: this.bannerId,
        autoShow: true,
        isTesting: this.isTest,
        position: this.admob.AD_POSITION.BOTTOM_CENTER
      });
    }
  }


}
