import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "mita-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit {

  constructor(public route: ActivatedRoute) {}

  ngOnInit() {
  }
}
