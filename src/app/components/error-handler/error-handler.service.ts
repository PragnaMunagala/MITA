import { ModalClosable } from "../modal/modal_closable";
import { ModalService } from "../modal/modal.service";
import { ErrorHandler, Injectable, Injector, ApplicationRef } from "@angular/core";
import { ErrorHandlerModalComponent } from "./error-handler.component";

@Injectable()
export class MITAErrorHandlerService extends ModalClosable implements ErrorHandler {

  constructor(private injector: Injector) {
    super();
  }

  handleError(error: any) {
    console.log("AN ERROR:", error);
    if (error.json) error = error.json();
    const modalSvc = this.injector.get(ModalService);
    const modalRef = modalSvc.open(ErrorHandlerModalComponent);
    const modal: ErrorHandlerModalComponent = modalRef.instance;

    modal.errorMessage = error.message ? error.message : "An error has been detected.";
    modal.emailBody = encodeURIComponent(`Error Report for MITA\n–––––––––-–––––––––––––––\n` +
      `Error message: ${error.message || "No error message reported."}\n` +
      `Error reason: ${error.reason || "No reason reported."}\n` +
      `Error statusCode: ${error.statusCode || "No status code reported."}\n` +
      (error.stack ? `Stack trace: ${error.stack}` : ``));
    console.error("Error detected in MITA Global Handler: ", error);
    // ApplicationRef depends on ErrorHandler
    // Get it here instead of in constructor to avoid an infinite loop
    const appRef: ApplicationRef = this.injector.get(ApplicationRef);
    appRef.isStable
      .skipWhile(stable => stable === false)
      .first()
      .subscribe(stable => appRef.tick());
  }

}
