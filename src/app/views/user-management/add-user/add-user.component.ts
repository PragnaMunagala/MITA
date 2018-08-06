import {
  Component,
  Inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../../../services";

@Component({
  selector: "mita-add-user",
  templateUrl: "./add-user.component.html",
  styleUrls: ["./add-user.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserComponent implements OnInit {
  errorMsg = {
    status: "",
    message: ""
  };
  hasSuccess = false;
  requesting = false;
  requestingToken = true;
  @ViewChild("newUser") public newUserForm: NgForm;

  constructor(private auth: AuthService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.auth.apiToken
      .subscribe(token => {
        this.requestingToken = false;
        this.cd.markForCheck();
      });
  }

  initErrorMsg(): void {
    this.errorMsg = {
        status: "",
        message: ""
      };
  }

  onCloseResult(success: boolean): void {
    if (!success) {
      this.initErrorMsg();
    } else {
      this.hasSuccess = false;
    }
  }

  onSubmit(form: NgForm) {
    this.initErrorMsg();
    this.requesting = true;
    this.cd.markForCheck();
    const v = form.value;
    const user: MITA.Auth0.NewUser = {
      connection: +v.role === 3 ? "MITA" : "Username-Password-Authentication",
      password: v.password,
      email: v.email,
      app_metadata: {
        name: v.name,
        surname: v.surname,
        role: +v.role
      }
    };

    this.auth.createUser(user)
      .subscribe(newUser => {
        this.requesting = false;
        this.hasSuccess = true;
        form.reset();
        this.cd.markForCheck();
      }, err => {
        console.error("error: ", err);
        this.requesting = false;
        this.errorMsg.message = err.message || err.error_description;
        this.errorMsg.status = err.statusCode || "";
        this.cd.markForCheck();
      });


  }

}
