import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigApp } from '@app/compartido/helpers/config-app';

export class BaseService {
    // APIS
    // public ApiUrl: string = "http://40.117.114.61:90/api";
    private _ApiUrl: string;
    public static ApiChatBot: string = "https://portalhumanous.azurewebsites.net/qnamaker/knowledgebases/afb0fa18-ffcb-4a90-996c-98c790e95e7a/generateAnswer";
    public static endPointToken: string = "b06fdebe-efc7-4e27-9e4c-51ea8ec831ed";

    // HEADERS

    public headersJson = new HttpHeaders({
        'Content-Type': 'application/json',
        'accept': '*/*',
        // 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        // 'Access-Control-Allow-Origin': '*',
        // 'Authorization':  `EndpointKey b06fdebe-efc7-4e27-9e4c-51ea8ec831ed`,
    });
    // public headersJson = new HttpHeaders().set('Content-Type', 'application/json');
    public headersCaptcha = new HttpHeaders({
        'Content-Type': 'application/json',
        'accept': '*/*',
        'Access-Control-Allow-Origin': '*',


        // 'Accept': 'application/json,text/plain',
        // 'Content-Type': 'application/jsonp;application/x-www-form-urlencoded;charset=utf-8;',
        // 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        // 'Access-Control-Allow-Origin': '*',
        // 'accept': '*/*',
        // 'Authorization':  `EndpointKey b06fdebe-efc7-4e27-9e4c-51ea8ec831ed`,
    });

    // METODOS API
    public configUrl = 'Configuracion/V1';
    public deparmentUrl = 'Departamento/V1';
    public cityUrl = 'Ciudad/V1';
    public areaKnowledgeUrl = 'AreaConocimiento/V1';
    public maritalStatusUrl = 'EstadoCivil/V1';
    public countryUrl = 'Pais/V1';
    public genderUrl = 'Genero/V1';
    public bloodyTypeUrl = 'GrupoSanguineo/V1';
    public typeIdentificationUrl = 'TipoDocumento/V1';
    public relationshipUrl = 'Parentesco/V1';
    public levelStudyUrl = 'NivelEstudio/V1';
    public typeCoursesUrl = 'TipoCurso/V1';
    public sectorExperienceUrl = 'SectorExperiencia/V1';
    public frecuentlyActivityUrl = 'FrecuenciaActividad/V1';
    public personalActivityUrl = 'ActividadPersonal/V1';
    public institutionUrl = 'Institucion/V1';
    public aproveeDataUrl = 'DatosAprobatorios/V1';
    public detailUserUrl = 'DetalleUsuario/V1';
    public reporteUrl = 'Reporte/V1';
    public sexUrl = 'Sexo/V1';
    // public rolUrl = 'RolUsuario/V1';
    public personalDataUrl = 'DatosPersonales/V1';
    public familyInformationUrl = 'InformacionFamiliar/V1';
    public academicInformationUrl = 'InformacionAcademica/V1';
    public soportsUrl = 'Soporte/V1';
    public workExperienceUrl = 'ExperienciaLaboral/V1';
    public workExperienceRamaUrl = 'ExperienciaLaboralRama/V1';
    public activityInformationUrl = 'InformacionActividad/V1';
    public activityObservationUrl = 'InformacionActividadObservacion/V1';
    public userUrl = 'Usuario/V1';
    public typeFileAnexedUrl = 'TipoArchivoAnexo/V1';
    public annexedUrl = 'Anexo/V1';
    public tipoArchivoAnexoUrl = 'TipoArchivoAnexo/V1';
    public tipoConvocatoriaUrl = 'TipoConvocatoria/V1';
    public tipoCursoUrl = 'TipoCurso/V1';
    public tipoDocumentoUrl = 'TipoDocumento/V1';
    public tipoLugarUrl = 'TipoLugar/V1';
    public tipoSedeUrl = 'TipoSede/V1';
    public actividadConvocatoriaUrl = 'ActividadConvocatoria/V1';
    public convocatoriaUrl = 'Convocatoria/V1';
    public seccionUrl = 'Seccion/V1';
    public etapaUrl = 'Etapa/V1';
    public equivalenciaUrl = 'Equivalencia/V1';
    public tipoAdicionalUrl = 'TipoAdicional/V1';
    public tipoCalificacionUrl = 'TipoCalificacion/V1';
    public tipoPruebaUrl = 'TipoPrueba/V1';
    public tipoEtapaUrl = 'TipoEtapa/V1';
    public tipoSubEtapaUrl = 'TipoSubEtapa/V1';
    public cronogramaUrl = 'Cronograma/V1';
    public adicionalUrl = 'Adicional/V1';
    public configAdicionalUrl = 'ConfigAdicional/V1';
    public combinacionEtapaUrl = 'CombinacionEtapa/V1';
    public tipoDiscapacidadUrl = 'TipoDiscapacidad/V1';
    public tipoEstadoAspiranteUrl = 'TipoEstadoAspirante/V1';
    public tituloObtenidoUrl = 'TipoTituloObtenido/V1';
    public tipoAjusteAcuerdoUrl = 'TipoAjusteAcuerdo/V1';
    public acuerdoConvocatoriaUrl = 'AcuerdoConvocatoria/V1';
    public vistaUrl = 'Vista/V1';
    public rolVistaUrl = 'RolVista/V1';
    public rolUrl = 'Rol/V1';
    public tipoGrupoUrl = 'TipoGrupo/V1';
    public tipoFuncionUrl = 'TipoFuncion/V1';
    public tipoCompetenciaUrl = 'TipoCompetencia/V1';
    public TipoCargoUrl = 'TipoCargo/V1';
    public ConvocatoriaPerfilUrl = 'ConvocatoriaPerfil/V1';
    public modalidadEstudioUrl = 'ModalidadEstudio/V1';
    public favoritoConvocatoriaUrl = 'FavoritoConvocatoria/V1';
    public inscripcionAspiranteUrl = 'InscripcionAspirante/V1';
    public citacionAspiranteUrl = 'CitacionAspirante/V1';
    public notificacionUrl = 'Notificacion/V1';
    public resultadoPruebasUrl = 'ResultadoPruebas/v1';
    public solicitudRecalificacionUrl = 'SolicitudRecalificacion/v1';
    public vacanteUrl = 'Vacante/V1';
    public resultadoCursoFormacionUrl = 'ResultadoCursoFormacion/V1';
    public escalafonRamaUrl = 'EscalafonRama/V1';
    public inscripcionAspiranteVacanteUrl = 'InscripcionAspiranteVacante/V1';
    public declinacionUrl = 'Declinacion/V1';

    // public tipoSubgrupoUrl= 'TipoSubgrupo/V1';
    public tipoDependenciaHijaUrl = 'TipoDependenciaHija/V1';

    public perfilUrl = 'Perfil/V1';
    public perfilTituloUrl = 'PerfilTitulo/V1';
    public perfilEquivalenciaUrl = 'PerfilEquivalencia/V1';
    public perfilExperienciaUrl = 'PerfilExperiencia/V1';
    public cargoUrl = 'Cargo/V1';
    public cargoHumanoUrl = 'CargosHumanoTemp/V1';
    public empresaUrl = 'Empresa/V1';
    public usuarioRolUrl = 'UsuarioRol/V1';
    public empresaUsuarioUrl = 'EmpresaUsuario/V1';
    public cuentaUsuarioAdminUrl = 'CuentaUsuarioAdmin/V1';
    public categoriaVideoTutorialUrl = 'CategoriaVideoTutorial/V1';
    public videoTutorialUrl = 'VideoTutorial/V1';
    public categoriaFaqUrl = 'CategoriaFaq/V1';
    public instructivoUrl = 'Instructivo/V1';
    public faqUrl = 'Faq/V1';
    public categoriaPublicacionUrl = 'CategoriaPublicacion/V1';
    public publicacionUrl = 'Publicacion/V1';
    public tipoFaseUrl = 'TipoFase/V1';
    public tipoFasePruebaUrl = 'TipoFasePrueba/V1';
    public aspiranteConvocatoriaUrl = 'EstadoAspiranteConvocatoria/V1';
    public categoriaAdmitidosUrl = 'CategoriaAdmitidos/V1';
    public aspiranteAdmitidosUrl = 'AspirantesAdmitidos/V1';
    public validacionAdjuntoUrl = 'ValidacionAdjunto/V1';
    public lugarPruebaUrl = 'LugarPrueba/V1';
    public reporteGeneracionUrl = 'ReporteGeneracion/V1';
    public requisitosConvocatoriaUrl = 'ApoyoValidacionReq/V1';
    public DiasRecalificacionUrl = 'DiasRecalificacion/V1';
    public DiasHabilesVacantesUrl = 'DiasHabilesVacantes/V1';
    public admitidosAltasCortesUrl = 'AdmitidosAltasCortes/V1';
    public diasRecalificacionUrl = 'DiasRecalificacion/V1';
    public diasHabilesVacantesUrl = 'DiasHabilesVacantes/V1';
    public procesoSeleccionUrl = 'ProcesoSeleccion/V1';
    public despachoUrl = 'Despacho/V1';
    public AspiranteExcluidoUrl = 'AspiranteExcluido/V1';
    public calendarioUrl = 'Calendario/V1';
    public calendarioDetUrl = 'CalendarioDet/V1';
    public tipoTrasladoUrl = 'TipoTraslado/V1';
    public tipoDocumentoTrasladoUrl = 'TipoDocumentoTraslado/V1';
    public trasladoCSJUrl = 'TrasladoCSJ/V1';
    public soporteXTrasladoUrl = 'SoporteXTraslado/V1';
    public soporteXTrasladoUsuarioUrl = 'SoporteXTrasladoUsuario/V1';
    public ResolucionesCFUrl = 'ResolucionesCF/V1';
    public tipoExperienciaLaboralUrl = 'TipoExperienciaLaboral/V1';
    
    constructor(protected http: HttpClient) {
        // this.headersJson = new HttpHeaders().set('Content-Type', 'application/json');
        // const header = new HttpHeaders().set('Content-Type', 'application/json');
        // 'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
        // 'accept': '*/*',
        // 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
        this.ApiUrl = ConfigApp.getInstance().api;
    }

    protected validate() {
        if (!this.ApiUrl) {
            throw 'Debe configurar la variable ApiUrl!!';
        }
    }

    public getApiUrl() {
        return this.ApiUrl;
    }

    get ApiUrl(): string {
        return this._ApiUrl;
    }

    set ApiUrl(value: string) {
        this._ApiUrl = value;
    }


    // getAll(): Observable<any> {
    //     return this.http.get(this.ApiUrl);
    // }

    // getOne(id: any): Observable<any> {
    //     return this.http.get([this.ApiUrl, id].join('/'));
    // }

    // put(id: any, model: any): Observable<any> {
    //     return this.http.put([this.ApiUrl, id].join('/'), model);
    // }

    // post(model: any): Observable<any> {
    //     return this.http.post([this.ApiUrl].join('/'), model);
    // }

    // delete(id: any): Observable<any> {
    //     return this.http.delete([this.ApiUrl, id].join('/'));
    // }


}
