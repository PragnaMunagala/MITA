import {
  Component,
  Inject,
  OnInit,
  ChangeDetectionStrategy
} from "@angular/core";
import { navItems, NAV_ITEMS } from "../../../app.config";
import { versions } from "../../../../environments/versions";

@Component({
  selector: "MITA-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {
  constructor(@Inject(NAV_ITEMS) public navItems: MITA.NavItem[]) {
  }
  version = versions.app;
}
