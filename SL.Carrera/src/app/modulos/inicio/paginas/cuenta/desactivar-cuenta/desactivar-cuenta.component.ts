import { CuentaService } from './../../../../../core/servicios/cuenta.service';
import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CommonService } from '@app/core/servicios/common.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg } from '@app/compartido/helpers/enums';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AuthenticationService } from '@app/core/servicios/authentication.service';

@Component({
  selector: 'app-desactivar-cuenta',
  templateUrl: './desactivar-cuenta.component.html',
  styleUrls: ['./desactivar-cuenta.component.scss']
})
export class DesactivarCuentaComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;
  public elementCurrent: any = {};
  public submit = false;
  public showForm = false;
  private user = this.commonService.getVar(configMsg.USER);

  @ViewChild('formV', { static: false }) formV: NgForm;

  constructor(
    private alertService: AlertService,
    private cuentaService: CuentaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthenticationService,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        token: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public getTokenUser() {
    this.submit = true;
    this.alertService.loading();

    this.cuentaService.getTokenUser(this.authService.getIdUser(), this.user.email).toPromise()
      .then((res: any) => {
        this.alertService.close();
        this.alertService.message(this.ct.VERIFY_TOKEN_DEACTIVATE_USER, TYPES.SUCCES)
          .finally(() => {
            this.submit = false;
            this.showForm = true;
          });
        this.loadForm();

      }).catch((err: any) => {
        console.log('ERROR ', err);
        this.alertService.showError(err, this.ct.ERROR_MSG);
      })
      .finally(() => {
        this.submit = false;
      });
  }

  public getDeactivateUser() {
    if (this.form.valid) {
      this.submit = true;
      this.alertService.loading();
      // Verifica que el token sea correcto
      this.cuentaService.verifyCode(this.user.id, this.f.token.value)
        .subscribe(
          (res: any) => {
            res = res.datos;
            if (res && res.usuarioValidado) {
              // Solo si el token es correcto, le pide confirmación al usuario para proceder con la desactivación de cuenta.
              this.alertService.comfirmation(this.ct.DEACTIVATE_CONFIRMATION, TYPES.INFO)
                .then(ok => {
                  if (ok.value) {
                    // Si confirma la desactivación de cuenta, el sistema continúa con el proceso.
                    this.alertService.loading();
                    this.cuentaService.getDeactivateUser(this.authService.getIdUser(), this.f.token.value).toPromise()
                      .then((res2: any) => {
                        if (res2.datos.usuarioDesactivado) {
                          this.alertService.close();
                          this.alertService.message(this.ct.MSG_DEACTIVATE_ACCOUNT_USER, TYPES.SUCCES)
                            .finally(() => {
                              this.submit = false;
                              this.authService.logout();
                            });
                          this.loadForm();
                        } else {
                          this.alertService.showError(this.ct.ERROR_DEACTIVATE_ACCOUNT_USER, this.ct.ERROR_DEACTIVATE_ACCOUNT_USER);
                        }
                      }).catch((err: any) => {
                        console.log('ERROR ', err);
                        this.alertService.showError(err, this.ct.ERROR_MSG);
                      })
                      .finally(() => {
                        this.submit = false;
                      });
                  } else {
                    this.submit = false;
                    return;
                  }
                });
            } else if (res && !res.usuarioValidado) {
              this.alertService.showError(this.ct.ERROR_DEACTIVATE_ACCOUNT_USER, this.ct.ERROR_DEACTIVATE_ACCOUNT_USER)
                .then(
                  () => {
                    this.submit = false;
                  }
                );
            }
          }, err3 => {
            this.alertService.showError(this.ct.ERROR_DEACTIVATE_ACCOUNT_USER, this.ct.ERROR_DEACTIVATE_ACCOUNT_USER)
              .then(
                () => {
                  this.submit = false;
                }
              );
          }
        );

    } else {
      this.submit = false;
      return;
    }
  }
}
