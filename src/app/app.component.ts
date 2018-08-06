import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { AuthService, IdleDetectorService } from "./services";

@Component({
  selector: "MITA-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {
    private routerSubscription: Subscription;

    constructor(private title: Title,
                public auth: AuthService,
                private idleDetector: IdleDetectorService,
                private router: Router) {}

    ngOnInit() {
      this.routerSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const title = this.getTitle(this.router.routerState, this.router.routerState.root).join("-");
          this.title.setTitle("MITA - " + title);
        }
      });
      this.auth.auth0State
        .subscribe(u => {
          if (_.isNull(u)) {
            this.idleDetector.stop();
          } else {
            this.idleDetector.start();
          }
        });
    }

    private getTitle(state: any, parent: any): string[] {
      const data = [];
      if (parent && parent.snapshot.data && parent.snapshot.data.title) {
        data.push(parent.snapshot.data.title);
      }

      if (state && parent) {
        data.push(... this.getTitle(state, state.firstChild(parent)));
      }
      return data;
    }

    ngOnDestroy() {
      this.routerSubscription.unsubscribe();
    }
}
