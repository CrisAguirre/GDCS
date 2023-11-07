import { Component, OnInit } from "@angular/core";
import { CustomTranslateService } from '../servicios/custom-translate.service';
import { AuthenticationService } from '../servicios/authentication.service';
import * as navs from '../navs/navs-principal';
import { CommonService } from '../servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { Vista } from '@app/compartido/modelos/vista';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { RouteInfo } from '@app/compartido/modelos/interfaces';
import { Router } from '@angular/router';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { TrasladosService } from '../servicios/traslados.service';

declare const $: any;


@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent extends BaseController implements OnInit {
  menuItems: RouteInfo[];
  menuItemsAyuda: RouteInfo[];
  menuItemsCuenta: RouteInfo[];

  constructor(
    private ct: CustomTranslateService,
    private auth: AuthenticationService,
    private cs: CommonService,
    private router: Router,
    private trasladoService: TrasladosService
  ) {
    super();

  }

  ngOnInit() {
    // this.menuItems = navs.ROUTES.filter(f => f);

    this.menuItemsAyuda = navs.ROUTES_HELP;
    this.menuItemsCuenta = [];
    this.menuItems = [];
    this.auth.currentUser.subscribe(
      async state => {
        if (state) {

          // traemos el usuario actual y lo guardamos en el servicio temporal
          let user = this.auth.getUser();
          /* try {
            const existeEmpl = (await this.trasladoService.existeEmpleadoByNumDocumento(user.id).toPromise() as any).datos as any;
            if (existeEmpl) {
              user.existeEmpleadoTraslado = true;
              user.numDocumento = existeEmpl.numdocumento;
            }
          } catch (error) {
            user.existeEmpleadoTraslado = false;
            user.numDocumento = null;
          } */
          this.cs.setVar(configMsg.USER, user);

          // Carga los roles asignados al usuario actual
          /* const lstRolesUsuario: UsuarioRol[] = (<any>await this.cs.getRolesPorUsuario(user.id).toPromise()).datos;
          console.log('roles-usuario', lstRolesUsuario); */

          // cargar los permisos para vistas
          const lstRolVistas: RolVista[] = (<any>await this.cs.getVistasRolByRolUsuario(user.idRol).toPromise()).datos as any;
          const lstVistas: Vista[] = (<any>await this.cs.getVistas().toPromise()).datos;
          // console.log('lstRolVistas', lstRolVistas);
          // console.log('lstVistas', lstVistas);

          lstRolVistas.forEach(x => {
            /* if ((x.idVista === 'cba48f3b-59c1-4245-ce48-08d8c533dd72' ) && !user.existeEmpleadoTraslado) {
              const index = lstRolVistas.indexOf(x);
              lstRolVistas.splice(index, 1);
            } else {
              const v = lstVistas.find(z => z.id == x.idVista);
              x.nombreRuta = v ? v.nombreRuta : null;
              x.nombreVista = v ? v.nombreVista : null;
            } */
            const v = lstVistas.find(z => z.id == x.idVista);
            x.nombreRuta = v ? v.nombreRuta : null;
            x.nombreVista = v ? v.nombreVista : null;
            if (user.existeEmpleadoTraslado === false && user.numDocumento === null) {
              if (x.idVista === 'cba48f3b-59c1-4245-ce48-08d8c533dd72' || x.nombreVista.toLowerCase().includes('traslado')) {
                x.permiteActualizar = 0;
                x.permiteCrear = 0;
                x.permiteEliminar = 0;
                x.permiteLectura = 0;
                x.persmisosEspeciales = null;
                const index = lstRolVistas.indexOf(x);
                lstRolVistas.splice(index, 1);
              }
            }


          });

          // almacenamos en el servicio temporal los permisos
          if (!this.cs.getVar(configMsg.VISTAS)) {
            this.cs.setVar(configMsg.VISTAS, lstVistas);
          }

          if (!this.cs.getVar(configMsg.VISTAS_ROL_USUARIO)) {
            this.cs.setVar(configMsg.VISTAS_ROL_USUARIO, lstRolVistas);
          }

          if (user.entradaAdmin === true) {
            // filtramos las vistas con permiso
            this.menuItems = navs.ROUTES_ADMIN.filter(f => f);
            this.menuItemsCuenta = navs.ROUTES_ACCOUNT_USER_ADMIN;
          } else {
            this.menuItems = navs.ROUTES.filter(f => f);
            this.menuItemsCuenta = navs.ROUTES_ACCOUNT_USER;
          }
          this.menuItems = this.menuItems.filter(function (m) {
            const exist = lstRolVistas.find(x => m.path === ('/' + x.nombreRuta));
            if (m.childs && exist) {
              m.childs = m.childs.filter(function (mm) {
                const exist2 = lstRolVistas.find(x => mm.path === x.nombreRuta);
                return exist2;
              });
            }
            return exist;
          });

          /* console.log('lstRolVistas', lstRolVistas);
          console.log('lstVistas', lstVistas);
          console.log('menuItems', this.menuItems); */

          // filtramos las vistas con permiso
          /* this.menuItems = navs.ROUTES.filter(f => f);
          this.menuItems = this.menuItems.filter(function (m) {
            const exist = lstRolVistas.find(x => m.path === ('/' + x.nombreRuta));
            if (m.childs && exist) {
              m.childs = m.childs.filter(function (mm) {
                const exist2 = lstRolVistas.find(x => mm.path === x.nombreRuta);
                return exist2;
              });
            }
            return exist;
          }); */

        }
      }
    );

  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  logout(event) {
    event.preventDefault();
    this.auth.logout();
  }

  changeMainContent(item: RouteInfo) {
    if (item.path == '/convocatoria') {
      this.router.navigate(['convocatoria', 'convocatoria-info']);
    } else if (item.path === '/perfil') {
      this.router.navigate(['perfil', 'perfil-info']);
    }
  }

  clickItem(item: RouteInfo) {
    this.scrollTop();
  }
}
