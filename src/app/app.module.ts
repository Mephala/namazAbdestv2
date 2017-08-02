import {ErrorHandler, NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {MyApp} from "./app.component";
import {LocationProvider} from "../providers/location";
import {AboutPage} from "../pages/about/about";
import {ContactPage} from "../pages/contact/contact";
import {HomePage} from "../pages/home/home";
import {TabsPage} from "../pages/tabs/tabs";
import {Geolocation} from "@ionic-native/geolocation";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {NativeStorage} from "@ionic-native/native-storage";
import {WordingProvider} from "../providers/wording-provider";
import {Globalization} from "@ionic-native/globalization";
import {WebProvider} from "../providers/web-provider";
import {HttpModule} from "@angular/http";
import {Push} from "@ionic-native/push";
import {SettingsPage} from "../pages/settings-page/settings-page";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {AdMob} from "@ionic-native/admob";
import {InterstitialProvider} from "../providers/interstitial-provider";
import {MonthlyCalendarProvider} from "../providers/monthly-calendar-provider";
import {AppRate} from "@ionic-native/app-rate";
import {NearbyMosquesPage} from "../pages/nearby-mosques/nearby-mosques";
import {LaunchNavigator} from '@ionic-native/launch-navigator';
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import { AlertProvider } from '../providers/alert/alert';
import {Diagnostic} from "@ionic-native/diagnostic";
import {AdMobFree} from "@ionic-native/admob-free";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SettingsPage,
    NearbyMosquesPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SettingsPage,
    NearbyMosquesPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LocationProvider,
    Geolocation,
    NativeStorage,
    WordingProvider,
    Globalization,
    WebProvider,
    Push,
    LocalNotifications,
    AdMob,
    InterstitialProvider,
    MonthlyCalendarProvider,
    AppRate,
    LaunchNavigator,
    GoogleAnalytics,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AlertProvider,
    Diagnostic
  ]
})
export class AppModule {
}
