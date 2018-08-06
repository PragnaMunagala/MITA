import { Routes }   from "@angular/router";
import {
  AssignmentsComponent,
  CoreComponent } from "./index";
import { TopHierarchyComponent } from "./top-hierarchy/top-hierarchy.component";
import { IllnessesGroupComponent } from "./illnessesGroup/illnessesgroup.component";

export const assignmentRoutes: Routes = [
  { path: "assignments",
    component: AssignmentsComponent,
    children: [
      { path: "", component: CoreComponent},
      { path: ":role", redirectTo: ":role/chapter"},
      { path: ":role/chapter", component: TopHierarchyComponent, data: {title: "Assignment - Chapter"} },
      { path: ":role/head", component: TopHierarchyComponent},
      { path: ":role/head/:id", component: TopHierarchyComponent, data: {title: "Assignment - Head"} },
      { path: ":role/section", component: IllnessesGroupComponent},
      { path: ":role/section/:id", component: IllnessesGroupComponent, data: {title: "Assignment - Section"} }
    ]
  }
];