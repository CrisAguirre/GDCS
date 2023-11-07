import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '@app/core/servicios/login.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants'
import { finalize } from 'rxjs/operators';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['../login-template.scss']
})
export class RecoveryPasswordComponent {

  public submit: boolean;
  public form: FormGroup;
  public btnDisabled: boolean;
  public msg = "";

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private alertService: AlertService,
    private ct: CustomTranslateService) {

    this.form = this.formBuilder.group(
      {
        email: new FormControl("", [Validators.required, Validators.email, Validators.pattern(C.PATTERN_EMAIL_CTRL)]),
      },
    );
  }

  get f() {
    return this.form.controls;
  }

  public recoveryPassword() {
    this.submit = true, this.btnDisabled = true;
    if (!this.form.valid) {
      this.btnDisabled = false;
      return;
    }
    this.alertService.loading();

    this.loginService
      .recoveryPassword(this.f.email.value)
      .pipe(finalize(
        () => {
          this.btnDisabled = false;
        }))
      .subscribe(
        (res: any) => {
          const data = res.datos;
          if (data && data.recuperacion) {
            this.alertService.message(this.ct.SEND_PASSWORD_TEMPORAL_TO_EMAIL, TYPES.INFO);
          } else if (data && !data.recuperacion) {
            this.alertService.message(this.ct.WE_ARE_SORRY_DONT_RECOVERY_PASSWORD, TYPES.WARNING);
          }
        },
        err => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
          console.log('Error',err)
        }
      );
  }
}
