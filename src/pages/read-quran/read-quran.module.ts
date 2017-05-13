import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {ReadQuran} from "./read-quran";

@NgModule({
  declarations: [
    ReadQuran,
  ],
  imports: [
    IonicPageModule.forChild(ReadQuran),
  ],
  exports: [
    ReadQuran
  ]
})
export class ReadQuranModule {
}
