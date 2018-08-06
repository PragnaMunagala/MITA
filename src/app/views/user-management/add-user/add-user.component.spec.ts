import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FormsModule, NgForm } from "@angular/forms";
import { Observable } from "rxjs";
import { AddUserComponent } from "./add-user.component";
import { AuthService } from "../../../services";
import { AuthServiceStub } from "../../../../test-helpers/services-stubs.spec";


describe("AddUserComponent", () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let authSvc: AuthServiceStub;
  const newCollector = {
      role: "1",
      email: "test@test.com",
      name: "John",
      surname: "Doe",
      password: "123"
    };
  const newAdmin = {
      role: "3",
      email: "admin@admin.com",
      name: "John",
      surname: "Doe",
      password: "123"
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserComponent ],
      imports: [ FormsModule ],
      providers: [
        {provide: AuthService, useClass: AuthServiceStub}
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      authSvc = TestBed.get(AuthService);
    });
  }));

  function fillInForm(newUser: any): Promise<void> {
    return fixture.whenStable().then(() => {
      const role = fixture.debugElement.query(By.css("select[name='role']")).nativeElement;
      const email = fixture.debugElement.query(By.css("input[name='email']")).nativeElement;
      const name = fixture.debugElement.query(By.css("input[name='name']")).nativeElement;
      const surname = fixture.debugElement.query(By.css("input[name='surname']")).nativeElement;
      const password = fixture.debugElement.query(By.css("input[name='password']")).nativeElement;
      role.value = newUser.role;
      role.dispatchEvent(new Event("change"));
      email.value = newUser.email;
      email.dispatchEvent(new Event("input"));
      name.value = newUser.name;
      name.dispatchEvent(new Event("input"));
      surname.value = newUser.surname;
      surname.dispatchEvent(new Event("input"));
      password.value = newUser.password;
      password.dispatchEvent(new Event("input"));
    });
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should allow user to fill in a form a new user", () => {
    fillInForm(newCollector)
      .then(() => {
        expect(component.newUserForm.value).toEqual(newCollector);
      });
  });

  it("should allow use to create a new user by submitting form", async(() => {
    fillInForm(newCollector)
      .then(() => {
        const createUser = spyOn(authSvc, "createUser").and.callThrough();
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        expect(createUser).toHaveBeenCalled();
      });
  }));

  it("should adjust auth0 settings when new user is admin", () => {
    fillInForm(newAdmin)
      .then(() => {
        const createUser = spyOn(authSvc, "createUser").and.callThrough();
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        expect(createUser).toHaveBeenCalledWith({
          connection: "MITA",
          password: "123",
          email: "admin@admin.com",
          app_metadata: { name: "John", surname: "Doe", role: 3 }});
      });
  });

  it("should display success message after creating a new user", fakeAsync(() => {
    fillInForm(newAdmin)
      .then(() => {
        const createUser = spyOn(authSvc, "createUser").and.callThrough();
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        fixture.detectChanges();
        const alert = fixture.debugElement.query(By.css(".alert-success"));
        expect(alert).toBeTruthy();
        expect(alert.nativeElement.innerHTML).toMatch("New User Created");
      });
  }));

  it("should display error message to user if creating user failed", fakeAsync(() => {
    fillInForm(newAdmin)
      .then(() => {
        spyOn(console, "error");
        const createUser = spyOn(authSvc, "createUser")
          .and.returnValues(Observable.throw({message: "Test error", statusCode: 500}));
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        fixture.detectChanges();
        const alert = fixture.debugElement.query(By.css(".alert-danger"));
        expect(alert).toBeTruthy();
        expect(alert.nativeElement.innerHTML).toMatch("Test error");
      });
  }));

  it("should display error message when user has alternative format", fakeAsync(() => {
    fillInForm(newAdmin)
      .then(() => {
        spyOn(console, "error");
        const createUser = spyOn(authSvc, "createUser")
          .and.returnValues(Observable.throw({error_description: "Test error"}));
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        fixture.detectChanges();
        const alert = fixture.debugElement.query(By.css(".alert-danger"));
        expect(alert).toBeTruthy();
        expect(alert.nativeElement.innerHTML).toMatch("Test error");
      });
  }));

  it("should allow user to close success message", fakeAsync(() => {
    fillInForm(newCollector)
      .then(() => {
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        fixture.detectChanges();
        const alert = fixture.debugElement.query(By.css(".alert-success"));
        expect(alert).toBeTruthy();
        const close = fixture.debugElement.query(By.css(".close")).nativeElement;
        close.click();
        fixture.detectChanges();
        const alertAfter = fixture.debugElement.query(By.css(".alert-success"));
        expect(alertAfter).toBeFalsy();
      });
  }));


  it("should allow user to close error message", fakeAsync(() => {
    fillInForm(newCollector)
      .then(() => {
        spyOn(console, "error");
        const createUser = spyOn(authSvc, "createUser")
          .and.returnValues(Observable.throw({message: "Test error", statusCode: 500}));
        const btn = fixture.debugElement.query(By.css("#create-btn")).nativeElement;
        btn.click();
        fixture.detectChanges();
        const alert = fixture.debugElement.query(By.css(".alert-danger"));
        expect(alert).toBeTruthy();
        const close = fixture.debugElement.query(By.css(".close")).nativeElement;
        close.click();
        fixture.detectChanges();
        const alertAfter = fixture.debugElement.query(By.css(".alert-danger"));
        expect(alertAfter).toBeFalsy();
      });
  }));
});
