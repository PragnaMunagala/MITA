import { Routes } from "@angular/router";
import {ActiveIllnessesComponent} from "./active-illnesses.component";
import {IllnessesComponent} from "./illnesses/illnesses.component";

export const activeIllnessesRoutes: Routes = [
  { path: "activeIllnesses",
    component: ActiveIllnessesComponent,
    children: [
      { path: "", component: IllnessesComponent, data: {title: "Active Illnesses"} }
    ]
  }
];
