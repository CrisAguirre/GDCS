import { Component } from '@angular/core';
import { AuthenticationService } from './core/servicios/authentication.service';
import { Router, NavigationStart, NavigationEnd, NavigationError, Event } from '@angular/router';
import { statesUser, configMsg } from './compartido/helpers/enums';
import { BnNgIdleService } from 'bn-ng-idle';
import { CommonService } from './core/servicios/common.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CustomTranslateService } from './core/servicios/custom-translate.service';
import { HttpClient } from '@angular/common/http';
import { ConfigApp } from './compartido/helpers/config-app';
import { RolVista } from './compartido/modelos/rol-vista';
import { Vista } from './compartido/modelos/vista';
import { AlertService } from './core/servicios/alert.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {

  private subscribeRouter: any = undefined;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private bnIdle: BnNgIdleService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private http: HttpClient,
    private alertService: AlertService) {

    const _jsonURL = 'assets/conf.json';

    //let loginAdmin = false;
    this.getJSON(_jsonURL).then(data => {
      //CARGAR CONFIGURACION TRANSLATE
      this.ct.loadConfigurationTranslate();

      // LOAD CONFIG
      this.loadConfig()
        .then(res => {
          // configuracion cargada
          this.commonService.mapVarsLoaded();
        })
        .catch(err => console.log('Error Cargando Configuracion Aplicacion: ' + err));

      this.authService.currentUser.subscribe(
        async state => {
          if (state) {
            // escuchar si se expira la session
            this.commonService.getMessageByName(configMsg.TIEMPO_INACTIVIDAD_SESION_MIN).subscribe((time: any) => {
              const seconds = (time.datos.valor * 60);
              this.bnIdle.startWatching(seconds).subscribe((res) => {
                if (res) {
                  //this.commonService.changeStatusSessionExpired();
                  this.commonService.setSessionExpired(true);
                  this.authService.logout();
                }
              }, (error) => {
                console.log('Error', error);
              }, () => {
              });
            });

            //traemos el usuario actual y lo guardamos en el servicio temporal
            let user = this.authService.getUser();
            this.commonService.setVar(configMsg.USER, user);

            //cargar los permisos para vistas
            this.commonService.getVistasRolByRolUsuario(user.idRol)
              .toPromise()
              .then((res: any) => {
                const lstRolVistas: RolVista[] = res.datos;
                this.commonService.getVistas()
                  .toPromise()
                  .then((res2: any) => {
                    const lstVistas: Vista[] = res2.datos;
                    lstRolVistas.forEach(x => {
                      const v = lstVistas.find(z => z.id === x.idVista);
                      x.nombreRuta = v ? v.nombreRuta : null;
                      x.nombreVista = v ? v.nombreVista : null;
                    });
                    //almacenamos en el servicio temporal los permisos
                    if (!this.commonService.getVar(configMsg.VISTAS)) {
                      this.commonService.setVar(configMsg.VISTAS, lstVistas);
                    }

                    if (!this.commonService.getVar(configMsg.VISTAS_ROL_USUARIO)) {
                      this.commonService.setVar(configMsg.VISTAS_ROL_USUARIO, lstRolVistas);
                    }

                  })
                  .catch(err => console.log(err));
              })
              .catch(error => {
                this.alertService.close();
                console.log(error);
              });


            // Validar si el usuario tiene que cambiar la contraseña
            if (user.estadoUsuario === statesUser.FORCE_CHANGE_PASSWORD) {
              // console.log('force change password');
              this.router.navigate(['cuenta', 'cambiar-contrasenia']);
              this.subscribeRouter = router.events.subscribe((event: Event) => {
                // consultar el usuario
                user = this.authService.getUser();
                // desubscribir del router events
                if (!user || user.estadoUsuario !== statesUser.FORCE_CHANGE_PASSWORD) {
                  if (this.subscribeRouter) {
                    this.subscribeRouter.unsubscribe();
                    this.subscribeRouter = undefined;
                    this.router.navigate(['login']);
                    /* if (!user) {
                      this.router.navigate(['login']);
                    } else {
                      this.router.navigate(['/']);
                    } */
                    event = null;
                  }
                }
                if (event instanceof NavigationStart) {
                  this.router.navigate(['cuenta', 'cambiar-contrasenia']);
                }
                if (event instanceof NavigationEnd) {
                  // this.router.navigate(['cambiar-contrasenia']);
                }
                if (event instanceof NavigationError) {
                  //console.log(event.error);
                }
              });

            }
            /*else {
              //if (!user.entradaAdmin) {
                // this.router.navigate(['/']);
              //}
            }*/
            this.alertService.close();
          } else {
            /* if (loginAdmin) {
              this.router.navigate(['administrator']);
            } else {
              this.router.navigate(['login']);
            } */
            this.router.navigate(['login']);
            this.alertService.close();
          }
        },
        err => console.log(err),
        () => this.alertService.close()
      );
    });
  }

  private async getJSON(_jsonURL) {
    const data: any = await this.http.get(_jsonURL).toPromise();
    const ca: ConfigApp = ConfigApp.getInstance();
    ca.api = data.api;
    this.commonService.setConfig();
  }

  private async loadConfig() {
    const res: any = await this.commonService.getAllMessage().toPromise();
    this.commonService.setConfVars(res.datos);
    res.datos.forEach(c => {
      switch (c.nombre) {
        case configMsg.PORTAL_NAME:
          this.commonService.setVar(configMsg.PORTAL_NAME, c.valor);
          break;

        case configMsg.ALLOW_EXTENSIONS:
          this.commonService.setVar(configMsg.ALLOW_EXTENSIONS, c.valor);
          break;

        case configMsg.SIZE_FILE:
          this.commonService.setVar(configMsg.SIZE_FILE, c.valor);
          break;

        case configMsg.WELCOME_MESSAGE:
          this.commonService.setVar(configMsg.WELCOME_MESSAGE, c.valor);
          break;

        case configMsg.HABEAS_DATA_MESSAGE:
          this.commonService.setVar(configMsg.HABEAS_DATA_MESSAGE, c.valor);
          break;

        case configMsg.MAX_YEAR_REGISTER:
          this.commonService.setVar(configMsg.MAX_YEAR_REGISTER, c.valor);
          break;

        case configMsg.MIN_YEAR_REGISTER:
          this.commonService.setVar(configMsg.MIN_YEAR_REGISTER, c.valor);
          break;

        case configMsg.CONFIRMATION_REGISTER_MESSAGE:
          this.commonService.setVar(configMsg.CONFIRMATION_REGISTER_MESSAGE, c.valor);
          break;

        case configMsg.ONLY_CLASIFICATION_ADITIONAL:
          this.commonService.setVar(configMsg.ONLY_CLASIFICATION_ADITIONAL, c.valor);
          break;

        case configMsg.CAMPOS_INGLES_REQUERIDOS:
          this.commonService.setVar(configMsg.CAMPOS_INGLES_REQUERIDOS, c.valor);
          break;
      }
    });
    const msgHabeas = this.commonService.getVar(
      configMsg.HABEAS_DATA_MESSAGE).replace(C.replaceNamePortal, this.commonService.getVar(configMsg.PORTAL_NAME));
    this.commonService.setVar(configMsg.HABEAS_DATA_MESSAGE, msgHabeas);
    const msgWelcome = this.commonService.getVar(
      configMsg.WELCOME_MESSAGE).replace(C.replaceNamePortal, this.commonService.getVar(configMsg.PORTAL_NAME));
    this.commonService.setVar(configMsg.WELCOME_MESSAGE, msgWelcome);
    const msgConfirmationRegister = this.commonService.getVar(
      configMsg.CONFIRMATION_REGISTER_MESSAGE).replace(C.replaceNamePortal, this.commonService.getVar(configMsg.PORTAL_NAME));
    this.commonService.setVar(configMsg.CONFIRMATION_REGISTER_MESSAGE, msgConfirmationRegister);
    this.commonService.setVar(configMsg.CAMPOS_INGLES_REQUERIDOS, this.commonService.getVar(configMsg.CAMPOS_INGLES_REQUERIDOS) === '1');
    return res;
  }
}
