import { startWith } from 'rxjs/operators';
import { Component, ViewChild, OnInit, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Constants as C } from 'src/app/compartido/helpers/constants';
import { LoginService } from 'src/app/core/servicios/login.service';
import { AlertService, TYPES } from 'src/app/core/servicios/alert.service';
import { sha256 } from 'js-sha256';
import { AuthenticationService } from 'src/app/core/servicios/authentication.service';
import { statesUser, configMsg } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Empresa } from '@app/compartido/modelos/empresa';
import { User } from '@app/compartido/modelos/user';
import { UsuarioRol } from '@app/compartido/modelos/usuario-rol';
import { DialogEmpresaLoginComponent } from '@app/compartido/componentes/dialog-empresa-login/dialog-empresa-login.component';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TrasladosService } from '@app/core/servicios/traslados.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../login-template.scss']
})
export class LoginComponent implements OnInit {

  public form: FormGroup;
  private returnUrl: string;
  public hide = true;
  public userTemp: any;
  private tokenCaptcha: any;
  public showCaptcha = false;
  public siteKeyCaptcha = '';
  public secretKeyCaptcha = '';
  private jsonURL = 'assets/conf.json';
  // @ViewChild('recaptcha', {static: true }) recaptchaElement: ElementRef;

  public loginAdmin = false;

  /* Login Admin */
  public title = 'ttl.iniciarSesion';
  public lstRolesUsuario: any[] = [];
  public lstEmpresasTemp: any[] = [];
  public lstCompanies: Empresa[] = [];
  public empresa: any;
  public elementCurrent: any = {};
  public showLstEmpresas = false;
  public dataUser: User;

  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private alertService: AlertService,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private empresaService: EmpresaService,
    private dialogEmpresa: MatDialog,
    private router: Router,
    private trasladoService: TrasladosService
  ) {

    // si la sesion se cerro por inactividad 
    if (this.commonService.isSessionExpired()) {
      this.alertService.message(this.ct.CLOSE_SESION_EXPIRED, TYPES.INFO);
      this.commonService.setSessionExpired(false);
    }

    // si la sesion se cerro por inactividad 
    // const msg = this.commonService.getSessionExpired();
    // if (msg != null) {
    //   this.alertService.close();
    //   this.alertService.message(this.ct.CLOSE_SESION_EXPIRED, TYPES.INFO).finally(() => {
    //     window.location.reload();
    //   });
    // }

    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.form = this.formBuilder.group(
      {
        email: new FormControl("", [Validators.required, Validators.email, Validators.pattern(C.PATTERN_EMAIL_CTRL)]),
        password: new FormControl("", [Validators.required])
      }
    );

    this.getJSON().subscribe(data => {
      this.showCaptcha = (data.showCaptcha === 'true') ? true : false;
      this.siteKeyCaptcha = data.siteKeyCaptcha;
      this.secretKeyCaptcha = data.secretKeyCaptcha;
    });
  }
  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL);
  }

  ngOnInit() {
    // this.addRecaptchaScript();
    // this.validateRecaptcha();
    this.route.data.subscribe(async v => {
      if (v.administrator) {
        this.title = 'ttl.iniciarSesionAdmin';
        this.loginAdmin = v.administrator;
      }
    });

  }

  get f() {
    return this.form.controls;
  }

  // renderReCaptcha() {
  //   // window['grecaptcha'].render(this.recaptchaElement.nativeElement, {
  //   //   'sitekey': '6LeC4qMZAAAAADa60SvP9mzqpKXQ-aoVNBZb5vxw',
  //   //   'callback': (response) => {
  //   //       console.log(response);
  //   //       this.tokenCaptcha = response;
  //   //   }
  //   // });
  // }

  // addRecaptchaScript() {
  //   window['grecaptchaCallback'] = () => {
  //     console.log('render');
  //     this.renderReCaptcha();
  //   }

  //   (function (d, s, id, obj) {
  //     var js, fjs = d.getElementsByTagName(s)[0];
  //     if (d.getElementById(id)) { obj.renderReCaptcha(); return; }
  //     js = d.createElement(s); js.id = id;
  //     js.src = "https://www.google.com/recaptcha/api.js?onload=grecaptchaCallback&amp;render=explicit";
  //     fjs.parentNode.insertBefore(js, fjs);
  //   }(document, 'script', 'recaptcha-jssdk', this));

  // }

  // resolved(captchaResponse: string) {
  //   console.log(`Resolved captcha with response: ${captchaResponse}`);
  // }

  public resolved(captchaResponse: string) {
    this.tokenCaptcha = captchaResponse;
    // this.loginService.validateReCaptcha(this.tokenCaptcha, this.secretKeyCaptcha);
    this.loginService.validateReCaptcha(captchaResponse, this.secretKeyCaptcha).subscribe(res => {
    }, error => {
      console.log(error);
    });

    // const headersJson = new Headers({'Content-Type': 'application/json'});
    // this.http.post('https://www.google.com/recaptcha/api/siteverify', 
    // {secret: '6LfX9akZAAAAAGH03uDGyN3tye9jQ9LWZH7cegZ9', response: captchaResponse})
    //   .subscribe((res) => {
    //         //let body = res.json();
    //         //console.log(body);
    //         //return body;
    //         console.log(res);
    //       });

  }

  public validateRecaptcha() {
    this.loginService.validateReCaptcha(this.tokenCaptcha, this.secretKeyCaptcha).subscribe(res => {
    }, error => {
      console.log(error);
    });
  }

  public async singUp() {

    if (this.showCaptcha) {
      this.loginService.validateReCaptcha(this.tokenCaptcha, this.secretKeyCaptcha)
        .toPromise()
        .then(res => console.log('captcha', res))
        .catch(err => console.log(err));
    }

    this.alertService.loading();
    let obs: Observable<any>;
    if (this.loginAdmin) {
      obs = this.loginService.loginUserAdmin({ email: this.f.email.value, contrasenia: sha256(this.f.password.value) });
    } else {
      obs = this.loginService.loginUser({ email: this.f.email.value, contrasenia: sha256(this.f.password.value) });
    }
    // this.loginService.loginUser({ email: this.f.email.value, contrasenia: sha256(this.f.password.value) })
    //.pipe(finalize(() => //console.log('fin')))
    obs.subscribe(
      async (res: any) => {
        this.dataUser = res.datos;
        // const data: any = res.datos;
        switch (this.dataUser.estadoUsuario) {

          case statesUser.ACTIVE:
            if (this.loginAdmin) {
              this.dataUser.entradaAdmin = true;
              this.loadRolesUsuario(this.dataUser);
            } else {
              try {
                const existeEmpl = (await this.trasladoService.existeEmpleadoByNumDocumento(this.dataUser.id).toPromise() as any).datos as any;
                if (existeEmpl) {
                  this.dataUser.existeEmpleadoTraslado = true;
                  this.dataUser.numDocumento = existeEmpl.numdocumento;
                }
              } catch (error) {
                this.dataUser.existeEmpleadoTraslado = false;
                this.dataUser.numDocumento = null;
              }
              this.authService.login(this.dataUser);
              this.router.navigate(['/']);
            }
            this.alertService.close();
            break;

          case statesUser.INACTIVE:
            if (this.loginAdmin) {
              this.alertService.message(this.ct.USER_ADMIN_INACTIVE_MSG, TYPES.WARNING);
            } else {
              this.alertService.message(this.ct.USER_INACTIVE_MSG, TYPES.WARNING);
            }

            //enviar a la nueva vista para que el usuario envie token y se pueda activar
            break;

          case statesUser.PENDING_ACTIVATION:
            this.alertService.message(this.ct.USER_PENDING_ACTIVATION_MSG, TYPES.WARNING);
            this.userTemp = this.dataUser;
            this.resendCode();
            break;

          case statesUser.FORCE_CHANGE_PASSWORD:
            this.alertService.close();
            // console.log('cambio contraseña');
            this.authService.login(this.dataUser);
            break;
        }
      },
      err => {
        const errorRolSesion: string = err.error.datos.descripcionEstadoUsuario;
        if (errorRolSesion && errorRolSesion.startsWith('ErrorRolSesion')) {
          if (this.loginAdmin) {
            this.alertService.message(this.ct.ACCESS_DENIED, TYPES.WARNING);
            return;
          } else {
            this.alertService.message(this.ct.MSG_ERROR_REGISTRARSE, TYPES.WARNING);
            return;
          }
          // this.alertService.message(this.ct.ACCESS_DENIED, TYPES.WARNING);
        } else if (err.error.datos.id) {
          const detalle: string = err.error.datos.detalle;
          if (detalle.startsWith('Intento invalido')) {
            this.alertService.message(this.ct.EMAIL_PASSWORD_INCORRECT_MSG, TYPES.WARNING);
          } else {
            this.alertService.message(detalle, TYPES.WARNING);
          }
        } else {
          this.alertService.message(this.ct.MSG_ERROR_REGISTRARSE, TYPES.WARNING);
        }
      }
    );

  }

  public async loadRolesUsuario(res: User) {
    const dataUser = res;
    // const lstRolesUsuario: UsuarioRol[] = (<any> await this.commonService.getRolesPorUsuario(dataUser.id).toPromise()).datos;
    const lstRolesUsuario: UsuarioRol[] = (<any>await this.commonService.getRolesPorUsuarioToken(dataUser.id, dataUser.token).toPromise()).datos;
    // console.log('lstRoles', lstRolesUsuario);
    if (lstRolesUsuario.length > 1) {
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresasToken(dataUser.token).toPromise()).datos;
      lstRolesUsuario.forEach(e => {
        if (!e.idEmpresa.startsWith('0')) {
          const empr = this.lstCompanies.find(a => a.id === e.idEmpresa);
          if (empr) {
            e.nombreEmpresa = empr.nombreEmpresa;
          }
        }
      });
      this.lstEmpresasTemp = lstRolesUsuario;
    } else if (lstRolesUsuario.length === 1) {
      if (Number(lstRolesUsuario[0].idRol) === 1) {
        lstRolesUsuario[0].nombreEmpresa = 'General';
        this.lstEmpresasTemp = lstRolesUsuario;
      }
    }
    this.lstEmpresasTemp = lstRolesUsuario;
    this.openDialogCompany();
  }

  public async openDialogCompany() {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    const msgSeleccionarEmpresa = <any>(<any>await this.commonService.getMessageByName(configMsg.SELECCIONAR_EMPRESA_MSG).toPromise()).datos;
    const dialogRef = this.dialogEmpresa.open(DialogEmpresaLoginComponent, {
      disableClose: true,
      maxWidth: '90%',
      maxHeight: '90%',
      data: { text: msgSeleccionarEmpresa.valor, value: this.lstEmpresasTemp },
      panelClass: 'col-md-6',
    });
    dialogRef.afterClosed().subscribe(
      res => {
        if (res) {
          // console.log('companySelected', res);
          this.dataUser.idRol = res.companySelected.idRol;
          this.dataUser.idEmpresa = res.companySelected.idEmpresa;
          this.dataUser.empresa = res.companySelected.nombreEmpresa;
          this.authService.login(this.dataUser);
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['administrator']);
        }
      }
    );
  }

  public recoveryPassword() {
    /* if (this.loginAdmin) {
      console.log(this.loginAdmin);
      this.router.navigate(['login', 'recovery-password']);
    } else {
      this.router.navigate(['login', 'recovery-password']);
    } */
    this.router.navigate(['login', 'recovery-password']);
  }

  public noSpace(event): void {
    if (event.which === 32) {
      event.preventDefault();
    }
  }

  public resendCode() {
    this.alertService.loading();
    this.loginService.resendTokenValidation(this.userTemp.email).subscribe(
      res => {
        // console.log(res);
        this.verifyCode();
      }, err => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        console.log('Error', err);
      }
    );
  }

  private verifyCode() {
    this.alertService.getTokenValidation(this.userTemp.email)
      .then(
        code => {
          const c: any = code;
          // console.log(c);
          if (c.value) {
            this.alertService.loading();
            this.loginService.verifyCodeRegister(this.userTemp.id, c.value)
              .subscribe(
                (res2: any) => {
                  // console.log('Validar codigo', res2)
                  res2 = res2.datos;
                  if (res2 && res2.usuarioValidado) {
                    let message = this.commonService.getVar(configMsg.CONFIRMATION_REGISTER_MESSAGE);
                    this.alertService.messageHtml(this.ct.EMAIL_VALIDATE_MSG + "<br>" + message, TYPES.SUCCES);
                  } else if (res2 && !res2.usuarioValidado) {
                    this.alertService.message(this.ct.CODE_INCORRECT_MSG, TYPES.ERROR)
                      .then(
                        () => {
                          this.verifyCode();
                        }
                      );
                  }
                }, err3 => {
                  // console.log(err3);
                  this.alertService.message(this.ct.CODE_INCORRECT_MSG, TYPES.ERROR)
                    .then(
                      () => {
                        this.verifyCode();
                      }
                    );
                }
              );
          } else if (c.dismiss === 'cancel') {
            this.resendCode();
          }
        },
        err2 => {
          // console.log(err2);
        });
  }

  public redirectToAdmin() {
    this.router.navigate(['login', 'administrator']);
  }

}
