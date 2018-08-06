/**
 * Created by sergeyyudintsev on 10/07/17.
 */
import {
  Component,
  Input,
  ChangeDetectorRef
} from "@angular/core";
import { UserService } from "../../../services/user.service";
import { AuthService } from "../../../services/auth.service";
import { environment } from "../../../../environments/environment";
import {ModalClosable} from "../../../components/modal/modal_closable";

@Component({
  selector: "mita-delete-user-modal",
  templateUrl: "./delete-user.modal.component.html",
  styleUrls: ["./delete-user.modal.component.sass"]
})
export class DeleteUserModalComponent extends ModalClosable {
  @Input() user: MITA.User.Data;
  errorMessage: {
    status: "",
    message: ""
  };
  requesting = false;
  environmentValue: string = environment.production ? "Prod" : "Dev";

  constructor(private userService: UserService,
              private authService: AuthService,
              private cd: ChangeDetectorRef) {
    super();
    this.resetErrorMessage();
  }

  ngOnInit() {}

  resetErrorMessage() {
    this.errorMessage = {
      status: "",
      message: ""
    };
  }

  onError(err: any) {
    this.requesting = false;
    console.log(err);
    this.errorMessage.message = err.message || err.error_description;
    this.errorMessage.status = err.statusCode || "";
    this.cd.detectChanges();
  }

  removeUserWithAccess() {
    this.requesting = true;
    this.authService.removeUser(this.user.email)
      .merge(this.userService.removeUser(this.user.userId))
      .subscribe(res => {}, err => this.onError(err.json()), () => {
        this.requesting = false;
        this.resetErrorMessage();
        this.closeModal(true);
      });
  }

  removeUser() {
    this.requesting = true;
    this.userService.removeUser(this.user.userId)
      .subscribe(res => {}, err => this.onError(err.json()), () => {
        this.requesting = false;
        this.resetErrorMessage();
        this.closeModal(true);
      });
  }
}
