import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {AdMob} from "@ionic-native/admob";
import {Platform} from "ionic-angular";
import {AdMobFree, AdMobFreeBannerConfig} from '@ionic-native/admob-free';

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
  banner: any;

  constructor(public http: Http, private admob: AdMob, private platform: Platform, private admobFree: AdMobFree) {
    console.log('Constructed Interstitial p.');
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
          console.log("Ads are being initiated for Android configuration.");
          this.bannerId = this.adMobAndroidBannerId;
          this.interstitialId = this.adMobAndroidInterstitialId;
          this.initBanner();
        } else {
          console.log("Ads are being initiated for IOS configuration.");
          this.bannerId = this.adMobIOSBannerId;
          this.interstitialId = this.admobIOSInterstitialId;
          this.initBannerIOS();
        }
        this.prepInterstitial();
      }
    }
  }

  private prepInterstitial() {
    this.admob.prepareInterstitial({
      adId: this.interstitialId,
      autoShow: false,
      isTesting: this.isTest,
      orientationRenew: true
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
          this.admob.showInterstitial();
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
        position: this.admob.AD_POSITION.BOTTOM_CENTER,
        orientationRenew: true,
        x: 0,
        y: 0,
        overlap: false
      }).then((banner) => {
        this.banner = banner;
        alert(JSON.stringify(banner));
      });
    }
  }

  private initBannerIOS() {
    if (!this.adsDisabled) {
      const bannerConfig: AdMobFreeBannerConfig = {
        id: this.bannerId,
        isTesting: false,
        autoShow: true,
        bannerAtTop: false
      };
      this.admobFree.banner.config(bannerConfig);
      this.admobFree.banner.prepare()
        .then(() => {
          // banner Ad is ready
          // if we set autoShow to false, then we will need to call the show method here
        })
        .catch(e => console.log(e));
    }
  }


}
