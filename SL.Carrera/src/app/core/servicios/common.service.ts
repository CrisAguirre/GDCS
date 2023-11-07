import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants } from '@app/compartido/helpers/constants';
import { ConfigApp } from '@app/compartido/helpers/config-app';
import { DatePipe } from '@angular/common';
import { configMsg, PermisosAcciones, PermisosEspeciales } from '@app/compartido/helpers/enums';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { Vista } from '@app/compartido/modelos/vista';
import { Router } from '@angular/router';
import { AlertService, TYPES } from './alert.service';
import { CustomTranslateService } from './custom-translate.service';
import { FilterDetalleUsuario } from '../../compartido/modelos/filter-detalle-usuario';
import { AbstractControl, Validators } from '@angular/forms';
import { Configuration } from '@app/compartido/modelos/configuration';
import { AdmitidoAltasCortesModel } from '@app/compartido/modelos/admitido-altas-cortes-model';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { BaseController } from '../../compartido/helpers/base-controller';
import { Pais } from '@app/compartido/modelos/pais';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { Departamento } from '@app/compartido/modelos/departamento';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends BaseService {

  // VARIABLES EN MEMORIA
  public mapVars = new Map<string, any>();
  public statusSesionExpired: any = { msg: 'expired', show: false };
  private behaviorCompleteMapVars: BehaviorSubject<Boolean>;
  public completeMapVars: Observable<Boolean>;

  private behaviorShowMainPanel: BehaviorSubject<Boolean>;
  public showMainPanel: Observable<Boolean>;

  private confVars = new BehaviorSubject<Configuration[]>(null);
  private appVars = this.confVars.asObservable();

  // CONSTRUCTOR
  constructor(
    protected http: HttpClient,
    public datepipe: DatePipe,
    private route: Router,
    private as: AlertService,
    private ct: CustomTranslateService) {
    super(http);
    this.behaviorCompleteMapVars = new BehaviorSubject<Boolean>(false);
    this.completeMapVars = this.behaviorCompleteMapVars.asObservable();

    this.behaviorShowMainPanel = new BehaviorSubject<Boolean>(true);
    this.showMainPanel = this.behaviorShowMainPanel.asObservable();
  }

  setConfig() {
    this.ApiUrl = ConfigApp.getInstance().api;
  }

  ////// -------------------------- /////
  // METODOS VARIABLES EN MEMORIA
  // public changeStatusSessionExpired() {
  //   this.statusSesionExpired.show = !this.statusSesionExpired.show;
  //   this.statusSesionExpired.msg = "cambie";
  // }

  // public getSessionExpired() {
  //   const show = this.statusSesionExpired.show;
  //   if (show) {
  //     this.changeStatusSessionExpired();
  //   }
  //   return show ? this.statusSesionExpired.msg : null;
  // }

  public setConfVars(vars: Configuration[]) {
    this.confVars.next(vars);
  }

  /**
   * Retorna una promesa con la variable de configuracion
   * @param nameVar Nombre de la variable
   */
  public getVarConfig(nameVar: string): Promise<Configuration> {
    return new Promise((resolve, reject) => {
      this.appVars.subscribe(
        vars => resolve(vars.find(x => x.nombre === nameVar))
        , error => reject(error));
    });
  }

  /**
   * Retorna una promesa con todas las variables de configuración
   */
  public getAllVarConfig(): Promise<Configuration[]> {
    return new Promise((resolve, reject) => {
      this.appVars.subscribe(
        vars => resolve(vars)
        , error => reject(error));
    });
  }

  /**
   * Metodo para desactivar o activar el campo de ingles requerido
   * @param controll es el formcontrol del campo ingles
   */
  public campoInglesRequerido(controll: AbstractControl): boolean {
    const requerido = this.getVar(configMsg.CAMPOS_INGLES_REQUERIDOS);
    if (requerido) {
      controll.setValidators([Validators.required]);
    } else {
      controll.clearValidators();
    }
    controll.updateValueAndValidity();
    return requerido;
  }

  public getConfigJson() {
    const jsonURL = 'assets/conf.json';
    return this.http.get(jsonURL);
  }

  public isSessionExpired(): boolean {
    const val = localStorage.getItem(Constants.KEY_SESSION_EXPIRED);
    return val ? true : false;
  }

  public setSessionExpired(sessionExpired: boolean) {
    if (sessionExpired) {
      localStorage.setItem(Constants.KEY_SESSION_EXPIRED, String(true));
    } else {
      localStorage.removeItem(Constants.KEY_SESSION_EXPIRED);
    }
  }

  public getCompleteMapVars(): Boolean {
    return this.behaviorCompleteMapVars.value;
  }

  public mapVarsLoaded() {
    this.behaviorCompleteMapVars.next(true);
  }

  public getShowMainPanel(): Boolean {
    return this.behaviorShowMainPanel.value;
  }

  public showMainPnl() {
    this.behaviorShowMainPanel.next(false);
  }

  public setVar(key: string, value: any) {
    this.mapVars.set(key, value);
  }

  public getVar(key: string) {
    return this.mapVars.get(key);
  }
  ////// -------------------------- /////


  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

  public getFormatDate(date: Date, format: string = 'dd/MM/yyyy') {
    return this.datepipe.transform(date, format);
  }


  public hasPermissionUser(path: string) {
    const lstVistas: Vista[] = this.getVar(configMsg.VISTAS);
    if (lstVistas != null) {
      const lstRolVistas: RolVista[] = this.getVar(configMsg.VISTAS_ROL_USUARIO);
      if (lstRolVistas != null) {
        const vista = lstVistas.find(v => v.nombreRuta.toLowerCase() === path.toLocaleLowerCase());
        if (vista) {
          const rolUsuario = lstRolVistas.find(r => r.idVista === vista.id);
          return rolUsuario ? vista : null;
        }
      }
    }
    return null;
  }


  public hasPermissionUserArray(paths: string[]): RolVista {
    // cargar las vistas guardadas en memoria
    const lstVistas: Vista[] = this.getVar(configMsg.VISTAS);
    if (lstVistas != null) {
      // cargar los roles vista guardados en memoria
      const lstRolVistas: RolVista[] = this.getVar(configMsg.VISTAS_ROL_USUARIO);
      if (lstRolVistas != null) {
        // obtener el ultimo valor
        const pathCurrent = paths[paths.length - 1];
        // console.log(paths);
        // if (pathCurrent.includes('cargos-convocatoria')) {
        //   debugger;
        // }
        // filtrar las vistas por ruta
        const lstViewsFinded: Vista[] = lstVistas.filter(v => v.nombreRuta.toLowerCase() === pathCurrent.toLocaleLowerCase());
        let pos = paths.length - 1;
        // buscar la vista en la lista filtrada
        let vista = lstViewsFinded.find(v => {
          let finded = false;
          let vCurrent = v;
          while (pos > 0) {
            if (vCurrent && vCurrent.nombreRuta === paths[pos]) {
              finded = true;
              pos--;
              vCurrent = lstVistas.find(parent => parent.id === vCurrent.idReferencia);
            } else {
              pos = paths.length - 1;
              finded = false;
              break;
            }
          }
          if (finded) {
            return v;
          }
        });
        // si encuentra la vista
        if (vista) {
          // buscar el rol vista
          const rolVista = lstRolVistas.find(r => r.idVista === vista.id);
          return rolVista ? rolVista : null;
        }
      }
    }
    return null;
  }




  public hasPermissionUserAction(actions: number[], path?: string) {
    // obtener la ruta actual
    let pathCurrent = this.route.url;

    // si se envio una ruta
    if (path) {
      // se agrega la ruta enviada al path actual (sirve cuando es un cambio de vista sin ruta en el path)
      pathCurrent = pathCurrent + '/' + path;
    }

    // separar el path
    const paths = pathCurrent.split('/');

    // buscar el rol bvista
    const rolVista: RolVista = this.hasPermissionUserArray(paths);
    if (rolVista == null) {
      return false;
    }

    let hasPermission = false;
    let typePermission = -1;

    // validar que tenga el permiso de accion
    for (let i = 0; i < actions.length; i++) {
      switch (actions[i]) {
        case PermisosAcciones.Crear:
          hasPermission = rolVista.permiteCrear === 1;
          break;

        case PermisosAcciones.Actualizar:
          hasPermission = rolVista.permiteActualizar === 1;
          break;

        case PermisosAcciones.Lectura:
          hasPermission = rolVista.permiteLectura === 1;
          break;

        case PermisosAcciones.Eliminar:
          hasPermission = rolVista.permiteEliminar === 1;
          break;
      }
      if (!hasPermission) {
        typePermission = actions[i];
      }
    }
    // mostrar mensaje si no tiene permiso para realizar esta accion
    if (!hasPermission && typePermission !== PermisosAcciones.Lectura) {
      this.as.message(this.ct.MSG_NO_TIENE_PERMISO_ACCION, TYPES.WARNING);
    }

    if (!hasPermission) {
      console.log('NO TIENE PERMISO:', pathCurrent)
    }

    // retorna true si tiene permiso y false en caso contrario
    return hasPermission;

  }

  public hasPermissionUserActionEspecial(actions: any[], path?: string) {
    // obtener la ruta actual
    let pathCurrent = this.route.url;

    // si se envio una ruta
    if (path) {
      // se agrega la ruta enviada al path actual (sirve cuando es un cambio de vista sin ruta en el path)
      pathCurrent = pathCurrent + '/' + path;
    }

    // separar el path
    const paths = pathCurrent.split('/');

    // buscar el rol bvista
    const rolVista: RolVista = this.hasPermissionUserArray(paths);
    if (rolVista == null) {
      return false;
    }

    let hasPermission = false;
    let typePermission = -1;

    // validar que tenga el permiso de accion
    for (let i = 0; i < actions.length; i++) {
      switch (actions[i]) {

        case PermisosEspeciales.BotonPublicar:
          hasPermission = this.tienePermission(rolVista.persmisosEspeciales, PermisosEspeciales.BotonPublicar);
          break;

        case PermisosEspeciales.EnviarCorreo:
          hasPermission = this.tienePermission(rolVista.persmisosEspeciales, PermisosEspeciales.EnviarCorreo);
          break;

        case PermisosEspeciales.BotonFinalizar:
          hasPermission = this.tienePermission(rolVista.persmisosEspeciales, PermisosEspeciales.BotonFinalizar);
          break;
      }
      if (!hasPermission) {
        typePermission = actions[i];
      }
    }
    // mostrar mensaje si no tiene permiso para realizar esta accion
    if (!hasPermission && typePermission !== PermisosAcciones.Lectura) {
      //this.as.message(this.ct.MSG_NO_TIENE_PERMISO_ACCION, TYPES.WARNING);
    }

    if (!hasPermission) {
      console.log('NO TIENE PERMISO ESPECIAL:', actions + ' - ' + pathCurrent)
    }

    // retorna true si tiene permiso y false en caso contrario
    return hasPermission;

  }

  private tienePermission(persmisosEspeciales: string, permisoComparar: string) {
    if (persmisosEspeciales && permisoComparar) {
      return persmisosEspeciales.includes(permisoComparar);
    }
    return false;
  }

  ////// -------------------------- /////
  // SERVICIOS API

  // CONFIGURACION
  public getMessageByName(name: string) {
    const ruta = [this.ApiUrl, this.configUrl, 'ObtenerConfiguracionPorNombre', name].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getAllMessage() {
    const ruta = [this.ApiUrl, this.configUrl, 'ListarTodosConfiguraciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getConfigTabsCV() {
    const ruta = [this.ApiUrl, this.configUrl, 'ListarConfiguracionesTabHV'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }


  // DEPARTAMENTO
  public getDepartmentsByCountry(idCountry: any) {
    const params = JSON.stringify({ idPais: idCountry });
    const ruta = [this.ApiUrl, this.deparmentUrl, 'ListarDepartamentosPorPais'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getDepartmentById(id: number) {
    const ruta = [this.ApiUrl, this.deparmentUrl, `ObtenerDepartamentoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDepartamentos() {
    const ruta = [this.ApiUrl, this.deparmentUrl, 'ListarTodosDepartamentos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveDepartment(data: Departamento) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.deparmentUrl, `ModificarDepartamento/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.deparmentUrl, 'CrearDepartamento'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteDepartamento(data: Departamento) {
    const ruta = [this.ApiUrl, this.deparmentUrl, `BorrarDepartamento/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // CIUDAD
  public getCitiesByDepartment(idDepartment: any) {
    const params = JSON.stringify({ idDepartamento: idDepartment });
    const ruta = [this.ApiUrl, this.cityUrl, 'ListarCiudadesPorDepartamento'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getinformacionCiudadPorIdCiudad(id: number) {
    const ruta = [this.ApiUrl, this.cityUrl, `ObtenerInformacionPorIdCiudad/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCityById(id: number) {
    const ruta = [this.ApiUrl, this.cityUrl, `ObtenerCiudadPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCiudades() {
    const ruta = [this.ApiUrl, this.cityUrl, 'ListarTodosCiudades'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveCity(data: Ciudad) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.cityUrl, `ModificarCiudad/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.cityUrl, 'CrearCiudad'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteCiudad(data: Ciudad) {
    const ruta = [this.ApiUrl, this.cityUrl, `BorrarCiudad/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // AREA CONOCIMIENTOS
  public getAreaKnowledge() {
    const ruta = [this.ApiUrl, this.areaKnowledgeUrl, 'ListarTodosAreaConocimientos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // ESTADO CIVIL
  public getMaritalStatus() {
    const ruta = [this.ApiUrl, this.maritalStatusUrl, 'ListarEstadoCiviles'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getMaritalStatuById(id: string) {
    const ruta = [this.ApiUrl, this.maritalStatusUrl, `ObtenerEstadoCivilPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // PAISES
  public getCountries() {
    const ruta = [this.ApiUrl, this.countryUrl, 'ListarTodosPaises'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCountryById(id: string) {
    const ruta = [this.ApiUrl, this.countryUrl, `ObtenerPaisPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveCountry(data: Pais) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.countryUrl, `ModificarPais/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.countryUrl, 'CrearPais'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deletePais(data: Pais) {
    const ruta = [this.ApiUrl, this.countryUrl, `BorrarPais/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // GENEROS
  public getGenders() {
    const ruta = [this.ApiUrl, this.genderUrl, 'ListarTodosGeneros'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public getGenderById(id: string) {
    const ruta = [this.ApiUrl, this.genderUrl, `ObtenerGeneroPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // GRUPOS SANGUINEOS
  public getBloodyTypes() {
    const ruta = [this.ApiUrl, this.bloodyTypeUrl, 'ListarTodosGrupoSanguineos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getBloodyTypeById(id: string) {
    const ruta = [this.ApiUrl, this.bloodyTypeUrl, `ObtenerGrupoSanguineoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // TIPOS DE IDENTIFICACION
  public getTypesIdentification() {
    const ruta = [this.ApiUrl, this.typeIdentificationUrl, 'ListarTodosTipoDocumentos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTypesIdentificationById(id: string) {
    const ruta = [this.ApiUrl, this.typeIdentificationUrl, `ObtenerTipoDocumentoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // PARENTESCO
  public getRelationship() {
    const ruta = [this.ApiUrl, this.relationshipUrl, 'ListarTodosParentescos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getRelationshipById(id: string) {
    const ruta = [this.ApiUrl, this.relationshipUrl, `ObtenerParentescoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // NIVEL ESTUDIO
  public getLevelStudy() {
    const ruta = [this.ApiUrl, this.levelStudyUrl, 'ListarTodosNivelEstudios'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // MODALIDAD ESTUDIO
  public getModalidadEstudio() {
    const ruta = [this.ApiUrl, this.modalidadEstudioUrl, 'ListarModalidades'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // TIPO ESTUDIO
  public getTipoEstudio() {
    const ruta = [this.ApiUrl, this.modalidadEstudioUrl, 'ListarTiposEstudio'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoEstudioById(id: string) {
    const params = JSON.stringify({ idReferencia: id });
    const ruta = [this.ApiUrl, this.modalidadEstudioUrl, `ListarModalidadesPorTipo`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  // TIPO CURSO
  public getTypeCourses() {
    const ruta = [this.ApiUrl, this.typeCoursesUrl, 'ListarTodosTiposCursos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // SECTOR EXPERIENCIA
  public getSectorExperience() {
    const ruta = [this.ApiUrl, this.sectorExperienceUrl, 'ListarTodosSectorExperiencias'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // FRECUENCIA DE LA ACTIVIDAD
  public getFrecuentlyActivity() {
    const ruta = [this.ApiUrl, this.frecuentlyActivityUrl, 'ListarTodosFrecuenciasActividades'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // ACTIVIDADES PERSONALES
  public getPersonalActivity() {
    const ruta = [this.ApiUrl, this.personalActivityUrl, 'ListarTodosActividadesPersonales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // INSTITUCIONES
  public getInstitutions() {
    const ruta = [this.ApiUrl, this.institutionUrl, 'ListarTodosInstituciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSearchInstitutions(search: string) {
    const ruta = [this.ApiUrl, this.institutionUrl, 'ListarInstituciones' + `?Q=${search}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // DETALLE USUARIO
  public getDetailPorcentageUser(idUser: string) {
    const ruta = [this.ApiUrl, this.detailUserUrl, `ObtenerPorcentajeDetallePorIdUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDetailSummaryUser(idUser: string) {
    const ruta = [this.ApiUrl, this.detailUserUrl, `ObtenerDetallePorIdUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getFiltro(paramsFilter: FilterDetalleUsuario) {

    let cadena: string[] = [];
    for (let i in paramsFilter) {
      if (paramsFilter[i]) {
        cadena.push(i + '=' + paramsFilter[i]);
      }
    }

    const cadenaString = cadena.join('&');
    const params = JSON.stringify(paramsFilter);
    const ruta = [this.ApiUrl, this.reporteUrl, `FiltrarInformacionPorUsuario?${cadenaString}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  // DATOS APROVATORIOS
  public getAproveeDataByUser(idUser: string) {
    const ruta = [this.ApiUrl, this.aproveeDataUrl, 'ListarPorUsuario', idUser].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public createAproveeData(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.aproveeDataUrl, 'CrearDatosAprobatorios'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  public updateAproveeData(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.aproveeDataUrl, `ModificarDatosAprobatorios/${data.id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  // SEXO
  public getSex() {
    const ruta = [this.ApiUrl, this.sexUrl, 'ListarTodosSexos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSexById(id: string) {
    const ruta = [this.ApiUrl, this.sexUrl, `ObtenerSexoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // USUARIOS

  public saveUserAdmin(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.userUrl, `ModificarUsuario/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.userUrl, 'CrearUsuarioAdministrativo'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public getUsers() {
    const ruta = [this.ApiUrl, this.userUrl, 'ListarTodosUsuarios'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosUsuariosAdministrativos() {
    const ruta = [this.ApiUrl, this.userUrl, 'ListarTodosUsuariosAdministrativos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosUsuariosAdministrativosByEmpresa(idEmpresa: boolean) {
    const ruta = [this.ApiUrl, this.userUrl, 'ListarTodosUsuariosAdministrativos' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public modificarEstadoUsuarioActivo(id: any) {
    const params = JSON.stringify({ id });
    const ruta = [this.ApiUrl, this.userUrl, `ModificarEstadoUsuarioActivo/${id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public modificarEstadoUsuarioInactivo(id: any) {
    const params = JSON.stringify({ id });
    const ruta = [this.ApiUrl, this.userUrl, `ModificarEstadoUsuarioInactivo/${id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public getUsuarioPorEmail(email: any) {
    const ruta = [this.ApiUrl, this.userUrl, 'ObtenerUsuarioPorEmail' + `?Email=${email}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // RolVistas
  public getRolVistas() {
    const ruta = [this.ApiUrl, this.rolVistaUrl, 'ListarRolVista'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // TIPO ARCHIVO
  public getTypeFileAnnexed() {
    const ruta = [this.ApiUrl, this.typeFileAnexedUrl, 'ListarTipoArchivoAnexo'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // ANEXO
  public getAnnexes() {
    const ruta = [this.ApiUrl, this.annexedUrl, 'ListarAnexos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // ANEXO
  public chatBot(data: any) {
    const params = JSON.stringify(data);
    const ruta = BaseService.ApiChatBot;
    // console.log(params, ruta);
    // const httpHeadersChatBot = new HttpHeaders(
    //   {
    //       'Content-Type': 'application/json',
    //       'Authorization':  `EndpointKey b06fdebe-efc7-4e27-9e4c-51ea8ec831ed`,
    //       'accept': '*/*',
    //   });
    // const httpHeadersChatBot = Constants.cloneObject(this.headersJson);
    // httpHeadersChatBot.set('Authorization',  `EndpointKey b06fdebe-efc7-4e27-9e4c-51ea8ec831ed`);
    // console.log(httpHeadersChatBot);
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  // Instructivo
  public getInstructivo() {
    const ruta = [this.ApiUrl, this.instructivoUrl, 'ListarTodosInstructivos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // DISCAPACIDAD
  public getDiscapacidad() {
    const ruta = [this.ApiUrl, this.tipoDiscapacidadUrl, 'ListarTipoDiscapacidad'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDiscapacidadById(id: string) {
    const ruta = [this.ApiUrl, this.tipoDiscapacidadUrl, `ObtenerTipoDiscapacidadPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // CATEGORIA PUBLICACION
  public getCategoriaPublicacion() {
    const ruta = [this.ApiUrl, this.categoriaPublicacionUrl, 'ListarPublicacion'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCategoriaPublicacionById(id: string) {
    const ruta = [this.ApiUrl, this.categoriaPublicacionUrl, `ObtenerCategoriaPublicacionPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // Estado aspirante convocatoria
  public getEstadoAspiranteConvocatoria() {
    const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, 'ListarEstadoAspiranteConv'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getEstadoAspiranteConvocatoriaById(id: string) {
    const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, `ObtenerEstadoAspiranteConvocatoriaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // categoriaFaq
  public getCategoriasFaq() {
    const ruta = [this.ApiUrl, this.categoriaFaqUrl, 'ListarTodosCategoriasFaq'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // preguntaFaq
  public getPreguntasFaq() {
    const ruta = [this.ApiUrl, this.faqUrl, 'ListarPreguntas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // preguntaFaq
  public getRespuestaFaq() {
    const ruta = [this.ApiUrl, this.faqUrl, 'ListarRespuestas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // categoria video tutorial
  public getCategoriasVideoTutorial() {
    const ruta = [this.ApiUrl, this.categoriaVideoTutorialUrl, 'ListarTodosCategoriasVideoTutoriales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // Video tutorial
  public getVideoTutorial() {
    const ruta = [this.ApiUrl, this.videoTutorialUrl, 'ListarTodosVideoTutoriales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // lista categoria video tutorial
  public getListaCategoriaCideoTutorial() {
    const ruta = [this.ApiUrl, this.videoTutorialUrl, 'ListarVideosVisiblesPorCategorias'].join('/');
    return this.http.post(ruta, { headers: this.headersJson });

  }

  // TÍTULO OBTENIDO
  public getTitulos() {
    const ruta = [this.ApiUrl, this.tituloObtenidoUrl, 'ListarTodosTipoTituloObtenido'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTituloObtenido(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tituloObtenidoUrl, `ModificarTipoTituloObtenido/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tituloObtenidoUrl, `CrearTipoTituloObtenido`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTituloObtenido(data: any) {
    const ruta = [this.ApiUrl, this.tituloObtenidoUrl, `BorrarTipoTituloObtenido/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // END TÍTULO OBTENIDO

  // VISTAS
  public getVistas() {
    const ruta = [this.ApiUrl, this.vistaUrl, 'ListarTodosVista'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getVistaById(id: any) {
    const ruta = [this.ApiUrl, this.vistaUrl, `ObtenerVistaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveVista(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vistaUrl, `ModificarVista/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.vistaUrl, `CrearVista`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteVista(data: any) {
    const ruta = [this.ApiUrl, this.vistaUrl, `BorrarVista/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public buildTreeVistas(lstVistas: Vista[]) {
    const nest = (items, id = null, link = 'idReferencia') => items
      .filter(item => item[link] === id)
      .map(item => ({ ...item, hijosVista: nest(items, item.id) }));
    const tree = nest(lstVistas);
    return tree;
  }
  //#region  Informacion Academica
  public getInformacionAcademica() {
    const ruta = [this.ApiUrl, this.academicInformationUrl, 'ListarTodosInformacionAcademica'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region  EXPERIENCIA LABORAL
  public getExperienciaLaboral() {
    const ruta = [this.ApiUrl, this.workExperienceUrl, 'ListarTodosExperienciaLaboral'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion


  //#region VISTAS ROL USUARIO
  public getVistasRolUsuario() {
    const ruta = [this.ApiUrl, this.rolVistaUrl, 'ListarTodosRolVista'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveVistaRolUsuario(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.rolVistaUrl, `ModificarRolVista/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.rolVistaUrl, `CrearRolVista`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteVistaRolUsuario(data: any) {
    const ruta = [this.ApiUrl, this.rolVistaUrl, `BorrarRolVista/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getVistasRolByRolUsuario(idRol: number) {
    const params = JSON.stringify({ idRol });
    const ruta = [this.ApiUrl, this.rolVistaUrl, 'ObtenerRolVistaPorRolUsuario'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region ROL USUARIO
  public getRolUsuario() {
    const ruta = [this.ApiUrl, this.rolUrl, 'ListarTodosRoles'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveRolUsuario(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.rolUrl, `ModificarRol/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.rolUrl, `CrearRol`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteRolUsuario(data: any) {
    const ruta = [this.ApiUrl, this.rolUrl, `BorrarRol/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getRolesPorEmpresa(idEmpresa: any) {
    const ruta = [this.ApiUrl, this.rolUrl, `ListarRolesPorEmpresa/${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region USUARIO ROL
  public getRolesPorUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.usuarioRolUrl, `ListarRolesPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getRolesPorUsuarioToken(idUsuario: string, token: string) {
    const ruta = [this.ApiUrl, this.usuarioRolUrl, `ListarRolesPorUsuario/${idUsuario}`].join('/');
    const header = {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('accept', '*/*')
    };
    return this.http.get(ruta, header);
  }

  public getListarTodosUsuarioRol() {
    const ruta = [this.ApiUrl, this.usuarioRolUrl, `ListarTodosUsuarioRol`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveUsuarioRol(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.usuarioRolUrl, `ModificarUsuarioRol/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.usuarioRolUrl, `CrearUsuarioRol`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteUsuarioRol(id: any) {
    const ruta = [this.ApiUrl, this.usuarioRolUrl, `BorrarUsuarioRol/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region EMPRESA USUARIO
  public saveEmpresaUsuario(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.empresaUsuarioUrl, `ModificarEmpresaUsuario/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.empresaUsuarioUrl, `CrearEmpresaUsuario`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteEmpresaUsuario(id: any) {
    const ruta = [this.ApiUrl, this.empresaUsuarioUrl, `BorrarEmpresaUsuario/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getListarTodosEmpresaUsuario() {
    const ruta = [this.ApiUrl, this.empresaUsuarioUrl, `ListarTodosEmpresaUsuario`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarEmpresasPorUsuario(idUsuario: any) {
    const ruta = [this.ApiUrl, this.empresaUsuarioUrl, `ListarEmpresasPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region INSCRIPCION ASPIRANTE
  public getInscripcionAspiranteById(idInscripcionAspirante: any) {
    const params = JSON.stringify({ idInscripcionAspirante });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionPorId/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesUsuario(idUsuario: any) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionesUsuario/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesByNumeroDocumento(numeroDocumento: string) {
    const params = JSON.stringify({ numeroDocumento });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionesPorNumeroDocumento/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionesConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesConvocatoriaSR(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionesConvocatoriaSR/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveInscripcionAspirante(data: any) {
    const params = JSON.stringify(data);
    // if (data.id) { se lo quito porque ese metodo no existe
    //   const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ModificarInscripcionAspirante/${data.id}`].join('/');
    //   return this.http.put(ruta, params, { headers: this.headersJson });
    // } else {
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `CrearInscripcionAspirante`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
    // }
  }

  public actualizarEstadoInscripcionAspirante(id: string, idUsuarioMod: string, idEstad: string) {
    const params = JSON.stringify(
      {
        id,
        idUsuarioModificacion: idUsuarioMod,
        idEstado: idEstad
      }
    );
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarEstadoAspirantePorId`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public actualizarEstadoAspiranteByUsuarioConvocatoria(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarEstadoAspirantePorUsuarioConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public actualizarEstadoAspiranteByUsuarioConvocatoriaPerfil(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarEstadoAspirantePorUsuarioConvocatoriaPerfil/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public anularInscripcionAspirante(idConvocatoria: any, idUsuario: any, idConvocatoriaPerfil: any) {
    const params = JSON.stringify({ idConvocatoria, idUsuario, idConvocatoriaPerfil });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `AnularInscripcionUsuario/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public deleteInscripcionAspirante(idConvocatoria: string, idUsuario: string) {
    // const params = JSON.stringify({idConvocatoria, idUsuario});
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `AnularInscripcion/${idConvocatoria}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public actualizarInscripcionHV(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarInscripcionHV`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public actualizarRecalificacion(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarRecalificacion`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesEmpresa(idEmpresa: any) {
    const params = JSON.stringify({ idEmpresa });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ObtenerInscripcionesPorEmpresa/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  //#endregion

  //#region Notificaciones
  public getTodosNotificaciones() {
    const ruta = [this.ApiUrl, this.notificacionUrl, `ListarTodosNotificaciones/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getNotificacionById(id: any) {
    const ruta = [this.ApiUrl, this.notificacionUrl, `ObtenerNotificacionPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosNotificacionesByUsuario(idUsuario: any) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.notificacionUrl, `ListarTodosPorUsuario/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveNotificacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.notificacionUrl, `ModificarNotificacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.notificacionUrl, `CrearNotificacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteNotificacion(id: any) {
    const ruta = [this.ApiUrl, this.notificacionUrl, `BorrarNotificacion/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion Notificacion



  //#region ADMITIDO ALTAS CORES
  public getAdmitidosAltasCortesById(idAdmitidosAltasCortes: any) {
    const params = JSON.stringify({ idAdmitidosAltasCortes });
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `ObtenerAdmitidosAltasCortesPorId/{id}/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveAdmitidosAltasCortes(data: AdmitidoAltasCortesModel) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `CrearAdmitidosAltasCortes`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  public getAdmitidosAltasCortesUsuario(idUsuario: any) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `ObtenerAdmitidosPorUsuario/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getAdmitidosAltasCortesConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `ObtenerAdmitidosPorConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getAdmitidosAltasCortesInscripcion(IdInscripcionAspirante: any) {
    const params = JSON.stringify({ IdInscripcionAspirante });
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `ObtenerAdmitidosPorInscripcion/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  public updateAdmitidosAltasCortes(data: AdmitidoAltasCortesModel) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `ModificarAdmitidosAltasCortes/${data.id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }


  public deleteAdmitidosAltasCortes(id: string) {
    const ruta = [this.ApiUrl, this.admitidosAltasCortesUrl, `BorrarAdmitidosAltasCortes/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion


  // CALENDARIO
  public getCalendario() {
    const ruta = [this.ApiUrl, this.calendarioUrl, 'ListarTodosCalendarios'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveCalendario(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.calendarioUrl, `ModificarCalendario/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.calendarioUrl, `CrearCalendario`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCalendario(data: any) {
    const ruta = [this.ApiUrl, this.calendarioUrl, `BorrarCalendario/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // END CALENDARIO


  // DETALLES CALENDARIO
  public getCalendarioDet() {
    const ruta = [this.ApiUrl, this.calendarioDetUrl, 'ListarTodosCalendarioDet'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveCalendarioDet(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.calendarioDetUrl, `ModificarCalendarioDet/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.calendarioDetUrl, `CrearCalendarioDet`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCalendarioDet(data: any) {
    const ruta = [this.ApiUrl, this.calendarioDetUrl, `BorrarCalendarioDet/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // END DETALLES CALENDARIO


  // metodos

  public getNameAspirante(element: InscripcionAspiranteModel) {
    if(element){
      const nombreAspirante = [
        element.resumenHVModel.datosPersonales.primerNombre,
        element.resumenHVModel.datosPersonales.segundoNombre,
        element.resumenHVModel.datosPersonales.primerApellido,
        element.resumenHVModel.datosPersonales.segundoApellido,
      ].join(' ');
      return nombreAspirante;
    }
    return '';
  }

  public getCargoAspirante(element: InscripcionAspiranteModel) {
    if (element && element.convocatoriaPerfilModel && element.convocatoriaPerfilModel.perfil) {
      if (element.convocatoriaPerfilModel.perfil.idTipoCargo) {
        return BaseController.translateField(element.convocatoriaPerfilModel.perfil.cargoModel, 'cargo', this.getLang());
      } else {
        return element.convocatoriaPerfilModel.perfil.cargoHumanoModel.cargo;
      }
    }
    return '';
  }

  public getGradoCargo(element: InscripcionAspiranteModel) {
    if (element && element.convocatoriaPerfilModel) {
      if (element.convocatoriaPerfilModel.perfil) {
        if (element.convocatoriaPerfilModel.perfil.idTipoCargo) {
          return element.convocatoriaPerfilModel.perfil.idGradoCargo;
        } else {
          return element.convocatoriaPerfilModel.perfil.idGradoCargo;
        }
      }
    }
    return '';
  }

  public getIdCargoAspirante(element: InscripcionAspiranteModel) {
    if (element && element.convocatoriaPerfilModel && element.convocatoriaPerfilModel.perfil) {
      if (element.convocatoriaPerfilModel.perfil.idTipoCargo) {
        return element.convocatoriaPerfilModel.perfil.cargoModel.id;
      } else {
        return element.convocatoriaPerfilModel.perfil.cargoHumanoModel.codCargo;
      }
    }
    return '';
  }

  public getTipoDependencia(element: InscripcionAspiranteModel) {
    if (element && element.convocatoriaPerfilModel && element.convocatoriaPerfilModel.perfil) {
      if (element.convocatoriaPerfilModel.perfil.tipoLugar) {
        return BaseController.translateField(element.convocatoriaPerfilModel.perfil.tipoLugar, 'tipo', this.getLang());
      }
    }
    return '';
  }

  public getEstadoAspirante(element: InscripcionAspiranteModel) {
    if (element && element.estadoAspiranteModel) {
      if (element.estadoAspiranteModel.nombreCategoria) {
        return BaseController.translateField(element.estadoAspiranteModel, 'nombreCategoria', this.getLang());
      }
    }
    return '';
  }

  public getDependenciaLugar(element: InscripcionAspiranteModel) {
    if (element && element.convocatoriaPerfilModel && element.convocatoriaPerfilModel.perfil) {
      if (element.convocatoriaPerfilModel.perfil.dependenciaHija) {
        return BaseController.translateField(element.convocatoriaPerfilModel.perfil.dependenciaHija, 'nombre', this.getLang());
      }
    }
    return '';
  }

  public getNumeroDocumento(element: InscripcionAspiranteModel) {
    if (element && element.resumenHVModel && element.resumenHVModel.datosPersonales) {
      return element.resumenHVModel.datosPersonales.numeroDocumento;
    }
    return '';
  }

  public getLang() {
    return this.ct.getLangDefault().langBd;
  }

  public formulaPuntajesClasificatoria(
    seleccionPuntajeMin: number,
    seleccionPuntajeMax: number,
    clasificatoriaPuntajeMin: number,
    clasificatoriaPuntajeMax: number,
    puntajePrueba: number,
    varc: Configuration) {
    try {
      // const varc = await this.getVarConfig(configMsg.FORMULA_PUNTAJES_ETAPA_CLASIFICATORIA);
      /* const val1 = 800;
       const val2 = 1000;
       const val3 = 300;
       const val4 = 600;
       const val5 = 850;*/
      const val1 = seleccionPuntajeMin;
      const val2 = seleccionPuntajeMax;
      const val3 = clasificatoriaPuntajeMin;
      const val4 = clasificatoriaPuntajeMax;
      const val5 = puntajePrueba;
      const obj = JSON.parse(varc.valor);
      let formula: string = obj.formula;
      while (formula.includes('X') || formula.includes('Y')) {
        formula = formula.replace(obj.variables.seleccionPuntajeMin, String(val1));
        formula = formula.replace(obj.variables.seleccionPuntajeMax, String(val2));
        formula = formula.replace(obj.variables.clasificatoriaPuntajeMin, String(val3));
        formula = formula.replace(obj.variables.clasificatoriaPuntajeMax, String(val4));
        formula = formula.replace(obj.variables.puntajePrueba, String(val5));
      }
      return Number(eval(formula));
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  // end metodos




}
