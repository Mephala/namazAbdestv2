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
import {SettingsPage} from "../pages/settings-page/settings-page";
import {ReadHadithPage} from "../pages/read-hadith-page/read-hadith-page";
import {Push} from "@ionic-native/push";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SettingsPage,
    ReadHadithPage
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
    ReadHadithPage
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
