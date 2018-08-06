import { Subject } from "rxjs";
import { ModalClosable } from "./../app/components/modal/modal_closable";
import {Component, Input} from "@angular/core";

@Component({
  selector: "mita-modal",
  template: "<div>Test modal content component</div>"
})
export class TestModalContentComponent {}

@Component({
  selector: "mita-test-root",
  template: "<div>Test modal content component</div>"
})
export class TestAppComponent {}

@Component({
  selector: "mita-error-handler",
  template: ""
})
export class ErrorHandlerModalComponentStub {
  @Input() emailBody: string;
  @Input() message: string;
  closeModal = () => {};
  onModalClose = new Subject();
}
