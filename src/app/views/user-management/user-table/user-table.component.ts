import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter, ComponentRef
} from "@angular/core";
import { DeleteUserModalComponent } from "../delete-user/delete-user.modal.component";
import {ModalService} from "../../../components/modal/modal.service";

@Component({
  selector: "mita-user-table",
  templateUrl: "./user-table.component.html",
  styleUrls: ["./user-table.component.sass"]
})
export class UserTableComponent implements OnInit, OnDestroy {
  @Input() users: MITA.User.Data[];
  @Input() role: MITA.RoleName;
  @Output() removeUserFromView: EventEmitter<number> = new EventEmitter();
  activeUserIdx?: number;
  modalRef?: ComponentRef<any>;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }

  openModalDialog(userIdx: number) {
    this.modalRef = this.modalService.open(DeleteUserModalComponent);
    const modalInstance = this.modalRef.instance;
    this.activeUserIdx = userIdx;
    modalInstance.user = this.users[this.activeUserIdx];
    this.modalRef.changeDetectorRef.detectChanges();
    modalInstance.onModalClose.subscribe((result: any) => {
      if (result === true) this.removeUserFromView.next(this.activeUserIdx);
      delete this.activeUserIdx;
    });
  }

  ngOnDestroy() {
    if (this.modalRef && this.modalRef.instance) this.modalRef.instance.closeModal();
  }

}
