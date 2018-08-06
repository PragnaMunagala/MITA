import { Routes }   from "@angular/router";
import { SummaryComponent } from "./views/summary/summary.component";
import { UserComponent } from "./views/user/user.component";
import { LogoutComponent } from "./views/logout/logout.component";
import { UserManagementComponent } from "./views/user-management/user-management.component";
import { AddUserComponent } from "./views/user-management/add-user/add-user.component";
import { IllnessTrackingComponent } from "./views/illness/illness-tracking/illness-tracking.component";
import { TaskComponent } from "./views/task/task.component";
import { MainGuard } from "./guards/main.guard";
import {ActiveIllnessesComponent} from "./views/active-illnesses/active-illnesses.component";

export const appRoutes: Routes = [{
    path: "",
    redirectTo: "summary",
    pathMatch: "full"
  }, {
    path: "logout",
    component: LogoutComponent,
    data: {
      title: "Logout",
      message: "You are now logged out."
    }
  }, {
    path: "inactive",
    component: LogoutComponent,
    data: {
      title: "You've been logged out",
      message: "You've been logged out after a period of inactivity."
    }
  }, {
    path: "user/:role",
    component: UserComponent,
    data: {title: "User"},
    canActivate: [MainGuard]
  }, {
    path: "summary",
    component: SummaryComponent,
    data: {title: "Summary"},
    canActivate: [MainGuard]
  }, {
    path: "users",
    component: UserManagementComponent,
    data: {title: "Users"},
    canActivate: [MainGuard]
  }, {
    path: "users/new",
    component: AddUserComponent,
    data: {title: "New User"},
    canActivate: [MainGuard]
  }, {
    path: "illness/tracking",
    component: IllnessTrackingComponent,
    data: {title: "Illnesses"},
    canActivate: [MainGuard]
  }, {
    path: "tasks",
    component: TaskComponent,
    data: {title: "Tasks"},
    canActivate: [MainGuard]
  }
];
