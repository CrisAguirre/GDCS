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
import { element } from 'protractor';



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
}

@Component({
  selector: 'app-proceso-alta-corte',
  templateUrl: './proceso-alta-corte.component.html',
  styleUrls: ['./proceso-alta-corte.component.scss']
})
export class ProcesoAltaCorteComponent extends BaseController implements OnInit, AfterViewChecked {


  private user = this.commonService.getVar(configMsg.USER);
  public displayedColumns: string[] = ['identificacion', 'nombreAspirante', 'cargoAspirante', 'gradoCargo', 'dependencia', 'estadoAspirante', 'options'];
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
  private idSEstadoSAsp: Configuration;
  private idSEstadoSAspAltasCortes: Configuration;
  private idEstadoAspirantePreseleccionado: Configuration;
  private idEstadoAspiranteCumpleRequisitos: Configuration;
  public varAltasCortes: Configuration;
  public idEstadoAspiranteElegido: Configuration;
  public idEstadoAspiranteInscrito: Configuration;
  public seleccionoAdmitido: Boolean = null;
  public showBotonGuardar: boolean;
  private canSendEmail = false;
  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;
  public showBotonReporte: boolean;




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
  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      idEmpresa: new FormControl(''),
      idConvocatoria: new FormControl(''),
    });
  }

  get f() {
    return this.form.controls;
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

      // cargar las variables de configuracion
      this.idEstadoAspiranteCumpleRequisitos = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CUMPLE_REQUISITOS));
      this.idEstadoAspirantePreseleccionado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_PRESELECCIONADO));

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

        this.lstTable.forEach(x => {
          x.resumenHVModel = JSON.parse(x.resumenHV);

          if (x.estadoAspirante == this.idEstadoAspiranteCumpleRequisitos.valor) {

          }

          if (x.resumenRecalificacionHV) {
            x.resumenRecalificacionHVModel = JSON.parse(x.resumenRecalificacionHV);
          }
          x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
          if (this.areEqualsIdGuid(x.estadoAspiranteModel.id, this.varEstadoAspiranteNoAdmitido.valor)) {
            x.estadoSolicitudRecalificacion = 'No';
          }
          const cPerfil: ConvocatoriaPerfil = x.convocatoriaPerfilModel;
          cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);

        });
      }
    }

    // filtrar los datos que cumplen los requisitos
    this.lstTable = this.lstTable.filter(x => x.idEstadoAspirante === this.idEstadoAspiranteCumpleRequisitos.valor || x.idEstadoAspirante === this.idEstadoAspirantePreseleccionado.valor);

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


    //cargar variable estado aspirante
    this.varEstadoAspiranteNoAdmitido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_ADMITIDO));
    this.idEstadoAspiranteAdmitido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ADMITIDO));
    this.idEstadoAspiranteElegido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ELEGIDO));
    this.idEstadoAspiranteInscrito = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_INSCRITO));
    this.varEstadoAspiranteCumpleReq = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CUMPLE_REQUISITOS));
    this.varEstadoAspiranteNoCumpleReq = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_CUMPLE_REQUISITOS));
    this.idSEstadoSAsp = (await this.commonService.getVarConfig(configMsg.ESTADOS_ASPIRANTES_VERIFICACION_DOCS));
    this.idSEstadoSAspAltasCortes = (await this.commonService.getVarConfig(configMsg.ESTADOS_ASPIRANTES_VERIFICACION_DOCS_ALTAS_CORTES));
    this.idEstadoAspirantePreseleccionado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_PRESELECCIONADO));



    //cargar la variable de altas cortes
    this.varAltasCortes = (await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES));
    this.setJson(this.varAltasCortes);


    //cargar el tipo de anexos
    this.lstTipoAnexos = <TypeFileAnnexed[]>(<any>await this.commonService.getTypeFileAnnexed().toPromise()).datos;


    this.lstTable = [];
    this.dataSource.data = this.lstTable;
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
  }

  public aprobarAspirante(elementIn: InscripcionAspiranteModel) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    let formValid = true;
    if (formValid) {
      this.submit = true;
      this.alertService.loading();
      this.elementCurrent = elementIn;
      const element: InscripcionAspiranteModel = this.elementCurrent;
      element.idEstadoAspirante = this.idEstadoAspirantePreseleccionado.valor;
      element.idUsuarioModificacion = this.user.id;


      this.commonService.actualizarEstadoInscripcionAspirante(element.id, this.user.id, element.idEstadoAspirante)
        .subscribe(o => {
          this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value })
            .then(r => {
              this.alertService.message(this.ct.MSG_PRESELECCION_EXITOSA, TYPES.SUCCES);
            });
        }, err => {
          this.alertService.showError(err);
        });
    }
  }
}
