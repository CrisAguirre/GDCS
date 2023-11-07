import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatSnackBar } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, PermisosAcciones, PermisosEspeciales, stateConvocatoria } from '@app/compartido/helpers/enums';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { Empresa } from '@app/compartido/modelos/empresa';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants } from '@app/compartido/helpers/constants';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { TypeDocument } from '@app/compartido/modelos/type-document';
import { CategoriaAdmintidoModel } from '@app/compartido/modelos/categoria-admitido-model';
import { ValidacionAdjuntoModel } from '@app/compartido/modelos/validacion-adjunto-model';
import { AspiranteAdmintidoModel } from '@app/compartido/modelos/aspirante-admitido-model';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { WorkExperienceRama } from '@app/compartido/modelos/work-experience-rama';
import { RequisitosConvocatoriaModel } from '@app/compartido/modelos/requisitos-convocatoria-model';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';
import { CDays360 } from '@app/compartido/helpers/days360';
import { ReportesService } from '@app/core/servicios/reportes.service';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';
import { TituloObtenido } from '@app/compartido/modelos/titulo-obtenido';
import { LevelStudy } from '@app/compartido/modelos/level-study';
import { ConfigAdicional } from '@app/compartido/modelos/configuracion-adicional';
import { TipoAdicional } from '@app/compartido/modelos/tipo-adicional';
import { Adicional } from '@app/compartido/modelos/adicional';
import { Configuration } from '@app/compartido/modelos/configuration';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { Annexed } from '@app/compartido/modelos/annexed';
import { forkJoin, Observable } from 'rxjs';
import { RptHojaVidaV2Model } from '@app/compartido/modelos/rpt-hoja-vida-v2-model';
import { TipoExperienciaLaboralModel } from '@app/compartido/modelos/tipo-experiencia-laboral-model';

interface AdjuntosLista {
  id: string;
  nombre: string;
  nombreSeccion: string;
  nombreLabel: string;
  idSoporte: string;
  correcto: boolean;
  observacion: string;
  esGraduado: number;
  intensidadHoraria: string;
  fechaIngreso: string;
  fechaRetiro: string;
  trabajoActual: number;
  showCbxAdicional: boolean;
  aplicaAdicional: boolean;
  lstConfigAdicional: ConfigAdicional[];
  idConfigAdicional: string;
  rutaSafe?: SafeResourceUrl;
  nivelEstudio: string;
  tipoExperiencia: string;
}

@Component({
  selector: 'app-validar-docs-reclasificacion',
  templateUrl: './validar-docs-reclasificacion.component.html',
  styleUrls: ['./validar-docs-reclasificacion.component.scss']
})
export class ValidarDocsReclasificacionComponent extends BaseController implements OnInit, AfterViewChecked {

  private user = this.commonService.getVar(configMsg.USER);
  public displayedColumns: string[] = ['identificacion', 'cargoAspirante', 'gradoCargo', 'dependencia', 'lugar', 'estadoAspirante', 'recalificacion', 'options'];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstEstadosAspiranteView: EstadoAspiranteComvocatoria[] = [];
  public lstCategoriaAdmintidoModel: CategoriaAdmintidoModel[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstAdjuntos: AdjuntosLista[] = [];
  public lstTiposDocumentoAll: TypeDocument[] = [];
  public lstAdjuntosValidadosTemp: ValidacionAdjuntoModel[];
  public aspiranteAdmitidoTemp: AspiranteAdmintidoModel;
  public lstTipoTituloObtenido: TituloObtenido[];
  public lstTipoNivelEstudio: LevelStudy[];
  public lstTipoAdicional: TipoAdicional[];
  public lstTipoAnexos: TypeFileAnnexed[];
  public lstTipoExperienciaLaboral: TipoExperienciaLaboralModel[] = [];

  public form: FormGroup;
  public submit = false;
  private pathSoportes: string;
  public lstTable: InscripcionAspiranteModel[] = [];
  public dataSource = new MatTableDataSource<InscripcionAspiranteModel>([]);
  public sortedData: any;
  public showSelectCompany = false;
  public esNoAdmitido = false;
  public esOtraCategoria = false;
  public lstCompanies: Empresa[] = [];
  public elementCurrent: InscripcionAspiranteModel | any = {};
  public adjuntoSelected: AdjuntosLista;
  public identificacion: FormControl = new FormControl({ value: '', disabled: true });
  public nombreAspirante: FormControl = new FormControl({ value: '', disabled: true });
  public cargoAspirante: FormControl = new FormControl({ value: '', disabled: true });
  public estadoAspiranteSelect: FormControl = new FormControl('', [Validators.required]);
  public observacionesAspirante: FormControl = new FormControl('');
  public estadoNoAdmitidoAspirante: FormControl = new FormControl('');
  public otraCategoria: FormControl = new FormControl('');
  private varMensajeConv: VariableAppModel;
  public dropTitulo: IDropdownSettings = {};
  public allPendientes: boolean;
  public allAttachmentsPending: boolean;
  public showBtnNotificar = false;
  private varEstadoAspiranteNoAdmitido: Configuration;
  private varEstadoAspiranteCumpleReq: Configuration;
  private varEstadoAspiranteNoCumpleReq: Configuration;
  private idEstadoAspiranteAdmitido: Configuration;
  private idEstadoAspiranteRegistroElegibles: Configuration;
  private idSEstadoSAsp: Configuration;
  private idSEstadoSAspAltasCortes: Configuration;
  public varAltasCortes: Configuration;
  public idEstadoAspiranteElegido: Configuration;
  public idEstadoAspiranteInscrito: Configuration;
  public seleccionoAdmitido: Boolean = null;
  public showBotonGuardar: boolean;
  private canSendEmail = false;
  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;
  public showBotonReporte: boolean;

  private labelNO = 'No';

  public totalExperienceWork =
    {
      rama: { years: 0, months: 0, days: 0, msg: '' },
      fueraRama: { years: 0, months: 0, days: 0, msg: '' },
      total: { years: 0, months: 0, days: 0, msg: '' }
    };

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
    private sanitizer: DomSanitizer,
    private fileService: FilesService,
    private snackBar: MatSnackBar,
    private convService: ConvocatoriaService,
    private cvService: CurriculumVitaeService,
    private reporteServ: ReportesService,
    private adminConvSer: AdministracionConvocatoriaService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.loadForm();
    this.commonService.getConfigJson()
      .toPromise()
      .then((data: any) => {
        this.pathSoportes = data.soportes;
        this.loadUserData()
          .then(async res => {
            this.loadData();
            this.varMensajeConv = (await this.commonService.getMessageByName(configMsg.CONVOCATORIA_NO_TIENE_REQUISITOS).toPromise() as any).datos as VariableAppModel;
          });
      });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: InscripcionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.commonService.getNumeroDocumento(data),
        this.commonService.getCargoAspirante(data),
        this.commonService.getGradoCargo(data),
        this.commonService.getTipoDependencia(data),
        this.commonService.getDependenciaLugar(data),
      ];
      return Constants.filterTable(dataCompare, filter);
    };

    this.dropTitulo = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombreCategoria' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      itemsShowLimit: 4,
      searchPlaceholderText: this.ct.SEARCH,
      allowSearchFilter: true,
      maxHeight: 140
    };

  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      idEmpresa: new FormControl(''),
      idConvocatoria: new FormControl(''),
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'identificacion': return this.compare(this.commonService.getNumeroDocumento(a), this.commonService.getNumeroDocumento(b), isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a), this.commonService.getCargoAspirante(b), isAsc);
        case 'gradoCargo': return this.compare(this.commonService.getGradoCargo(a), this.commonService.getGradoCargo(b), isAsc);
        case 'dependencia': return this.compare(this.commonService.getTipoDependencia(a), this.commonService.getTipoDependencia(b), isAsc);
        case 'lugar': return this.compare(this.commonService.getDependenciaLugar(a), this.commonService.getDependenciaLugar(b), isAsc);
        case 'estadoAspirante': return this.compare(a.estadoAspiranteModel['nombreCategoria' + this.lang], b.estadoAspiranteModel['nombreCategoria' + this.lang], isAsc);
        default: return 0;
      }
    });
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!Constants.validateList(this.lstCompanies)) {
        this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();

    this.lstConvocatories = (await this.convService.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    //filtrar las convocatorias activas
    this.lstConvocatories = this.lstConvocatories.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES ||
      g.estadoConvocatoria === stateConvocatoria.CERRADA
    );

    this.lstTable = [];
    this.mostrarBotonNotificar();
    this.dataSource.data = this.lstTable;
  }

  /**
   * 
   * @param idComparar Valida si el id es igual o esta en el id de altas cortes
   */
  private esAltasCortes(idComparar: string) {
    if (this.varAltasCortes && this.varAltasCortes.valorObj && String(this.varAltasCortes.valorObj.id_altas_cortes).toUpperCase().includes(idComparar.toUpperCase()))
      return true

    return false
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.cleanFormUsuario();

    this.lstTable = [];
    this.mostrarBotonNotificar();

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatories.find((x: any) => x.id === this.f.idConvocatoria.value);
    // if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO) {
    //   this.estadoConvocatoria = this.ct.CONVOCATORIA_INACTIVA_MSG;
    // } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
    //   this.estadoConvocatoria = this.ct.CONVOCATORIA_PUBLICADA_MSG;
    // } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.ACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.EN_BORRADOR) {
    //   this.estadoConvocatoria = this.ct.CONVOCATORIA_ENCOSTRUCION_MSG;
    // } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
    //   this.estadoConvocatoria = this.ct.CONVOCATORIA_CERRADA_MSG;
    // } else {
    //   this.estadoConvocatoria = '';
    // }

    if (pConvocatoria.value) {

      const idConvocatoriaSeleccionada = pConvocatoria.value;
      this.lstTable = (await this.commonService.getInscripcionesConvocatoriaSR(idConvocatoriaSeleccionada).toPromise() as any).datos as InscripcionAspiranteModel[];
      if (this.lstTable.length > 0) {

        // validar si pertenece a altas cortes
        const convSelected = this.lstConvocatories.find(z => z.id === idConvocatoriaSeleccionada);
        if (this.esAltasCortes(convSelected.idTipoLugar)) {
          const elegido = this.lstTable.find(x => this.areEqualsIdGuid(x.idEstadoAspirante, this.idEstadoAspiranteElegido.valor));
          this.showBtnNotificar = elegido ? false : this.canSendEmail == true ? true : false;

          //filtrar los estados por convocatoria altas cortes
          const ids: string[] = this.idSEstadoSAspAltasCortes.valor.split(',');
          this.lstEstadosAspiranteView = this.lstEstadosAspiranteAll.filter(x => ids.includes(x.id));
        } else {
          //filtrar los estados normales
          const ids: string[] = this.idSEstadoSAsp.valor.split(',');
          this.lstEstadosAspiranteView = this.lstEstadosAspiranteAll.filter(x => ids.includes(x.id));
        }

        //solo aspirantes en registro de elegibles
        this.lstTable = this.lstTable.filter(x => this.areEqualsIdGuid(x.idEstadoAspirante, this.idEstadoAspiranteRegistroElegibles.valor))


        //llenar datos necesario
        this.lstTable.forEach(x => {
          x.resumenHVModel = JSON.parse(x.resumenHV);
          if (x.resumenRecalificacionHV) {
            x.resumenRecalificacionHVModel = JSON.parse(x.resumenRecalificacionHV);
          }
          x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
          if (this.areEqualsIdGuid(x.estadoAspiranteModel.id, this.varEstadoAspiranteNoAdmitido.valor)) {
            x.estadoSolicitudRecalificacion = this.labelNO;
          }
          const cPerfil: ConvocatoriaPerfil = x.convocatoriaPerfilModel;
          cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);

        });

        //ordenar por reclasificacion
        this.lstTable.sort(function (a: InscripcionAspiranteModel, b: InscripcionAspiranteModel) {
          if (a.idSolicitudRecalificacion > b.idSolicitudRecalificacion) {
            return 1;
          }
          if (a.idSolicitudRecalificacion < b.idSolicitudRecalificacion) {
            return -1;
          }
          return 0;
        });
      }
    }

    this.dataSource.data = this.lstTable;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.canSendEmail = this.commonService.hasPermissionUserActionEspecial([PermisosEspeciales.EnviarCorreo]);

    // carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatories = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatories = ((await this.convService.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatories = ((await this.convService.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }


    // filtrar las convocatorias activas
    this.lstConvocatories = this.lstConvocatories.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES
    );

    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
    this.lstCategoriaAdmintidoModel = ((await this.convService.getCategoriaAdmitidos().toPromise() as any).datos) as CategoriaAdmintidoModel[];
    this.lstTiposDocumentoAll = ((await this.commonService.getTypesIdentification().toPromise() as any).datos) as TypeDocument[];

    this.lstTipoTituloObtenido = (await this.commonService.getTitulos().toPromise() as any).datos;
    this.lstTipoNivelEstudio = (await this.commonService.getLevelStudy().toPromise() as any).datos;
    this.lstTipoAdicional = (await this.adminConvSer.getTipoAdicionales().toPromise() as any).datos;
    this.lstTipoExperienciaLaboral = (await this.adminConvSer.getTipoExperienciaLaboral().toPromise() as any).datos;

    //cargar variable estado aspirante
    this.varEstadoAspiranteNoAdmitido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_ADMITIDO));
    this.idEstadoAspiranteAdmitido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ADMITIDO));
    this.idEstadoAspiranteElegido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ELEGIDO));
    this.idEstadoAspiranteInscrito = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_INSCRITO));
    this.varEstadoAspiranteCumpleReq = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CUMPLE_REQUISITOS));
    this.varEstadoAspiranteNoCumpleReq = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_CUMPLE_REQUISITOS));
    this.idSEstadoSAsp = (await this.commonService.getVarConfig(configMsg.ESTADOS_ASPIRANTES_VERIFICACION_DOCS));
    this.idSEstadoSAspAltasCortes = (await this.commonService.getVarConfig(configMsg.ESTADOS_ASPIRANTES_VERIFICACION_DOCS_ALTAS_CORTES));
    this.idEstadoAspiranteRegistroElegibles = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_REGISTRO_ELEGIBLES));


    //cargar la variable de altas cortes
    this.varAltasCortes = (await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES));
    this.setJson(this.varAltasCortes);


    //cargar el tipo de anexos
    this.lstTipoAnexos = <TypeFileAnnexed[]>(<any>await this.commonService.getTypeFileAnnexed().toPromise()).datos;


    this.lstTable = [];
    this.mostrarBotonNotificar();
    this.dataSource.data = this.lstTable;
  }

  get f() {
    return this.form.controls;
  }


  public eventClickItem(item: AdjuntosLista) {
    this.lstAdjuntos.forEach(a => a.rutaSafe = null);
    item.rutaSafe = null;
    this.adjuntoSelected = item;
    this.fileService.getInformationFilePath(this.adjuntoSelected.idSoporte)
      .toPromise()
      .then(res => {
        const ruta = String(this.pathSoportes + res.path).replace('\\', '/');
        item.rutaSafe = this.sanitizer.bypassSecurityTrustResourceUrl(ruta);
      })
      .catch(err => {
        this.snackBar.open(this.ct.ARCHIVO_NO_EXISTE, this.ct.CLOSE, {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snackbar-style']
        });
      });


  }

  public async loadAspirante(element: InscripcionAspiranteModel) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    //ocultar el boton de guardar
    this.showBotonGuardar = false;
    this.showBotonReporte = false;

    if (element.idSolicitudRecalificacion && element.estadoSolicitudRecalificacion != this.labelNO) {
      this.alertService.message(this.ct.MSG_REQUEST_REQUALIFICATION_PENDING, TYPES.INFO);
    }
    this.cleanFormUsuario();
    this.elementCurrent = Constants.cloneObject(element);

    this.calculateTimeWork(element.idUsuario);

    this.identificacion.setValue(this.commonService.getNumeroDocumento(element));
    this.nombreAspirante.setValue(this.commonService.getNameAspirante(element));
    this.cargoAspirante.setValue(this.commonService.getCargoAspirante(element));

    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.cargoAspirante.updateValueAndValidity();

    this.loadDataByEstadoAspirante({ value: element.idEstadoAspirante });

    this.estadoAspiranteSelect.setValue(element.idEstadoAspirante);
    this.estadoAspiranteSelect.updateValueAndValidity();

    const lstTemp = (await this.convService.getAspiranteAdmitidoByIdInscripcion(element.id).toPromise() as any).datos as AspiranteAdmintidoModel[];
    this.aspiranteAdmitidoTemp = lstTemp.length > 0 ? lstTemp[0] : undefined;

    if (this.aspiranteAdmitidoTemp) {
      this.observacionesAspirante.setValue(this.aspiranteAdmitidoTemp.observacion);
      if (this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos) {
        // const ids = this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos.split(',');
        // let lstTemp: CategoriaAdmintidoModel[] = [];
        const lstTemp: CategoriaAdmintidoModel[] = this.lstCategoriaAdmintidoModel.filter(x => {
          return this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos.includes(x.id);
        });
        //this.loadDataByCategoria({ value: this.aspiranteAdmitidoTemp.idCategoriaAdmitidos });
        this.estadoNoAdmitidoAspirante.setValue(lstTemp);
        this.estadoNoAdmitidoAspirante.markAsTouched();
        this.estadoNoAdmitidoAspirante.updateValueAndValidity();
        // if (this.aspiranteAdmitidoTemp.otraCategoria) {
        //   this.otraCategoria.setValue(this.aspiranteAdmitidoTemp.otraCategoria);
        // }
      }
    }

    //construir el listado de archivos
    this.buildListAttachments(element);

    //validar si es registro elegible para mostrar boton de guardar
    const idEstadosAspGuardar = [this.idEstadoAspiranteRegistroElegibles.valor].join(',');
    if (idEstadosAspGuardar.toUpperCase().includes(element.idEstadoAspirante.toUpperCase())) {
      //mostrar el boton de guardar
      this.showBotonGuardar = true;
    }


    //validar si es admitido, no admitido mostrar boton de reporte
    // const idEstadosAspReporte = [this.varEstadoAspiranteNoAdmitido.valor, this.idEstadoAspiranteAdmitido.valor].join(',');
    // if (idEstadosAspReporte.toUpperCase().includes(element.idEstadoAspirante.toUpperCase())) {
    //   //mostrar el boton de guardar
    //   this.showBotonReporte = true;
    // }


    // validar si pertenece a altas cortes
    // const convSelected = this.lstConvocatories.find(z => z.id === this.f.idConvocatoria.value);
    // if (this.esAltasCortes(convSelected.idTipoLugar)) {
    //   //validar si es admitido, no admitido mostrar boton de reporte
    //   const idEstadosAspReporte = [this.varEstadoAspiranteCumpleReq.valor, this.varEstadoAspiranteNoCumpleReq.valor].join(',');
    //   if (idEstadosAspReporte.toUpperCase().includes(element.idEstadoAspirante.toUpperCase())) {
    //     //mostrar el boton de guardar
    //     this.showBotonReporte = true;
    //   }
    // } else {
    //   //validar si es admitido, no admitido mostrar boton de reporte
    //   const idEstadosAspReporte = [this.varEstadoAspiranteNoAdmitido.valor, this.idEstadoAspiranteAdmitido.valor].join(',');
    //   if (idEstadosAspReporte.toUpperCase().includes(element.idEstadoAspirante.toUpperCase())) {
    //     //mostrar el boton de guardar
    //     this.showBotonReporte = true;
    //   }
    // }

  }

  public saveAspirante() {
    let formValid = true;

    //verificar que si es incorrecto tenga la observacion
    const docsInvalidos = this.lstAdjuntos.filter(x => x.correcto === false && !x.observacion);
    formValid = docsInvalidos.length > 0 ? false : true;
    if (!formValid) {
      this.alertService.message(this.ct.DOC_INCORRECTO_OBSERVACIONES, TYPES.WARNING)
    }


    if (formValid) {
      this.submit = true;
      this.alertService.loading();

      const element: InscripcionAspiranteModel = this.elementCurrent;
      element.idUsuarioModificacion = this.user.id;

      //revisar si crea uno nuevo o lo actualiza
      const aspiranteAdmi: AspiranteAdmintidoModel = {
        idInscripcionAspirante: element.id,
        idCategoriaNoAdmitidos: this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos,
        idUsuario: element.idUsuario,
        observacion: this.observacionesAspirante.value,
        aspiranteAdmitido: this.aspiranteAdmitidoTemp.aspiranteAdmitido,
        otraCategoria: this.aspiranteAdmitidoTemp.otraCategoria,
        idUsuarioModificacion: this.user.id,
        id: this.aspiranteAdmitidoTemp ? this.aspiranteAdmitidoTemp.id : undefined
      };

      const lstValidacionAdj: ValidacionAdjuntoModel[] = this.lstAdjuntos.map(x => {

        let find: ValidacionAdjuntoModel = null;
        if (this.lstAdjuntosValidadosTemp.length > 0) {
          find = this.lstAdjuntosValidadosTemp.find(z => z.id === x.id);
        }

        const obj: ValidacionAdjuntoModel = {
          idInscripcionAspirante: element.id,
          idSoporte: x.idSoporte,
          idUsuario: element.idUsuario,
          observacion: x.observacion,
          validaSoporte: x.correcto ? 1 : 0,
          idUsuarioModificacion: this.user.id,
          aplicaAdicional: 0,
          idConfigAdicional: undefined,
          id: find ? find.id : undefined,
          idConvocatoria: element.idConvocatoria
        };
        //setear si aplica adicional
        if (x.showCbxAdicional) {
          if (x.aplicaAdicional) {
            obj.aplicaAdicional = 1;
            if (x.idConfigAdicional) {
              obj.idConfigAdicional = x.idConfigAdicional;
            }
          }
        }

        return obj;
      });

      this.commonService.actualizarEstadoInscripcionAspirante(element.id, this.user.id, element.idEstadoAspirante)
        .subscribe(
          r => {
            this.convService.saveAspiranteAdmitido(aspiranteAdmi)
              .subscribe(async r2 => {
                let ok = true;
                lstValidacionAdj.forEach(async x => {
                  await this.convService.saveValidacionAdjunto(x)
                    .toPromise()
                    .catch(err => {
                      this.alertService.showError(err);
                      ok = false;
                    });
                });

                //guardar solicitud recalificacion
                if (element.idSolicitudRecalificacion && element.resumenRecalificacionHVModel) {
                  await this.convService.actualizarEstadoSolicitudRecalificacionRevision(element.idSolicitudRecalificacion, element.id)
                    .toPromise()
                    .catch(err => this.alertService.showError(err));
                }

                this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value })
                  .then(() => {
                    if (ok) {
                      this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                        .then(() => this.onToggle({ checked: this.allPendientes }))
                        .then(() => this.mostrarBotonNotificar())
                        .finally(() => this.submit = false);
                    } else {
                      this.onToggle({ checked: this.allPendientes });
                      this.mostrarBotonNotificar();
                      this.submit = false;
                    }
                  });
              }, err => {
                this.alertService.showError(err);
                this.submit = false;
              });
          }, err => {
            this.alertService.showError(err);
            this.submit = false;
          }
        );
    }

  }

  public createAdjunto(idSoporteAd: string, nombreSoporte?: string, nombreLbl?: string) {
    const adjunto: AdjuntosLista = {
      id: String(this.lstAdjuntos.length),
      nombre: nombreSoporte,
      nombreLabel: nombreLbl,
      idSoporte: idSoporteAd,
      correcto: false,
      observacion: '',
      nombreSeccion: undefined,
      esGraduado: -1,
      intensidadHoraria: '-1',
      fechaIngreso: '-1',
      fechaRetiro: '-1',
      trabajoActual: -1,
      showCbxAdicional: false,
      aplicaAdicional: false,
      lstConfigAdicional: [],
      idConfigAdicional: undefined,
      nivelEstudio: undefined,
      tipoExperiencia: '-1'
    };
    return adjunto;
  }

  public loadDataByEstadoAspirante(pEstadoAspirante: any) {
    let estadoTemp = null;
    if (pEstadoAspirante.value) {
      estadoTemp = this.lstEstadosAspiranteAll.find(x => x.id === pEstadoAspirante.value
        && (this.areEqualsIdGuid(x.id, this.varEstadoAspiranteNoAdmitido.valor) || this.areEqualsIdGuid(x.id, this.varEstadoAspiranteNoCumpleReq.valor)));
      if (estadoTemp) {

        this.esNoAdmitido = true;
        this.estadoNoAdmitidoAspirante.setValue('');
        this.estadoNoAdmitidoAspirante.setValidators([Validators.required]);
      }
    }
    if (!estadoTemp) {
      this.esNoAdmitido = false;
      this.estadoNoAdmitidoAspirante.setValue('');
      this.estadoNoAdmitidoAspirante.clearValidators();

      this.esOtraCategoria = false;
      this.otraCategoria.setValue('');
      this.otraCategoria.clearValidators();
    }
    this.estadoNoAdmitidoAspirante.updateValueAndValidity();

    const e = this.lstEstadosAspiranteView.find(x => x.id === pEstadoAspirante.value);
    if (e) {
      this.seleccionoAdmitido = !this.areEqualsIdGuid(e.id, this.varEstadoAspiranteNoAdmitido.valor) &&
        !this.areEqualsIdGuid(e.id, this.varEstadoAspiranteNoCumpleReq.valor);
    }

  }

  public loadDataByCategoria(pCategoria: any) {
    let esOtra = false;
    if (pCategoria.value) {
      this.lstCategoriaAdmintidoModel.forEach(x => {
        if (x.id === pCategoria.value && x.esOtro === 1) {
          this.esOtraCategoria = true;
          esOtra = true;
          this.otraCategoria.setValue('');
          this.otraCategoria.setValidators([Validators.required]);
          this.otraCategoria.markAsUntouched();
          this.otraCategoria.updateValueAndValidity();
          return;
        }
      });
    }
    if (!esOtra) {
      this.esOtraCategoria = false;
      this.otraCategoria.setValue('');
      this.otraCategoria.clearValidators();
      this.otraCategoria.markAsUntouched();
      this.otraCategoria.updateValueAndValidity();
    }
  }

  public cleanForm() {
    this.cleanFormUsuario();
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();
    this.f.idEmpresa.setValue('');
    this.f.idEmpresa.updateValueAndValidity();
    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public async calculateTimeWork(idUsuario: string) {
    const lstExperience = <WorkExperience[]>(<any>await this.cvService.getWorkExperience(idUsuario).toPromise()).datos;
    if (lstExperience.length > 0) {
      for (let i = 0; i < lstExperience.length; i++) {
        if (lstExperience[i].esTrabajoActual === 1) {
          lstExperience[i].fechaRetiro = new Date().toString();
        }
      }
    }
    lstExperience.sort((a, b) => new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime());


    const lstExperienceRama = <WorkExperienceRama[]>(<any>await this.cvService.getWorkExperienceRama(idUsuario).toPromise()).datos;
    if (lstExperienceRama.length > 0) {
      lstExperienceRama.forEach(e => {
        e.municipality = e.idCiudad + '';
      });
      for (let i = 0; i < lstExperienceRama.length; i++) {
        if (lstExperienceRama[i].esTrabajoActual === 1) {
          lstExperienceRama[i].fechaRetiro = new Date().toString();
        }
      }
    }

    lstExperienceRama.sort((a, b) => new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime());

    const lstDates = [];
    lstExperience.forEach((data: WorkExperience) => {
      lstDates.push({
        start: data.fechaIngreso,
        end: data.fechaRetiro,
        rama: false
      });
    });

    lstExperienceRama.forEach((data: WorkExperienceRama) => {
      lstDates.push({
        start: data.fechaIngreso,
        end: data.fechaRetiro,
        rama: true
      });
    });

    lstDates.sort((a: any, b: any) => {
      return Constants.getTime(new Date(a.end)) - Constants.getTime(new Date(b.start));
    });

    let years = 0;
    let months = 0;
    let days = 0;

    let daysRama = 0;

    let daysFueraRama = 0;

    lstDates.forEach(date => {
      const daysTemp = CDays360.Days360(new Date(date.start), new Date(date.end));
      days += daysTemp;
      if (date.rama) {
        daysRama += daysTemp;
      } else {
        daysFueraRama += daysTemp;
      }
    });

    const nDays = 30;
    const nMonths = 12;

    // global
    let modDays = days % nDays;
    months = (days - modDays) / nDays;
    let modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.total.years = years;
    this.totalExperienceWork.total.months = modMonths;
    this.totalExperienceWork.total.days = modDays;


    // fuera rama
    modDays = daysFueraRama % nDays;
    months = (daysFueraRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.fueraRama.years = years;
    this.totalExperienceWork.fueraRama.months = modMonths;
    this.totalExperienceWork.fueraRama.days = modDays;


    // rama
    modDays = daysRama % nDays;
    months = (daysRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.rama.years = years;
    this.totalExperienceWork.rama.months = modMonths;
    this.totalExperienceWork.rama.days = modDays;

    this.totalExperienceWork.total.msg = `${this.totalExperienceWork.total.years} ${this.ct.YEARS}  ${this.totalExperienceWork.total.months} ${this.ct.MONTHS} ${this.totalExperienceWork.total.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.rama.msg = `${this.totalExperienceWork.rama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.rama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.rama.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.fueraRama.msg = `${this.totalExperienceWork.fueraRama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.fueraRama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.fueraRama.days} ${this.ct.DAYS}`;

  }

  public cleanFormUsuario() {
    this.elementCurrent.id = undefined;
    this.adjuntoSelected = undefined;
    this.lstAdjuntosValidadosTemp = [];
    this.lstAdjuntos = [];
    this.observacionesAspirante.setValue('');
    this.estadoAspiranteSelect.setValue('');
    this.estadoNoAdmitidoAspirante.setValue('');
    this.otraCategoria.setValue('');
    this.observacionesAspirante.updateValueAndValidity();
    this.estadoAspiranteSelect.updateValueAndValidity();
    this.estadoNoAdmitidoAspirante.updateValueAndValidity();
    this.otraCategoria.updateValueAndValidity();
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.cargoAspirante.setValue('');
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.cargoAspirante.updateValueAndValidity();
    this.totalExperienceWork = {
      rama: { years: 0, months: 0, days: 0, msg: '' },
      fueraRama: { years: 0, months: 0, days: 0, msg: '' },
      total: { years: 0, months: 0, days: 0, msg: '' }
    };
    this.mostrarBotonNotificar();
  }

  public onToggle(event) {
    if (event.checked) {
      this.allPendientes = true;
      this.dataSource.data = this.lstTable.filter(x => x.estadoAspiranteModel.nombreCategoria === 'Inscrito');
    } else {
      this.allPendientes = false;
      this.dataSource.data = this.lstTable;
    }
  }

  public onToggleAttachments(event) {
    if (event.checked) {
      this.allAttachmentsPending = true;
    } else {
      this.allAttachmentsPending = false;
    }
    this.buildListAttachments(this.elementCurrent);
  }

  public enviarNotificacion() {
    this.alertService.comfirmation(this.ct.MSG_COMUNICADO_ADMITIDO_ASPIRANTE, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

          const lstTemp = (await this.convService.getAspiranteAdmitidoByIdConvocatoria(this.f.idConvocatoria.value).toPromise() as any).datos as AspiranteAdmintidoModel[];

          const lstNotificaciones: Observable<any>[] = [];

          this.lstTable.forEach((inscripcion: InscripcionAspiranteModel) => {

            let motivoNoAdmitido = null;
            if (inscripcion.estadoAspiranteModel.nombreCategoria !== 'Admitido') {
              //const lstTemp = (await this.convService.getAspiranteAdmitidoByIdInscripcion(inscripcion.id).toPromise() as any).datos as AspiranteAdmintidoModel[];
              // this.aspiranteAdmitidoTemp = lstTemp.length > 0 ? lstTemp[0] : undefined;
              this.aspiranteAdmitidoTemp = lstTemp.find(aa => aa.idInscripcionAspirante === inscripcion.id);
              if (this.aspiranteAdmitidoTemp) {
                if (this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos) {
                  motivoNoAdmitido = '';
                  const lstSelect: CategoriaAdmintidoModel[] = this.lstCategoriaAdmintidoModel.filter(x => {
                    return this.aspiranteAdmitidoTemp.idCategoriaNoAdmitidos.includes(x.id);
                  });
                  lstSelect.forEach(l => {
                    motivoNoAdmitido += l.nombreCategoria + '<br />';
                  });
                }
              }
            }

            const c = this.lstConvocatories.find(conv => conv.id === inscripcion.idConvocatoria);
            const msg = `
            Estimado aspirante ${this.commonService.getNameAspirante(inscripcion)}
            <br /><br />
            A continuación, encontrará información del estado del proceso al cual aplicó en el CARJUD-APP.
            <br /><br />
            Nombre del cargo: ${this.commonService.getCargoAspirante(inscripcion)}<br />
            Grado cargo: ${this.commonService.getGradoCargo(inscripcion)}<br />
            Nombre de la convocatoria: ${c.nombreConvocatoria}<br />
            Número de la convocatoria: ${c.numeroConvocatoria}<br />
            Estado aspirante: ${motivoNoAdmitido === null ? 'Admitido' : 'No admitido'}<br />
            ${motivoNoAdmitido == null ? '' : 'Motivo no admisión: <br />' + motivoNoAdmitido}<br />
            <br />
            Por favor conservar el correo.`;

            let idEmpresaString = this.f.idEmpresa.value;
            if (!this.f.idEmpresa.value || this.f.idEmpresa.value === '') {
              idEmpresaString = c.idEmpresa;
            }

            const newNotificacion: NotificacionModel = {
              asunto: 'Estado aspirante.',
              mensaje: msg,
              esLeido: 0,
              idUsuarioDestinatario: inscripcion.idUsuario,
              idUsuarioRemitente: this.user.id,
              idEmpresa: idEmpresaString,
              idConvocatoria: this.f.idConvocatoria.value,
              copiaACorreo: 1
            };
            lstNotificaciones.push(this.commonService.saveNotificacion(newNotificacion));
          });

          forkJoin(lstNotificaciones).subscribe({
            next: (res: any) => {
              this.mostrarBotonNotificar();
              this.onToggle({ checked: false });
              this.alertService.message(this.ct.NOTIFICACION_EXITOSA, TYPES.SUCCES);
            },
            error: (error) => {
              this.alertService.showError(error);
            }
          });

        }
      });
  }

  private mostrarBotonNotificar() {
    if (this.lstTable && this.lstTable.length > 0) {
      const find = this.lstTable.find(x => this.areEqualsIdGuid(x.estadoAspiranteModel.id, this.idEstadoAspiranteInscrito.valor));
      this.showBtnNotificar = find === undefined && this.canSendEmail == true ? true : false;
    } else {
      this.showBtnNotificar = false;
    }

  }

  private async buildListAttachments(element: InscripcionAspiranteModel) {

    this.lstAdjuntos = [];
    this.lstAdjuntosValidadosTemp = (await this.convService.getValidacionAdjuntoByConvocatoriaUser(element.id, element.idUsuario).toPromise() as any).datos as ValidacionAdjuntoModel[];
    if (element.resumenHVModel || element.resumenRecalificacionHVModel) {


      // variables de configuracion tipo adicional capacitacion y experiencia
      const idTipoExperiencia = await this.commonService.getVarConfig(configMsg.ID_PARAMETRO_ADICIONAL_EXPERIENCIA);
      const idTipoCapacitacion = await this.commonService.getVarConfig(configMsg.ID_PARAMETRO_ADICIONAL_CAPACITACION);

      // consultar las adicionales y filtrar solo por capacitacion y experiencia
      let lstTipoAdicionalFilter = (await this.convService.getObtenerAdicionalesPorConvocatoria(element.idConvocatoria).toPromise() as any).datos as Adicional[];
      lstTipoAdicionalFilter = lstTipoAdicionalFilter.filter(x => x.idTipoAdicional === idTipoCapacitacion.valor || x.idTipoAdicional === idTipoExperiencia.valor);

      // consultar las configuraciones adicionales de la convocatoria y filtrar solo por los tipos adicionales encontrados
      let lstAdicionales = (await this.convService.getObtenerConfigAdicionalesPorConvocatoria(element.idConvocatoria).toPromise() as any).datos as ConfigAdicional[];
      lstAdicionales = lstAdicionales.filter(a => lstTipoAdicionalFilter.find(tipoA => tipoA.id === a.idAdicional) != null);
      lstAdicionales.forEach(a => {
        const typeAditionale = this.lstTipoAdicional.find(z => a.idTipoAdicional === z.id);
        if (typeAditionale) {
          a.tipoAdicional = this.translateField(typeAditionale, 'tipoAdicional', this.lang);
          a.tipoAdicionalModel = typeAditionale;
        }
      });

      // se filtran los tiposAdicionales por experiencia
      const lstAdicionalesExperiencia = !lstAdicionales ? [] : lstAdicionales.filter(f => f.tipoAdicionalModel.idReferencia === idTipoExperiencia.valor);

      // se filtran los tiposAdicionales por capacitacion
      const lstAdicionalesCapacitacion = !lstAdicionales ? [] : lstAdicionales.filter(f => f.tipoAdicionalModel.idReferencia === idTipoCapacitacion.valor);

      let resumen = element.resumenHVModel;
      if (element.idSolicitudRecalificacion && element.resumenRecalificacionHVModel) {
        resumen = element.resumenRecalificacionHVModel;
      }

      // DATOS PERSONALES
      if (resumen.datosPersonales) {
        let secPersonal = false;
        const dPersonal = resumen.datosPersonales;
        if (dPersonal.soporteIdentificacion) {
          const tipoDocumento = this.lstTiposDocumentoAll.find(x => Number(x.id) === dPersonal.idTipoDocumento);
          const adjunto = this.createAdjunto(dPersonal.soporteIdentificacion, this.translateField(tipoDocumento, 'tipoDocumento', this.lang));
          adjunto.nombreSeccion = this.ct.INFORMACION_PERSONAL;
          secPersonal = true;
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(x => x.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
          }
          this.lstAdjuntos.push(adjunto);
        }
        if (dPersonal.soporteDeclaracion) {
          const adjunto = this.createAdjunto(dPersonal.soporteDeclaracion, null, 'lbl.declaracion');
          adjunto.nombreSeccion = !secPersonal ? 'Información personal' : undefined;
          secPersonal = true;
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(x => x.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
          }
          this.lstAdjuntos.push(adjunto);
        }
        if (dPersonal.soporteLibretaMilitar) {
          const adjunto = this.createAdjunto(dPersonal.soporteLibretaMilitar, null, 'lbl.libretaMilitar');
          adjunto.nombreSeccion = !secPersonal ? 'Información personal' : undefined;
          secPersonal = true;
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(x => x.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
          }
          this.lstAdjuntos.push(adjunto);
        }
      }

      // INFORMACION ACADEMICA
      if (resumen.informacionesAcademicas && resumen.informacionesAcademicas.length > 0) {

        const dInfoAcade = resumen.informacionesAcademicas;

        dInfoAcade.forEach(x => {
          const adjunto = this.createAdjunto(x.soporte, this.translateField(x.areaConocimiento, 'areaConocimiento', this.lang), null);
          adjunto.nombreSeccion = this.ct.INFORMACION_ACADEMICA;
          adjunto.esGraduado = x.esGraduado;
          // mostrar el check para aplica adicional
          adjunto.showCbxAdicional = true;

          // buscar el titulo y setear el nombre
          const titulo = this.lstTipoTituloObtenido.find(tit => tit.id === x.idTipoTituloObtenido);
          if (!adjunto.nombre || adjunto.nombre === '') {
            if (titulo) {
              adjunto.nombre = this.translateField(titulo, 'titulo', this.lang);
            } else if (!titulo && x.tituloObtenidoInformal) {
              adjunto.nombre = x.tituloObtenidoInformal;
            }
          }

          // setear intensidad horaria y nivel de estudio
          if (x.idNivelEstudio) {
            const levelStudy = x.nivelEstudio ? x.nivelEstudio : this.lstTipoNivelEstudio.find(l => l.id === x.idNivelEstudio);
            const modalities = ['CSS', 'D'];
            if (levelStudy && modalities.find(m => levelStudy.modalidad === m)) {
              adjunto.intensidadHoraria = x.horas;
            }

            if (levelStudy && levelStudy.tipoEstudio === 'Formal') {
              adjunto.nivelEstudio = this.translateField(levelStudy, 'nivelEstudio', this.lang);
            } else if (levelStudy && levelStudy.tipoEstudio === 'Informal') {
              adjunto.nivelEstudio = this.translateField(levelStudy, 'nivelEstudio', this.lang);
              adjunto.esGraduado = -1;
            }
          }

          // combinar el modelo
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(z => z.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
            adjunto.aplicaAdicional = adjuntoModel.aplicaAdicional === 1;
            adjunto.idConfigAdicional = adjuntoModel.idConfigAdicional;
          }
          adjunto.lstConfigAdicional = lstAdicionalesCapacitacion;

          this.lstAdjuntos.push(adjunto);

          //validar si tiene titulo fuera del pais
          if (x.tituloFueraPais == 1) {
            const adjuntoTFP = this.createAdjunto(x.idSoporteTituloFueraPais, 'Soporte convalidación titulo extranjero', null);
            adjuntoTFP.nombreSeccion = this.ct.INFORMACION_ACADEMICA;
            // combinar el modelo
            const adjuntoModelTFP = this.lstAdjuntosValidadosTemp.find(z => z.idSoporte === adjunto.idSoporte);
            if (adjuntoModelTFP) {
              adjuntoTFP.observacion = adjuntoModelTFP.observacion;
              adjuntoTFP.correcto = adjuntoModelTFP.validaSoporte === 1;
              adjuntoTFP.id = adjuntoModelTFP.id;
            }
            this.lstAdjuntos.push(adjuntoTFP);
          }

        });
      }

      // EXPERIENCIAS LABORALES
      if (resumen.experienciasLaborales && resumen.experienciasLaborales.length > 0) {
        const dExpLab = resumen.experienciasLaborales;

        //ordenar las experiencias de la mas reciente a la mas antigua
        dExpLab.sort(function (a, b) {
          return new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime();
        });

        dExpLab.forEach(x => {

          // inicializar el modelo
          const adjunto = this.createAdjunto(x.soporte, x.cargo);
          adjunto.nombreSeccion = this.ct.EXPERIENCIA_LABORAL;
          // mostrar el check para aplica adicional
          adjunto.showCbxAdicional = true;

          // fecha de ingreso, retiro y trabajo actual
          adjunto.fechaIngreso = x.fechaIngreso;
          if (x.esTrabajoActual === 1) {
            adjunto.trabajoActual = x.esTrabajoActual;
          } else {
            adjunto.fechaRetiro = x.fechaRetiro;
          }

          //si tiene tipo experiencia
          if (x.idTipoExperienciaLaboral) {
            const te = this.lstTipoExperienciaLaboral.find(te => this.areEqualsIdGuid(te.id, x.idTipoExperienciaLaboral));
            adjunto.tipoExperiencia = this.translateField(te, 'tipo', this.lang);
          }

          // combinar modelos
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(z => z.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
            adjunto.aplicaAdicional = adjuntoModel.aplicaAdicional === 1;
            adjunto.idConfigAdicional = adjuntoModel.idConfigAdicional;
          }
          adjunto.lstConfigAdicional = lstAdicionalesExperiencia;

          this.lstAdjuntos.push(adjunto);
        });
      }

      // EXPERIENCIAS LABORALES RAMA
      if (resumen.experienciasLaboralesRama && resumen.experienciasLaboralesRama.length > 0) {
        const dExpLabRama = resumen.experienciasLaboralesRama;
        dExpLabRama.forEach(x => {

          // inicializar el modelo
          const adjunto = this.createAdjunto(x.soporte, x.cargo);
          adjunto.nombreSeccion = this.ct.EXPERIENCIA_LABORAL_RAMA;
          // mostrar el check para aplica adicional
          adjunto.showCbxAdicional = true;

          // fecha de ingreso, retiro y trabajo actual
          adjunto.fechaIngreso = x.fechaIngreso;
          if (x.esTrabajoActual === 1) {
            adjunto.trabajoActual = x.esTrabajoActual;
          } else {
            adjunto.fechaRetiro = x.fechaRetiro;
          }

          // combinar modelos
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(z => z.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
            adjunto.aplicaAdicional = adjuntoModel.aplicaAdicional === 1;
            adjunto.idConfigAdicional = adjuntoModel.idConfigAdicional;
          }
          adjunto.lstConfigAdicional = lstAdicionalesExperiencia;

          this.lstAdjuntos.push(adjunto);
        });
      }

      //ANEXOS
      const lstAnexos = <Annexed[]>(<any>await this.cvService.getAnnexesByUser(element.resumenHVModel.datosPersonales.idUsuario).toPromise()).datos;
      if (lstAnexos && lstAnexos.length > 0) {
        lstAnexos.forEach(x => {
          x.tipoArchivoModel = this.lstTipoAnexos.find(ta => ta.id == x.idTipoArchivo);
          // inicializar el modelo
          const adjunto = this.createAdjunto(x.idSoporte, this.translateField(x.tipoArchivoModel, 'tipoArchivo', this.lang));
          adjunto.nombreSeccion = this.ct.INFORMACION_ANEXOS;

          // combinar modelos
          const adjuntoModel = this.lstAdjuntosValidadosTemp.find(z => z.idSoporte === adjunto.idSoporte);
          if (adjuntoModel) {
            adjunto.observacion = adjuntoModel.observacion;
            adjunto.correcto = adjuntoModel.validaSoporte === 1;
            adjunto.id = adjuntoModel.id;
          }

          this.lstAdjuntos.push(adjunto);
        });
      }



      // si se debe mostrar solo adjuntos pendientes
      if (this.allAttachmentsPending) {

        // filtrar los adjuntos pendientes
        this.lstAdjuntos = this.lstAdjuntos.filter(x => {
          return this.lstAdjuntosValidadosTemp.find(z => z.id === x.id) ? false : true;
        });
      }

      // se deja solo los nombres de las secciones a los primeros items
      let currentSection = null;
      this.lstAdjuntos.forEach(x => {
        if (currentSection != null && currentSection === x.nombreSeccion) {
          x.nombreSeccion = undefined;
        } else {
          currentSection = x.nombreSeccion;
        }
      });
    }
  }

  public getReporteCV() {
    // Carga el reporte del resumen del usuario
    this.alertService.loading();
    this.submit = true;
    const paramsReport: RptHojaVidaV2Model = {
      idUsuario: this.elementCurrent.idUsuario,
      idConvocatoriaPerfil: this.elementCurrent.idConvocatoriaPerfil,
      idInscripcion: this.elementCurrent.id,
      language: !this.lang ? 'Es' : this.lang,
      reportTitle: 'RptResumenValidacionDocumentosHV',
      reportType: 'PDF',
      rptFileName: 'RptResumenValidacionDocumentosHV.rdlc',
      exportExtension: 'PDF'
    };

    this.reporteServ.getResumenValidacionDocumentosByUsuario(paramsReport)
      .toPromise()
      .then((resReporte: Blob) => {
        this.downloadBlob(resReporte, 'reporte');
        this.alertService.close();
        this.submit = false;
      })
      .catch(erro => {
        this.alertService.showError(erro)
        this.submit = true;
      });
  }
}
