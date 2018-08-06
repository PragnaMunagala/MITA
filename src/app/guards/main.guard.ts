import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services";

@Injectable()
export class MainGuard implements CanActivate {

  constructor(private auth: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    if (this.auth.isAuthenticated) {
      return Observable.of(true);
    } else {
      this.auth.showWidget();
      return this.auth.auth0State
        .filter(userData => !!userData)
        .map(userData => !!userData);
    }
  }
}
