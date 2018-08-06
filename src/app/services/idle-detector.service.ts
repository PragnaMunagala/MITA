import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "./auth.service";
import { APP_CONFIG } from "../app.config";

@Injectable()
export class IdleDetectorService {
  private timerSrc: NodeJS.Timer;
  private activity: Observable<Event>;
  private resetter: Subscription;

  constructor(@Inject(APP_CONFIG) private config: MITA.config,
              private auth: AuthService,
              private router: Router) {
    const mouseDetector = Observable.fromEvent(document, "mousemove");
    const keyDetector = Observable.fromEvent(document, "keypress");
    this.activity = Observable
      .merge(mouseDetector, keyDetector)
      .throttleTime(this.config.idleTime / 2);
  }

  start() {
    this.timerSrc = this.timer;
    this.resetter = this.activity.subscribe(ev => {
      this.resetTimer();
    });
  }

  stop() {
    if (this.resetter) this.resetter.unsubscribe();
    if (this.timerSrc) clearInterval(this.timerSrc);
  }

  private resetTimer() {
    if (this.timerSrc) clearInterval(this.timerSrc);
    this.timerSrc = this.timer;
  }

  private get timer(): NodeJS.Timer  {
    return setInterval(() => {
      this.auth.logout();
      this.router.navigate(["inactive"]);
    }, this.config.idleTime);
  }

}
