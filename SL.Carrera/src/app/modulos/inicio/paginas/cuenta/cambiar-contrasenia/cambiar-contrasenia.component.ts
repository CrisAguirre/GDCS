import { Component } from "@angular/core";
import { CustomErrorStateMatch } from "@app/compartido/helpers/custom-error-input";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { AlertService, TYPES } from "@app/core/servicios/alert.service";
import { LoginService } from "@app/core/servicios/login.service";
import { Constants as C } from "src/app/compartido/helpers/constants";
import { MustMatch } from "@app/compartido/helpers/must-match";
import { sha256 } from "js-sha256";
import { AuthenticationService } from '@app/core/servicios/authentication.service';
import { finalize } from 'rxjs/operators';
import { statesUser } from '@app/compartido/helpers/enums';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Router } from '@angular/router';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-cambiar-contrasenia',
  templateUrl: './cambiar-contrasenia.component.html',
  styleUrls: ['./cambiar-contrasenia.component.scss']
})
export class CambiarContraseniaComponent extends BaseController {
  public submit: boolean;
  public form: FormGroup;
  public matcher = new CustomErrorStateMatch();
  public msg = "";
  public revealPassword = true;
  public msgErrorPassword: string;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private alertService: AlertService,
    private authService: AuthenticationService,
    private router: Router,
    private ct: CustomTranslateService
  ) {
    super();
    const user = this.authService.getUser();
    if (user.estadoUsuario == statesUser.FORCE_CHANGE_PASSWORD) {
      this.alertService.message(this.ct.YOU_MUST_CHANGE_PASSWORD, TYPES.INFO);
    }

    this.msgErrorPassword = this.ct.ERROR_PASSWORD;

    this.loadForm();
    this.matcher = new CustomErrorStateMatch();
  }

  get f() {
    return this.form.controls;
  }

  loadForm() {
    this.form = this.formBuilder.group(
      {
        passwordCurrent: new FormControl("", [Validators.required, Validators.minLength(C.MIN_LENGTH_PASSWORD)]),
        passw1: new FormControl("", [
          Validators.required,
          Validators.pattern(C.PATTERN_PASSWORD_CTRL)
        ]),
        passw2: new FormControl("", [
          Validators.required,
          Validators.pattern(C.PATTERN_PASSWORD_CTRL)
        ])
      },
      {
        validator: MustMatch("passw1", "passw2")
      }
    );
  }

  public validatePasswords() {
    this.msg = "";
    if (!this.form.get("passw2").invalid && this.form.get("passw2").touched) {
      if (!this.equalsPasswors()) {
        this.msg = this.ct.PASSWORDS_MUST_SAME;
      }
    }
    if (this.form.get("passw2").value !== "" && !this.equalsPasswors()) {
      this.msg = this.ct.PASSWORDS_MUST_SAME;
    }
  }

  private equalsPasswors(): boolean {
    if (this.form.get("passw1").value === this.form.get("passw2").value) {
      return true;
    }
    return false;
  }

  public noSpace(event): void {
    if (event.which === 32) {
      event.preventDefault();
    }
  }

  public changePassword() {
    if (this.form.valid) {
      this.submit = true;
      this.alertService.loading();

      // if (this.f.passwordCurrent.value === this.f.passw1.value) {
      //   this.alertService.message(this.ct.WE_ARE_SORRY_PASSWORD_DIFERENT_CURRENT, TYPES.WARNING);
      //   this.submit = false;
      //   return;
      // }


      this.loginService
        .changePassword(
          this.authService.getIdUser(),
          sha256(this.f.passwordCurrent.value),
          sha256(this.f.passw1.value)
        )
        .toPromise()
        .then((res: any) => {
          this.alertService.close();
          this.authService.updateUser(res['datos']);
          this.alertService.message(this.ct.PASSWORD_CHANGE_SUCCESS, TYPES.SUCCES)
            .then(() => this.router.navigate(["/"]))
            .finally(() => this.router.navigate(["/"]));
          this.loadForm();

        }).catch((err: any) => {
         this.alertService.showError(err, this.ct.PASSWORD_NOT_CHANGE);
        })
        .finally(() => {
          this.submit = false;
        });
    } else {
      this.submit = false;
      return;
    }

  }
}
