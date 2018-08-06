import { NgModule } from "@angular/core";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import {activeIllnessesRoutes} from "./active-illnesses.routing";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ActiveIllnessesComponent} from "./active-illnesses.component";
import {IllnessesComponent} from "./illnesses/illnesses.component";
import {HttpModule} from "@angular/http";
import {ActiveIllnessesService} from "./active-illnesses.service";

@NgModule({
  declarations: [
    ActiveIllnessesComponent,
    IllnessesComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    RouterModule.forRoot(activeIllnessesRoutes),
    NgbModule.forRoot(),
    HttpModule
  ],
  providers: [
    ActiveIllnessesService
  ]
})
export class ActiveIllnessesModule { }
