import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule }   from "@angular/router";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { assignmentRoutes } from "./assignments.routing";
import { AssignmentsService } from "./assignments.service";
import { AssignmentsComponent } from "./assignments.component";
import { TopHierarchyComponent } from "./top-hierarchy/top-hierarchy.component";
import { IllnessesGroupComponent } from "./illnessesGroup/illnessesgroup.component";
import { CoreComponent } from "./core/core.component";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
import { PipesModule } from "../../pipes/pipes.module";
import { AssignerComponent } from "./assigner/assigner.component";

@NgModule({
  declarations: [
    AssignmentsComponent,
    TopHierarchyComponent,
    IllnessesGroupComponent,
    CoreComponent,
    BreadcrumbsComponent,
    AssignerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(assignmentRoutes),
    NgbModule.forRoot(),
    PipesModule
  ],
  providers: [
    AssignmentsService,
    // RomanizePipe
  ]
})
export class AssignmentsModule { }
