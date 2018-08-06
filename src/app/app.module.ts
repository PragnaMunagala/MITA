import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule }   from "@angular/router";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppComponent } from "./app.component";
import { appRoutes } from "./app.routing";
import {
  APP_CONFIG,
  config,
  navItems,
  NAV_ITEMS } from "./app.config";
import {
  UserService,
  TaskService} from "./services";
import { NavComponent } from "./components/header/nav/nav.component";
import { HeaderComponent } from "./components/header/header.component";
import { HeaderUserComponent } from "./components/header/user/user.component";
import { AssignmentsModule } from "./views/assignments/assignments.module";

import { SummaryComponent } from "./views/summary/summary.component";
import { SummaryService } from "./views/summary/summary.service";
import { PipesModule } from "./pipes/pipes.module";
import { UserComponent } from "./views/user/user.component";
import { AuthService } from "./services/auth.service";
import { MainGuard } from "./guards/main.guard";
import { JwtHelper } from "angular2-jwt";
import { LogoutComponent } from "./views/logout/logout.component";
import { UserManagementComponent } from "./views/user-management/user-management.component";
import { UserTableComponent } from "./views/user-management/user-table/user-table.component";
import { DeleteUserModalComponent } from "./views/user-management/delete-user/delete-user.modal.component";
import { AddUserComponent } from "./views/user-management/add-user/add-user.component";
import { IllnessTrackingComponent } from "./views/illness/illness-tracking/illness-tracking.component";
import { IllnessTableComponent } from "./views/illness/illness-tracking/illness-table/illness-table.component";
import { IdleDetectorService } from "./services/idle-detector.service";
import { IllnessService } from "./services/illness.service";
import { TaskComponent } from "./views/task/task.component";
import { TaskTableComponent } from "./views/task/task-table/task-table.component";
import { IllnessProgressComponent } from "./views/illness/illness-tracking/illness-progress/illness-progress.component";
import { ModalService } from "./components/modal/modal.service";
import { ModalComponent } from "./components/modal/modal.component";
import { MITAErrorHandlerService } from "./components/error-handler/error-handler.service";
import { ErrorHandlerModalComponent } from "./components/error-handler/error-handler.component";
import { TaskIllnessTableComponent } from './views/task/task-illness-table/task-illness-table.component';
import {ActiveIllnessesModule} from "./views/active-illnesses/active-illnesses.module";

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HeaderComponent,
    SummaryComponent,
    UserComponent,
    HeaderUserComponent,
    LogoutComponent,
    UserManagementComponent,
    UserTableComponent,
    DeleteUserModalComponent,
    AddUserComponent,
    IllnessTrackingComponent,
    IllnessTableComponent,
    TaskComponent,
    TaskTableComponent,
    IllnessProgressComponent,
    ModalComponent,
    ErrorHandlerModalComponent,
    TaskIllnessTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    AssignmentsModule,
    PipesModule,
    ActiveIllnessesModule
  ],
  providers: [
    { provide: NAV_ITEMS, useValue: navItems },
    { provide: APP_CONFIG, useValue: config },
    { provide: ErrorHandler, useClass: MITAErrorHandlerService },
    UserService,
    TaskService,
    SummaryService,
    IdleDetectorService,
    IllnessService,
    AuthService,
    ModalService,
    MainGuard,
    JwtHelper
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DeleteUserModalComponent,
    ModalComponent,
    ErrorHandlerModalComponent
  ]
})
export class AppModule { }
