import {Component} from "@angular/core";

import {AboutPage} from "../about/about";
import {ContactPage} from "../contact/contact";
import {HomePage} from "../home/home";
import {SettingsPage} from "../settings-page/settings-page";
import {Events} from "ionic-angular";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Title: string = " ";
  tab2Title: string = " ";
  tab3Title: string = " ";
  tab4Title: string = " ";
  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  tab4Root = SettingsPage;

  constructor(public events: Events) {
    this.events.subscribe('wordingsConstructed', dictionary => {
      console.log("Tab wordings are being constructed upon event fire");
      this.tab1Title = dictionary.prayerTime;
      this.tab2Title = dictionary.hadiths;
      this.tab3Title = dictionary.importantDays;
      this.tab4Title = dictionary.settingsTabTitle;
    });
  }
}
