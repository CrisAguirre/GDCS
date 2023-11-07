import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Constants as C } from 'src/app/compartido/helpers/constants';
import { MustMatch } from 'src/app/compartido/helpers/must-match';
import { CustomErrorStateMatch } from 'src/app/compartido/helpers/custom-error-input';
import { sha256 } from 'js-sha256';
import { LoginService } from 'src/app/core/servicios/login.service';
import { AlertService, TYPES } from 'src/app/core/servicios/alert.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { statesUser, configMsg } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatDialog } from '@angular/material';
import { PoliticaPrivacidadComponent } from '../../../compartido/componentes/politica-privacidad/politica-privacidad.component';

declare var $: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login-template.scss']
})
export class RegisterComponent extends BaseController {

  public submit: boolean;
  public form: FormGroup;
  public btnDisabled: boolean;
  public matcher = new CustomErrorStateMatch();
  public msg = '';
  public revealPassword = true;
  public userTemp: any;
  public msgErrorPassword: string;

  constructor(
    private formBuilder: FormBuilder,
    public loginService: LoginService,
    private alertService: AlertService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private router: Router,
    private ct: CustomTranslateService) {
    super();

    this.msgErrorPassword = this.ct.ERROR_PASSWORD;
    this.form = this.formBuilder.group(
      {
        email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(C.PATTERN_EMAIL_CTRL)]),
        passw1: new FormControl('', [
          Validators.required,
          Validators.pattern(C.PATTERN_PASSWORD_CTRL)
        ]),
        passw2: new FormControl('', [
          Validators.required,
          Validators.pattern(C.PATTERN_PASSWORD_CTRL)
        ])
      },
      {
        validator: MustMatch('passw1', 'passw2')
      }
    );
    this.matcher = new CustomErrorStateMatch();
  }

  get f() {
    return this.form.controls;
  }

  public register() {
    this.alertService.loading();
    this.submit = true, this.btnDisabled = true;
    if (!this.form.valid) {
      this.btnDisabled = false;
      this.alertService.close();
      return;
    }

    const passEncripted = sha256(this.form.controls['passw1'].value);
    this.loginService
      .registerUser({ email: this.f.email.value, contrasenia: passEncripted })
      .pipe(finalize(
        () => {
          this.btnDisabled = false;
        }))
      .subscribe(
        res => {
          const data: any = res;
          if (data && data.datos && data.datos.error) {
            const msg = data.datos.descripcion.toLowerCase();
            if (data.datos.estadoUsuario === statesUser.PENDING_ACTIVATION) {
              this.alertService.message(this.ct.EMAIL_PENDING_VERIFICATION, TYPES.WARNING)
                .then(
                  res => {
                    this.userTemp = data.datos;
                    this.resendCode(true);
                  }
                );
            } else if (data.datos.estadoUsuario === statesUser.INACTIVE) {
              this.loginService.reactivarCuentaUsuario(data.datos.id, { email: this.f.email.value, contrasenia: passEncripted })
                .subscribe(
                  ok => {
                    this.userTemp = data.datos;
                    this.verifyCode();
                    this.resendCode(true);
                  }, err => {
                    this.alertService.showError(err);
                  }
                );
            } else {
              this.alertService.message(`${this.ct.WE_ARE_SORRY}, ${msg} `, TYPES.ERROR);
            }

          } else {
            this.userTemp = data;
            this.verifyCode();
          }
        },
        err => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        }
      );
  }

  public openPrivacidad(politica: number) {
    const nameMsg = politica === 1 ? configMsg.POLITICA_PRIVACIDAD_MESSAGE : configMsg.POLITICA_COOKIE_MESSAGE;
    this.commonService.getMessageByName(nameMsg).subscribe(
      (res: any) => {
        const msgPrivacidad = res.datos;
        const dialogRef = this.dialog.open(PoliticaPrivacidadComponent, {
          disableClose: true,
          maxWidth: '90%',
          maxHeight: '90%',
          data: { text: msgPrivacidad },
          panelClass: 'col-sm-10',
        });
      }, error => {
        console.log('Error');
      }
    );
  }

  public resendCode(showMsg?) {
    this.alertService.loading();
    this.loginService.resendTokenValidation(this.userTemp.email).subscribe(
      res => {
        if (showMsg) {
          this.alertService.message(this.ct.VERIFY_CODE3, TYPES.INFO).then(() => {
            this.verifyCode();
          });
        } else {
          this.verifyCode();
        }
      }, err => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        console.log('Error', err);
      }
    );
  }

  private verifyCode() {
    this.alertService.getTokenValidation(this.f.email.value)
      .then(
        (code: any) => {
          // const c: any = code;
          if (code.value) {
            this.alertService.loading();
            this.loginService.verifyCodeRegister(this.userTemp.id, code.value)
              .subscribe(
                (res2: any) => {
                  res2 = res2.datos;
                  if (res2 && res2.usuarioValidado) {
                    const message = this.commonService.getVar(configMsg.CONFIRMATION_REGISTER_MESSAGE);
                    this.alertService.messageHtml(this.ct.EMAIL_VALIDATE_MSG + '<br>' + message, TYPES.SUCCES)
                      .then(() => this.router.navigate(['/']));
                  } else if (res2 && !res2.usuarioValidado) {
                    this.alertService.message(this.ct.CODE_INCORRECT_MSG, TYPES.ERROR)
                      .then(
                        () => {
                          this.verifyCode();
                        }
                      );
                  }
                }, err3 => {
                  this.alertService.message(this.ct.CODE_INCORRECT_MSG, TYPES.ERROR)
                    .then(
                      () => {
                        this.verifyCode();
                      }
                    );
                }
              );
          } else if (code.dismiss === 'cancel') {
            this.resendCode(true);
          }
        },
        err2 => {
          console.log(err2);
        });
  }

  public validatePasswords() {
    this.msg = '';
    if (!this.form.get('passw2').invalid && this.form.get('passw2').touched) {
      if (!this.equalsPasswors()) {
        this.msg = this.ct.PASSWORDS_MUST_SAME;
      }
    }
    if (this.form.get('passw2').value !== '' && !this.equalsPasswors()) {
      this.msg = this.ct.PASSWORDS_MUST_SAME;
    }
  }

  private equalsPasswors(): boolean {
    if (this.form.get('passw1').value === this.form.get('passw2').value) {
      return true;
    }
    return false;
  }

  public noSpace(event): void {
    if (event.which === 32) {
      event.preventDefault();
    }
  }
}
