import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { BaseController } from '../../../../../compartido/helpers/base-controller';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { AdministracionConvocatoriaService } from '../../../../../core/servicios/administracion-convocatoria.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { CommonService } from '../../../../../core/servicios/common.service';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { FilesService } from '../../../../../core/servicios/files.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { TypeSede } from '../../../../../compartido/modelos/type-sede';
import { TypePlace } from '../../../../../compartido/modelos/type-place';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { Cronograma } from '@app/compartido/modelos/cronograma';
import { ConvocatoryActivity } from '@app/compartido/modelos/convocatory-activity';
import { Seccion } from '../../../../../compartido/modelos/seccion';
import { TipoAdicional } from '../../../../../compartido/modelos/tipo-adicional';
import { Equivalencia } from '../../../../../compartido/modelos/equivalencia';
import { TipoCalificacion } from '@app/compartido/modelos/tipo-calificacion';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { TipoEtapa } from '@app/compartido/modelos/tipo-etapa';
import { TipoSubEtapa } from '@app/compartido/modelos/tipo-sub-etapa';
import { Etapa } from '../../../../../compartido/modelos/etapa';
import { stateConvocatoria, configMsg, PermisosEspeciales } from '../../../../../compartido/helpers/enums';
import { Adicional } from '@app/compartido/modelos/adicional';
import { TypeDocument } from '@app/compartido/modelos/type-document';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Departamento } from '@app/compartido/modelos/departamento';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { LugarPruebas } from '@app/compartido/modelos/lugar-prueba';
import { ok } from 'assert';
import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class ResumenComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstNameCorporations: string[] = [];
  public sortedData: any;

  public estadoConvocatoria: string;



  // public convocatory: Convocatoria[] = [];
  public convocatoryTemp: any[] = [];
  public lstTypeSede: TypeSede[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];
  public lstTypePlace: TypePlace[] = [];
  public lstTypePlaceString: string[] = [];
  public requiredCorporation = false;
  public elementCurrent: any = {};
  public stateConvocatoria = stateConvocatoria;
  public lstTypeDocument: TypeDocument[] = [];

  // Cronograma
  public idOtraActividad: any;
  public lstActivities: ConvocatoryActivity[] = [];

  public updateDataCronograma: Cronograma[] = [];
  public displayedColumns: string[] = ['codeConvocatoria', 'activity', 'initDate', 'dateEnd', 'esProrroga', 'recordActive', 'soport'];
  public dataSourceCronograma = new MatTableDataSource<any>([]);


  // CrearSecciones
  public lstConvocatory: Convocatoria[] = [];
  public lstConvocatoryAux: Convocatoria[] = [];

  public updateDataCrearSecciones: Seccion[] = [];
  public displayedColumns2: string[] = ['titulo', 'nombreConvocatoria'];
  public dataSourceCrearSecciones = new MatTableDataSource<any>([]);

  // SubSecciones
  public lstAuxSection: Seccion[] = [];
  public lstPrimarySection: Seccion[] = [];

  public updateDataSubsection: Seccion[] = [];
  public displayedColumns3: string[] = ['nombreConvocatoria', 'idSeccion', 'titulo'];
  public dataSourceSubSecciones = new MatTableDataSource<any>([]);

  // Equivalencias

  public equivalence: Equivalencia[] = [];
  public displayedColumns4: string[] = ['idConvocatoria', 'idTipoEstudio', 'anio'];
  public dataSourceEquivalencias = new MatTableDataSource<any>([]);

  // Etapas
  public lstQualification: TipoCalificacion[] = [];
  public lstStages: TipoEtapa[] = [];
  public lstTest: TipoPrueba[] = [];
  public lstSubStagest: TipoSubEtapa[] = [];
  private idTypeSimple;

  public updateDataEtapa: Etapa[] = [];
  public displayedColumns5: string[] = ['idConvocatoria', 'idTipoCalificacion', 'idTipoEtapa', 'idTipoPrueba', 'idTipoSubEtapa', 'valorMinimo', 'valorMaximo', 'puntajeMinimo'];
  public dataSourceEtapas = new MatTableDataSource<any>([]);

  // Adicional
  public lstAditionalType: TipoAdicional[] = [];
  public lstStepType: TipoEtapa[] = [];

  public updateDataAditional: Adicional[] = [];
  public displayedColumns6: string[] = ['convocatoria', 'tipo', 'etapa', 'puntajeMaximo'];
  public dataSourceAdicional = new MatTableDataSource<any>([]);


  // Perfil convocatoria
  public tipoCargo = 0;
  public lstConvocatoriaPerfil: ConvocatoriaPerfil[] = [];
  public lstTipoDependenciaHijasAll: TipoDependenciaHija[] = [];
  public displayedColumnsPC: string[] = ['codCargo', 'grado', 'cargo', 'lugar', 'dependenciaLugar'];
  public dataSourcePC = new MatTableDataSource<any>([]);


  // Lugar pruebas
  public lstLugarPruebas: LugarPruebas[] = [];
  public lstDepartamento: Departamento[] = [];
  public lstMunicipio: Ciudad[];

  public updateDataLugarPrueba: LugarPruebas[] = [];
  public displayedColumns7: string[] = ['convocatoria', 'departamento', 'municipio', 'sitio', 'direccion', 'salon'];
  public dataSourceLugarPrueba = new MatTableDataSource<any>([]);

  ///
  public form: FormGroup;
  public dataConvocatory: Convocatoria;

  public data: any = {};
  public showField: any = false;
  public showField2: any = false;
  public showField3: any = true;

  /* Empresa */
  private user = this.commonService.getVar(configMsg.USER);
  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstConvocatoriasByEmpresa: Convocatoria[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;

  @ViewChild('matPaginator1', { static: true }) paginator1: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;

  @ViewChild('matPaginator3', { static: true }) paginator3: MatPaginator;
  @ViewChild('TableThreeSort', { static: true }) sort3: MatSort;

  @ViewChild('matPaginator4', { static: true }) paginator4: MatPaginator;
  @ViewChild('TableFourSort', { static: true }) sort4: MatSort;

  @ViewChild('matPaginator5', { static: true }) paginator5: MatPaginator;
  @ViewChild('TableFiveSort', { static: true }) sort5: MatSort;

  @ViewChild('matPaginator6', { static: true }) paginator6: MatPaginator;
  @ViewChild('TabletSixSort', { static: true }) sort6: MatSort;

  @ViewChild('matPaginator7', { static: true }) paginator7: MatPaginator;
  @ViewChild('TableSevenSort', { static: true }) sort7: MatSort;

  @ViewChild('matPaginator8', { static: true }) paginator8: MatPaginator;
  @ViewChild('TableEightSort', { static: true }) sort8: MatSort;

  @ViewChild('divFormMain', { static: true }) divFormMain: ElementRef;


  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private acs: AdministracionConvocatoriaService,
    private commonService: CommonService,
    private cs: ConvocatoriaService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
    private fService: FilesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }


  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadUserData();
    this.loadForm();
    this.setPaginatorsTable();
    this.divFormMain.nativeElement.hidden = true;
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
  }

  sortData(sort: Sort) {
    const data = this.dataSourceCronograma.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceCronograma.data.sort((a: Cronograma, b: Cronograma) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'codeConvocatoria': return this.compare(a.convocatoria, b.convocatoria, isAsc);
        case 'activity': return this.compare(a.actividadaConvocatoria, b.actividadaConvocatoria, isAsc);
        case 'initDate': return this.compare(a.fechaInicial, b.fechaInicial, isAsc);
        case 'dateEnd': return this.compare(a.fechaFinal, b.fechaFinal, isAsc);
        case 'esProrroga': return this.compare(a.esProrroga, b.esProrroga, isAsc);
        case 'recordActive': return this.compare(a.registroActivo, b.registroActivo, isAsc);
        default: return 0;
      }
    });
  }

  sortData2(sort: Sort) {
    const data = this.dataSourceCrearSecciones.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceCrearSecciones.data.sort((a: Seccion, b: Seccion) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'titulo': return this.compare(a.titulo, b.titulo, isAsc);
        case 'nombreConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        default: return 0;
      }
    });
  }

  sortData3(sort: Sort) {
    const data = this.dataSourceSubSecciones.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceSubSecciones.data.sort((a: Seccion, b: Seccion) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nombreConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'idSeccion': return this.compare(a.nombreSeccion, b.nombreSeccion, isAsc);
        case 'titulo': return this.compare(a.titulo, b.titulo, isAsc);
        default: return 0;
      }
    });
  }

  sortData4(sort: Sort) {
    const data = this.dataSourceEquivalencias.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceEquivalencias.data.sort((a: Equivalencia, b: Equivalencia) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'idConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'idTipoEstudio': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        case 'anio': return this.compare(a.anio, b.anio, isAsc);
        default: return 0;
      }
    });
  }

  sortData5(sort: Sort) {
    const data = this.dataSourceCronograma.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceEtapas.data.sort((a: Etapa, b: Etapa) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'idConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'idTipoCalificacion': return this.compare(a.tipoCalificacion, b.tipoCalificacion, isAsc);
        case 'idTipoEtapa': return this.compare(a.tipoEtapa, b.tipoEtapa, isAsc);
        case 'idTipoPrueba': return this.compare(a.tipoPrueba, b.tipoPrueba, isAsc);
        case 'idTipoSubEtapa': return this.compare(a.tipoSubEtapa, b.tipoSubEtapa, isAsc);
        case 'valorMinimo': return this.compare(a.valorMinimo, b.valorMinimo, isAsc);
        case 'valorMaximo': return this.compare(a.valorMaximo, b.valorMaximo, isAsc);
        case 'puntajeMinimo': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);
        default: return 0;
      }
    });
  }

  sortData6(sort: Sort) {
    const data = this.dataSourceAdicional.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceAdicional.data.sort((a: Adicional, b: Adicional) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.convocatoria, b.convocatoria, isAsc);
        case 'etapa': return this.compare(a.tipoEtapa, b.tipoEtapa, isAsc);
        case 'tipo': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        case 'puntajeMaximo': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);
        default: return 0;
      }
    });
  }

  sortData7(sort: Sort) {
    const data = this.dataSourceLugarPrueba.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceLugarPrueba.data.sort((a: LugarPruebas, b: LugarPruebas) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'departamento': return this.compare(a.nombreDepartamento, b.nombreDepartamento, isAsc);
        case 'municipio': return this.compare(a.nombreCiudad, b.nombreCiudad, isAsc);
        case 'sitio': return this.compare(a.sitio, b.sitio, isAsc);
        case 'direccion': return this.compare(a.direccion, b.direccion, isAsc);
        case 'aula': return this.compare(a.aula, b.aula, isAsc);
        default: return 0;
      }
    });
  }

  public sortDataPC(sort: Sort) {
    const data = this.dataSourcePC.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: ConvocatoriaPerfil, b: ConvocatoriaPerfil) => {
      const isAsc = sort.direction === 'asc';
      const codigoCargoA = a.perfil.cargoHumanoModel ? a.perfil.cargoHumanoModel.codCargo : a.perfil.cargoModel.codAlterno;
      const codigoCargoB = b.perfil.cargoHumanoModel ? b.perfil.cargoHumanoModel.codCargo : b.perfil.cargoModel.codAlterno;
      const nombreCargoA = a.perfil.cargoHumanoModel ? a.perfil.cargoHumanoModel.cargo : this.translateField(a.perfil.cargoModel, 'cargo', this.lang);
      const nombreCargobB = b.perfil.cargoHumanoModel ? a.perfil.cargoHumanoModel.codCargo : a.perfil.cargoModel.codAlterno;
      switch (sort.active) {
        case 'codCargo': return this.compare(codigoCargoA, codigoCargoB, isAsc);
        case 'cargo': return this.compare(nombreCargoA, nombreCargobB, isAsc);
        case 'grado': return this.compare(a.perfil.idGradoCargo, b.perfil.idGradoCargo, isAsc);
        case 'convocatoria': return this.compare(a.convocatoria.nombreConvocatoria, b.convocatoria.nombreConvocatoria, isAsc);
        case 'lugar': return this.compare(a.perfil.tipoLugar.lugar, b.perfil.tipoLugar.lugar, isAsc);
        case 'dependenciaLugar': return this.compare(a.perfil.dependenciaHija ? a.perfil.dependenciaHija.nombre : '', b.perfil.dependenciaHija ? b.perfil.dependenciaHija.nombre : '', isAsc);
        default: return 0;
      }
    });
  }

  public async loadUserData() {
    this.company = null;
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
    }
  }

  public async loadConvocatoryByCompany(pCompany: any) {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstConvocatoriasByEmpresa = (<any>await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatoriesAll = this.lstConvocatoriasByEmpresa;
  }

  private setPaginatorsTable() {
    this.dataSourceCronograma.paginator = this.paginator1;
    this.dataSourceCronograma.sort = this.sort;

    this.dataSourceCrearSecciones.paginator = this.paginator2;
    this.dataSourceCrearSecciones.sort = this.sort2;

    this.dataSourceSubSecciones.paginator = this.paginator3;
    this.dataSourceSubSecciones.sort = this.sort3;

    this.dataSourceEquivalencias.paginator = this.paginator4;
    this.dataSourceEquivalencias.sort = this.sort4;

    this.dataSourceEtapas.paginator = this.paginator5;
    this.dataSourceEtapas.sort = this.sort5;

    this.dataSourceAdicional.paginator = this.paginator6;
    this.dataSourceAdicional.sort = this.sort6;

    this.dataSourceLugarPrueba.paginator = this.paginator7;
    this.dataSourceLugarPrueba.sort = this.sort7;

    this.dataSourcePC.paginator = this.paginator8;
    this.dataSourcePC.sort = this.sort8;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        /// Convocatoria
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        estadoConvocatoria: new FormControl({ value: '', disabled: false }),
        nombreConvocatoria: new FormControl({ value: '', disabled: false }),
        numeroConvocatoria: new FormControl({ value: '', disabled: false }),
        idTipoConvocatoria: new FormControl({ value: '', disabled: false }),
        idTipoSede: new FormControl({ value: '', disabled: false }),
        corporation: new FormControl({ value: '', disabled: true }),
        idTipoLugar: new FormControl({ value: '', disabled: false }),
        numeroCargosAplicar: new FormControl({ value: '', disabled: false }),
        codigoAcuerdo: new FormControl({ value: '', disabled: false }),
        fechaAcuerdo: new FormControl({ value: '', disabled: false }),
        idSoporteAcuerdo: new FormControl({ value: '', disabled: false }),

        idConvocatoria: new FormControl('', [Validators.required]),
      }
    );
    this.company = new FormControl('', [Validators.required]);


  }

  public async loadData() {

    if (this.idEmpresaT && !this.showSelectCompany) {
      this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise()).datos;
    } else if (this.company.value) {
      this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getTodosConvocatoriasByEmpresa(this.company.value).toPromise()).datos;
    }/*  else {
      this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getConvocatorias().toPromise()).datos;
    } */
  }

  public async loadDataConvocatory() {
    try {
      // Listados Comunes.
      this.lstActivities = this.lstActivities.length > 0 ? this.lstActivities : <ConvocatoryActivity[]>(<any>await this.acs.getActividadConvocatoria().toPromise()).datos;
      this.lstQualification = this.lstQualification.length > 0 ? this.lstQualification : <TipoCalificacion[]>(<any>await this.acs.getTipoCalificaciones().toPromise()).datos;
      this.lstStages = this.lstStages.length > 0 ? this.lstStages : <TipoEtapa[]>(<any>await this.acs.getTipoEtapas().toPromise()).datos;
      this.lstSubStagest = this.lstSubStagest.length > 0 ? this.lstSubStagest : <TipoSubEtapa[]>(<any>await this.acs.getTipoSubEtapas().toPromise()).datos;

      this.lstTypeConvocatory = this.lstTypeConvocatory.length > 0 ? this.lstTypeConvocatory : <TypeConvocatory[]>(<any>await this.acs.getTipoConvocatoria().toPromise()).datos;
      this.lstTypeSede = this.lstTypeSede.length > 0 ? this.lstTypeSede : <TypeSede[]>(<any>await this.acs.getTipoSede().toPromise()).datos;
      this.lstTypePlace = this.lstTypePlace.length > 0 ? this.lstTypePlace : <TypePlace[]>(<any>await this.acs.getTipoLugar().toPromise()).datos;
      this.lstAditionalType = this.lstAditionalType.length > 0 ? this.lstAditionalType : <TipoAdicional[]>(<any>await this.acs.getTipoAdicionales().toPromise()).datos;
      this.lstTest = this.lstTest.length > 0 ? this.lstTest : <TipoPrueba[]>(<any>await this.acs.getTipoPruebas().toPromise()).datos;
      this.lstLugarPruebas = this.lstLugarPruebas.length > 0 ? this.lstLugarPruebas : <LugarPruebas[]>(<any>await this.acs.getlugarPrueba().toPromise()).datos;

      //#region Convocatoria
      this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);
      if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO) {
        this.estadoConvocatoria = this.ct.CONVOCATORIA_INACTIVA_MSG;
      } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        this.estadoConvocatoria = this.ct.CONVOCATORIA_PUBLICADA_MSG;
      } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.ACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.EN_BORRADOR) {
        this.estadoConvocatoria = this.ct.CONVOCATORIA_ENCOSTRUCION_MSG;
      } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
        this.estadoConvocatoria = this.ct.CONVOCATORIA_CERRADA_MSG;
      } else {
        this.estadoConvocatoria = '';
      }

      // Tipo Convocatoria
      const tipoConvo = this.lstTypeConvocatory.find((x: TypeConvocatory) => Number(x.id) === this.dataConvocatory.idTipoConvocatoria);
      // this.dataConvocatory.nombreTipoConvocatoria = tipoConvo ? tipoConvo.tipoConvocatoria : '';
      this.dataConvocatory.nombreTipoConvocatoria = tipoConvo ? this.translateField(tipoConvo, 'tipoConvocatoria', this.lang) : '';

      // Tipo Sede
      const tipoSede = this.lstTypeSede.find((x: TypeSede) => (x.id) === this.dataConvocatory.idTipoSede);
      // this.dataConvocatory.nombreTipoSede = tipoSede ? tipoSede.sede : '';
      this.dataConvocatory.nombreTipoSede = tipoSede ? this.translateField(tipoSede, 'sede', this.lang) : '';

      // soporte acuerdo
      if (this.dataConvocatory.idSoporteAcuerdo) {
        this.dataConvocatory.nombreSoporteAcuerdo = (<any>await this.fService.getInformationFile(this.dataConvocatory.idSoporteAcuerdo).toPromise()).datos.nombreAuxiliar;
      }


      this.commonService.getFormatDate
      this.form.patchValue({


        nombreConvocatoria: this.dataConvocatory.nombreConvocatoria,
        numeroConvocatoria: this.dataConvocatory.numeroConvocatoria,
        idTipoConvocatoria: this.dataConvocatory.nombreTipoConvocatoria,
        idTipoSede: this.dataConvocatory.nombreTipoSede,
        // corporation: this.dataConvocatory.corporation,
        idTipoLugar: this.dataConvocatory.idTipoLugar,
        numeroCargosAplicar: this.dataConvocatory.numeroCargosAplicar,
        codigoAcuerdo: this.dataConvocatory.codigoAcuerdo,
        fechaAcuerdo: this.commonService.getFormatDate(new Date(this.dataConvocatory.fechaAcuerdo)),
        // fechaAcuerdo: this.dataConvocatory.fechaAcuerdo,
        idSoporteAcuerdo: C.validateData(this.dataConvocatory.idSoporteAcuerdo) ? this.dataConvocatory.nombreSoporteAcuerdo : undefined,
      });



      this.lstNameCorporations = [];
      const ids = this.dataConvocatory.idTipoLugar.split(',');
      this.lstTypePlace.forEach((o: TypePlace) => {
        ids.forEach(x => {
          if (x === o.id) {
            this.lstNameCorporations.push(o.tipo);
          }
        });
      });

      //#region Cronograma
      const o = this.lstActivities.find(x => x.actividadConvocatoria === 'Otro');
      this.idOtraActividad = o ? o.id : -1;
      this.updateDataCronograma = <Cronograma[]>(<any>await this.cs.getCronogramaByConvocatory(this.dataConvocatory.id).toPromise()).datos;
      if (this.updateDataCronograma.length > 0) {
        for (let i = 0; i < this.updateDataCronograma.length; i++) {

          this.updateDataCronograma[i].convocatoria = this.dataConvocatory.nombreConvocatoria;

          this.lstActivities.forEach(g => {
            if (this.updateDataCronograma[i].idActividadConvocatoria == g.id) {
              // this.updateDataCronograma[i].actividadaConvocatoria = g.actividadConvocatoria + (g.id == this.idOtraActividad ? ' (' + this.updateDataCronograma[i].otroActividadConvocatoria + ')' : '');
              this.updateDataCronograma[i].actividadaConvocatoria = this.translateField(g, 'actividadConvocatoria', this.lang); + (g.id == this.idOtraActividad ? ' (' + this.updateDataCronograma[i].otroActividadConvocatoria + ')' : '');
              const c = this.lstConvocatoriesAll.find(x => x.id == this.updateDataCronograma[i].idConvocatoria);
              if (c) {
                this.updateDataCronograma[i].mostrarBtns = c.mostrar;
              }
              return;
            }
          });
        }
      }
      this.dataSourceCronograma.data = this.updateDataCronograma;
      //#endregion

      //#region Seccion
      this.cs.getSeccionByConvocatory(this.dataConvocatory.id).subscribe(
        (res: any) => {
          this.updateDataCrearSecciones = <Seccion[]>res.datos;
          this.updateDataCrearSecciones.forEach(e => {
            e.nombreConvocatoria = this.dataConvocatory.nombreConvocatoria;
          });
          this.dataSourceCrearSecciones.data = this.updateDataCrearSecciones;


          //#region SubSecciones
          this.cs.getObtenerSubseccionesPorConvocatoria(this.dataConvocatory.id).subscribe(
            (res: any) => {
              this.updateDataSubsection = res.datos;

              this.updateDataSubsection.forEach(e => {
                e.nombreConvocatoria = this.dataConvocatory.nombreConvocatoria;
                this.updateDataCrearSecciones.forEach(s => {
                  if (e.idSeccion == s.id) {
                    //e.nombreSeccion = s.titulo;
                    e.nombreSeccion = this.translateField(s, 'titulo', this.lang);
                    return;
                  }
                })
              });
              this.dataSourceSubSecciones.data = this.updateDataSubsection;
            }, error => {
              console.log('Error', error);
            }
          );

          //#endregion
        }, error => {
          console.log('Error', error);
        }
      );

      //#endregion

      //#region Equivalencias
      this.cs.getEquivalenciaByConvocatory(this.dataConvocatory.id).subscribe(
        (res: any) => {
          this.equivalence = <Equivalencia[]>res.datos;
          this.equivalence.forEach(e => {
            e.nombreConvocatoria = this.dataConvocatory.nombreConvocatoria;

            this.lstAditionalType.forEach(s => {
              if (e.idTipoEstudio == s.id) {
                //e.tipoAdicional = s.tipoAdicional;
                e.tipoAdicional = this.translateField(s, 'tipoAdicional', this.lang);;
                return;
              }
            });
          });
          this.dataSourceEquivalencias.data = this.equivalence;
        });
      //#endregion

      //#region Etapas
      this.cs.getEtapaByConvocatory(this.dataConvocatory.id).subscribe(
        (res: any) => {
          this.updateDataEtapa = <Etapa[]>res.datos;
          this.updateDataEtapa.forEach(e => {
            e.nombreConvocatoria = this.dataConvocatory.nombreConvocatoria;

            this.lstQualification.forEach(g => {
              if (e.idTipoCalificacion === g.id) {
                //e.tipoCalificacion = g.tipoCalificacion;
                e.tipoCalificacion = this.translateField(g, 'tipoCalificacion', this.lang);
                return;
              }
            });

            this.lstStages.forEach(g => {
              if (e.idTipoEtapa === g.id) {
                //e.tipoEtapa = g.tipoEtapa;
                e.tipoEtapa = this.translateField(g, 'tipoEtapa', this.lang);
                return;
              }
            });

            this.lstTest.forEach(g => {
              if (e.idTipoPrueba === g.id) {
                //e.tipoPrueba = g.tipoPrueba;
                e.tipoPrueba = this.translateField(g, 'tipoPrueba', this.lang);
                return;
              }
            });

            // this.lstSubStagest.forEach(g => {
            //   if (e.idTipoSubEtapa === g.id) {
            //     e.tipoSubEtapa = this.translateField(g , 'tipoPrueba', this.lang);
            //     return;
            //   }
            // });

          });
          this.dataSourceEtapas.data = this.updateDataEtapa;
        });
      //#endregion

      //#region Adicional
      this.cs.getObtenerAdicionalesPorConvocatoria(this.dataConvocatory.id).subscribe(
        (res: any) => {
          this.updateDataAditional = <Adicional[]>res.datos;
          this.updateDataAditional.forEach(e => {
            e.convocatoria = this.dataConvocatory.nombreConvocatoria;

            this.lstAditionalType.forEach(g => {
              if (e.idTipoAdicional === g.id) {
                //e.tipoAdicional = g.tipoAdicional;
                e.tipoAdicional = this.translateField(g, 'tipoAdicional', this.lang);
                return;
              }
            });

            this.lstStages.forEach(g => {
              if (e.idTipoEtapa === g.id) {
                //e.tipoEtapa = g.tipoEtapa;
                e.tipoEtapa = this.translateField(g, 'tipoEtapa', this.lang);
                return;
              }
            });
          });
          this.dataSourceAdicional.data = this.updateDataAditional;
        });
      //#endregion

      //#region Perfil convocatoria

      this.lstTipoDependenciaHijasAll = (await this.acs.getTipoDependenciaHija().toPromise() as any).datos;

      // Carga las convocatoria perfiles de la convocatoria seleccionada y filtra las del tipocargo seleccionado por variables
      this.lstConvocatoriaPerfil = ((await this.cs.getConvocatoriaPerfilByConvocatoria(this.dataConvocatory.id).toPromise() as any).datos) as ConvocatoriaPerfil[];

      const lstTem: ConvocatoriaPerfil[] = [];
      this.lstConvocatoriaPerfil.forEach(p => {
        p.perfil = JSON.parse(p.detallePerfil);
        if (this.tipoCargo === 1) {
          if (p.perfil.cargoHumanoModel) {
            lstTem.push(p);
          }
        } else {
          if (p.perfil.cargoModel) {
            lstTem.push(p);
          }
        }
        p.convocatoria = this.lstConvocatoriesAll.find(x => x.id === p.idConvocatoria);

        const lugarTemp = this.lstTypePlace.find(l => l.id === p.perfil.idTipoLugar);
        p.perfil.tipoLugar = lugarTemp;

        if (p.perfil.idTipoDependenciaHija) {
          const dependenciaLugarTemp = this.lstTipoDependenciaHijasAll.find(l => l.id === p.perfil.idTipoDependenciaHija);
          p.perfil.dependenciaHija = dependenciaLugarTemp;
        }


      });
      // this.lstConvocatoriaPerfil = lstTem;
      this.dataSourcePC.data = this.lstConvocatoriaPerfil;

      //#endregion

      //#region Lugar Prueba
      this.lstMunicipio = (<any>await this.commonService.getCiudades().toPromise()).ciudades;
      this.lstDepartamento = (<any>await this.commonService.getDepartamentos().toPromise()).departamentos;
      this.cs.getObtenerlugarPruebaPorConvocatoria(this.dataConvocatory.id).subscribe(
        (res: any) => {
          this.updateDataLugarPrueba = <LugarPruebas[]>res.datos;
          this.updateDataLugarPrueba.forEach(e => {
            e.nombreConvocatoria = this.dataConvocatory.nombreConvocatoria;

            this.lstDepartamento.forEach(g => {
              if (e.idDepartamento === g.id) {
                e.nombreDepartamento = g.departamento;
                return;
              }
            });

            this.lstMunicipio.forEach(g => {
              if (e.idCiudad === g.id) {
                e.nombreCiudad = g.ciudad;
                return;
              }
            });
          });
          this.dataSourceLugarPrueba.data = this.updateDataLugarPrueba;
        });
      //#endregion

    } catch (error) {
      console.log(error);
    }
    this.mostrarBotones();
  }

  public changeConvocatory(event) {
    if (event.value !== undefined) {
      this.alertService.loading();
      this.loadDataConvocatory().then(() => {
        this.alertService.close();
        this.divFormMain.nativeElement.hidden = false;
      });
    }
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public publicar() {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_INACTIVA_NO_PUBLICADA, TYPES.WARNING);
      return;
    }
    this.alertService.comfirmation(this.ct.PUBLICATION_QUESTION_MSG, TYPES.WARNING)
      .then(ok => {
        if (ok.value) {
          this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES).then(res => {
            this.setJson(res);
            if (res.valorObj.funcionarios !== 0 &&
              this.dataConvocatory.idTipoCargo.toUpperCase() === String(res.valorObj.id_funcionarios).toUpperCase()) {
              if (res.valorObj.altasCortes !== 0) {
                if (!this.dataConvocatory.idTipoLugar.toUpperCase().includes(String(res.valorObj.id_altas_cortes).toUpperCase())) {
                  this.alertService.message(this.ct.CONFIGURACION_FUNCI_ALTAS_CORTES, TYPES.WARNING);
                  return;
                }
                if (!this.updateDataCronograma || this.updateDataCronograma.length <= 0) {
                  this.alertService.message(this.ct.CONVOCATORIA_SIN_CRONOGRAMA, TYPES.WARNING);
                  return;
                }
              } else {
                this.alertService.message(this.ct.CONFIGURACION_FUNCI_ALTAS_CORTES, TYPES.WARNING);
                return;
              }
            }

            this.cs.publicarConvocatoria(this.user.id, this.dataConvocatory.id).toPromise()
              .then((record: any) => {
                this.alertService.message(this.ct.PUBLICATION_MSG, TYPES.SUCCES);
              })
              .catch(error => {
                this.alertService.message(this.ct.NOT_PUBLICATION_MSG, TYPES.WARNING);
              });

          });
        }
      });
  }

  public mostrarBotones(){
    this.showField = this.commonService.hasPermissionUserActionEspecial([PermisosEspeciales.BotonPublicar]);
    this.showField2 = this.commonService.hasPermissionUserActionEspecial([PermisosEspeciales.BotonFinalizar]);

    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA){
      this.showField = false;
      this.showField2 = false;
    }

    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES){
      this.showField = false;
    }

    if(this.dataConvocatory.estadoConvocatoria !== stateConvocatoria.PUBLICADA && this.dataConvocatory.estadoConvocatoria !== stateConvocatoria.PUBLICADA_CON_AJUSTES){
      this.showField2 = false;
    }  
  }

  public finalizar() {
    this.alertService.comfirmation(this.ct.FINISH_QUESTION_MSG, TYPES.WARNING)
      .then(ok => {
        if (ok.value) {
          this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES).then(res => {
            this.setJson(res);

            this.cs.cerrarConvocatoria(this.user.id, this.dataConvocatory.id).toPromise()
              .then((record: any) => {
                this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.SUCCES);
                this.showField2 = false;
              })
              .catch(error => {
                this.alertService.message(this.ct.ERROR_MSG, TYPES.WARNING);
              });
          });
        }
      });
  }
}
