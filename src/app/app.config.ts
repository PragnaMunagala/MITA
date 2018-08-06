import { OpaqueToken } from "@angular/core";
import { environment } from "../environments/environment";

export const topHierarchies: MITA.Assignments.view[] = ["chapter", "head"];

export const assignmentViews: MITA.Assignments.view[] = ["chapter", "head", "section"];

export const navItems: MITA.NavItem[] = [
  {
    name: "Summary",
    path: "summary"
  },
  {
    name: "Users",
    path: "users"
  },
  {
    name: "Collectors",
    path: "user/collector"
  },
  {
    name: "Reviewers",
    path: "user/reviewer"
  },
  {
    name: "Tasks",
    path: "tasks"
  },
  {
    name: "Tracking",
    path: "illness/tracking"
  },
  {
    name: "Assignments",
    path: "assignments",
    children: [
      {
        name: "Data Collector",
        path: "assignments/collector",
        icon: "keyboard"
      },
      {
        name: "Reviewer",
        path: "assignments/reviewer",
        icon: "edit_mode"
      }
    ]
  },
  {
    name: "Active Illnesses",
    path: "activeIllnesses"
  }
];

export const pageSizes: number[] = [20, 40, 100];

export const config: MITA.config = {
  idleTime: 10 * 60 * 1000,
  navItems: navItems,
  topHierarchies: topHierarchies,
  assignmentViews: assignmentViews,
  roleNames: ["collector", "reviewer", "administrator"],
  api: {
    main:  environment.production
      ? "https://services.advinow.net/mita-rest"
      : "https://devservices.advinow.net/mita-rest",
    user: {
      all: "user/all",
      create: "user/register",
      byEmail: "user/email",
      collector: "/user/role/1",
      reviewer: "/user/role/2",
      remove: "user/remove",
      deactivate: "user/deactivate"
    },
    task: {
      reset: "task/reset",
      list: "task"
    },
    illness: {
      tracking: "illness/tracking",
      progress: "illness/progress",
      approved: "/2070Services/mica/api/illness",
      saveDataFrame: "/2070Services/dataframe/update"
    },
    assignment: "assignment",
    collector: "collector",
    reviewer: "reviewer"
  },
  micaApi: {
    main: environment.production
      ? "https://services.advinow.net/2070Services/mica/api"
      : "https://devservices.advinow.net/2070Services/mica/api",
    illness: {
      info: "illness/info"
    }
  },
  auth: {
    clientID: "g2ohdn6upVaJhiYa3WjP9bI21OpTFjuu",
    domain: "advi.auth0.com",
    apiToken: {
      url: "https://advi.auth0.com/oauth/token",
      payload: {
        client_id: "5ud0CFvFIW16O272Jh7n9ewbeXbnnGNt",
        client_secret: "hyo5NQHIxqv7ruY7f9h2XUrlOeuoXIueL8-JhxxL1HKPwadK6p5rXWoGfOlRGiN7",
        audience: "https://advi.auth0.com/api/v2/",
        grant_type: "client_credentials"
      }
    },
    user: {
      root: "users"
    }
  },
  pagination: {
    pageSizes: [10, 25, 50, 100]
  }
};

export const assignmentState: MITA.Assignments.state = {
  current: {},
  selected: {
    user: -1,
    block: []
  },
  items: {},
  role: "",
  view: ""
};

export const userState: MITA.User.State = {
  collector: [],
  reviewer: []
};

export let NAV_ITEMS = new OpaqueToken("nav.config");
export let APP_CONFIG = new OpaqueToken("app.config");
