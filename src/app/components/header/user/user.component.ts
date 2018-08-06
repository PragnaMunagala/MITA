import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../services";

@Component({
  selector: "mita-header-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderUserComponent implements OnInit {

  constructor(public auth: AuthService,
              private router: Router) { }

  ngOnInit() {
  }

  onLogOut() {
    this.auth.logout();
    this.router.navigate(["logout"]);
  }

}
