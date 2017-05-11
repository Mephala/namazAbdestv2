import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {ReadHadithPage} from "./read-hadith-page";

@NgModule({
  declarations: [
    ReadHadithPage,
  ],
  imports: [
    IonicPageModule.forChild(ReadHadithPage),
  ],
  exports: [
    ReadHadithPage
  ]
})
export class ReadHadithPageModule {
}
