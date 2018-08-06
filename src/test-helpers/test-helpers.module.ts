import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLinkStubDirective, RouterOutletStubComponent, ActivatedRouteStub } from "./router-stubs.spec";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RouterLinkStubDirective,
    RouterOutletStubComponent
  ],
  providers: [ActivatedRouteStub]
})
export class TestHelpersModule { }
