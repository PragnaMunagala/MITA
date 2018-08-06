import { NgModule } from "@angular/core";
import { TitleCasePipe } from "./title-case.pipe";
import { RomanizePipe } from "./romanize.pipe";

@NgModule({
  declarations: [
    TitleCasePipe,
    RomanizePipe
  ],
  providers: [
    TitleCasePipe,
    RomanizePipe
  ],
  exports: [
    TitleCasePipe,
    RomanizePipe
  ]
})
export class PipesModule { }
