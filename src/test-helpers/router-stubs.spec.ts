// export for convenience.
export { ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";

import { Component, Directive, Injectable, Input } from "@angular/core";
import { NavigationExtras } from "@angular/router";

// #docregion router-link
@Directive({
  selector: "[routerLink]",
  host: {
    "(click)": "onClick()"
  }
})
export class RouterLinkStubDirective {
  @Input("routerLink") linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}
// #enddocregion router-link

@Component({selector: "router-outlet", template: ""})
export class RouterOutletStubComponent { }

@Injectable()
export class RouterStub {
  navigate(commands: any[], extras?: NavigationExtras) { }
}


// Only implements params and part of snapshot.params
// #docregion activated-route-stub
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class ActivatedRouteStub {

  // ActivatedRoute.params is Observable
  private subject = new BehaviorSubject(this.testParams);
  params = this.subject.asObservable();

  // Test parameters
  private _testParams: {};
  private _url: string[];
  get testParams() { return this._testParams; }
  set testParams(params: {}) {
    this._testParams = params;
    this.subject.next(params);
  }

  set snapShotUrl(url: string[]) {
    this._url = url;
  }

  // ActivatedRoute.snapshot.params
  get snapshot() {
    return {
      params: this.testParams,
      url: this._url
    };
  }
}

export class RouterNavigateStub {
  navigate(path: string[]) { return path; }
  navigateByUrl(url: string) { return url; }
}

// #enddocregion activated-route-stub
