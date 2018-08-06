import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ComponentRef,
  ViewContainerRef,
  ViewChild, Input, OnDestroy, Renderer2
} from "@angular/core";

@Component({
  selector: "mita-modal",
  template: `
    <div class="modal-backdrop show"></div>
    <div class="row" (click)="closeModal()">
      <div class="col">
        <div class="modal show d-block" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <ng-template #content></ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() content: ComponentRef<any>;
  @Input() closeModal: Function;
  @ViewChild("content", { read: ViewContainerRef }) private target: ViewContainerRef;
  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    this.target.insert(this.content.hostView);
    this.renderer.addClass(document.body, "modal-open");
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, "modal-open");
  }
}
