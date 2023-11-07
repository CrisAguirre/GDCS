import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { AspiranteAdmintidoModel } from '@app/compartido/modelos/aspirante-admitido-model';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria, PermisosAcciones } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { LugarPruebas } from '@app/compartido/modelos/lugar-prueba';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { SelectionModel } from '@angular/cdk/collections';
import { CitacionAspiranteModel } from '@app/compartido/modelos/citacion-aspirante-model';
import { DatePipe } from '@angular/common';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { ReportesService } from '@app/core/servicios/reportes.service';
import { Configuration } from '@app/compartido/modelos/configuration';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-citacion-pruebas',
  templateUrl: './citacion-pruebas.component.html',
  styleUrls: ['./citacion-pruebas.component.scss']
})
export class CitacionPruebasComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTable: CitacionAspiranteModel[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstCompanies: Empresa[] = [];
  public lstLugarPruebasByConvocatoria: LugarPruebas[] = [];
  public lstLugarPruebasAll: LugarPruebas[] = [];
  public lstPruebasByCitacion: TipoPrueba[] = [];
  public lstCitacionAspirantesAll: CitacionAspiranteModel[] = [];
  public lstCitacionAspirantesByConvocatoria: CitacionAspiranteModel[] = [];
  public estadoConvocatoria: string;

  public form: FormGroup;
  public form2: FormGroup;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public convocatoryCurrent: Convocatoria = null;
  public idEmpresaT = null;
  public showSelectCompany = false;
  public submit = false;
  public dataConvocatory: Convocatoria;
  private dataTemp = {
    idConvocatoria: null,
    convocatoriaSeleccionada: null
  };

  private idEstadoAspiranteCitacion: Configuration;
  private idEstadoAspiranteInscripcion: Configuration;
  private idEstadoAspirantePreseleccionado: Configuration;
  private idEstadoAspiranteAproboPruebas: Configuration;
  private modelo: number = 1;
  public varAltasCortes: Configuration;

  public selectionCitaciones = new SelectionModel<TipoPrueba>();
  public displayedColumns: string[] = ['identificacionUsuario', 'usuario', 'convocatoria', 'codCargoUsuario', 'cargoUsuario', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator1', { static: true }) paginator1: MatPaginator;
  @ViewChild('matSort1', { static: true }) sort1: MatSort;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;


  /* Variables selección de pruebas convocatoria */
  public lstPruebasAll: TipoPrueba[] = [];
  public lstPruebasSelectedTemp: TipoPrueba[] = [];
  public selection = new SelectionModel<TipoPrueba>();
  public dataSourcePruebas = new MatTableDataSource<any>();
  public displayedColumnsEtapas: string[] = ['select', 'tipoPrueba'];
  public displayedColumnsInfo: string[] = ['idTipoPrueba', 'valorMinimo', 'valorMaximo'];
  // @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('matPaginator2', { static: false }) set matPaginator2(value: MatPaginator) {
    this.dataSourcePruebas.paginator = value;
  }
  @ViewChild('matSort2', { static: true }) sort2: MatSort;


  /* Variables selección aspirantes admitidos */
  public lstAspirantesAdmitidosAll: AspiranteAdmintidoModel[] = [];
  public lstAspirantesAdmitidosByConvocatoria: AspiranteAdmintidoModel[] = [];
  public lstAspirantesSelectedTemp: AspiranteAdmintidoModel[] = [];
  public selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>();
  public dataSourceAspirantes = new MatTableDataSource<any>();
  public displayedColumnsAspirantes: string[] = ['select', 'numeroDocumento', 'usuario', 'codCargo', 'cargoAspirante', 'observacion'];
  // @ViewChild('matPaginator3', { static: true }) paginator3: MatPaginator;
  @ViewChild('paginatorAspirantes1', { static: false }) set paginatorAspirantes1(value: MatPaginator) {
    this.dataSourceAspirantes.paginator = value;
  }
  @ViewChild('matSort3', { static: true }) sort3: MatSort;
  @ViewChild('picker', { static: true }) picker: any;

  // variables para el modelo 2
  public displayedColumnsM2: string[] = ['select', 'identificacion', 'cargoAspirante', 'gradoCargo', 'dependencia', 'lugar', 'estadoAspirante'];
  private lstInscripcionesAllM2: InscripcionAspiranteModel[] = [];
  public lstInscripcionesTableM2: InscripcionAspiranteModel[] = [];
  public lstInscripcionesTableSelectedM2: InscripcionAspiranteModel[] = [];
  public selectionInscripcionM2 = new SelectionModel<InscripcionAspiranteModel>();
  public dataSourceInscripcionM2 = new MatTableDataSource<any>();
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstPerfilConvocatoriaM2: ConvocatoriaPerfil[] = [];
  // @ViewChild('matPaginatorM2', { static: true }) paginatorM2: MatPaginator;
  @ViewChild('paginatorAspirantes2', { static: false }) set paginatorAspirantes2(value: MatPaginator) {
    this.dataSourceInscripcionM2.paginator = value;
  }
  @ViewChild('matSortM2', { static: true }) sortM2: MatSort;
  @ViewChild('pickerM2', { static: true }) pickerM2: any;
  // public disabled = false;

  constructor(
    private adminConvService: AdministracionConvocatoriaService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private dialogService: MatDialog,
    private reporteService: ReportesService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    /* this.dataSourcePruebas.paginator = this.paginator2;
    this.dataSourcePruebas.sort = this.sort2;

    this.dataSourceAspirantes.paginator = this.paginator3;
    this.dataSourceAspirantes.sort = this.sort3; */

    this.alertService.loading();
    this.loadForm();
    this.loadForm2();
    this.loadUserData().then(() => {
      this.loadData()
        .catch(error => {
          console.log('Error', error);
        })
        .finally(() => {
          this.alertService.close();
        });
    });

    this.dataSource.paginator = this.paginator1;
    this.dataSource.sort = this.sort1;

    this.dataSource.filterPredicate = (data: CitacionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        this.commonService.getNumeroDocumento(data.inscripcionAspiranteModel),
        this.commonService.getNameAspirante(data.inscripcionAspiranteModel),
        this.getCodCargoAspiranteCitacion(data),
        this.commonService.getCargoAspirante(data.inscripcionAspiranteModel),
        data.nombreConvocatoria,
      ];
      return C.filterTable(dataCompare, filter);
    };

    this.dataSourceAspirantes.filterPredicate = (data: AspiranteAdmintidoModel, filter: string): boolean => {
      const dataCompare = [
        this.commonService.getNumeroDocumento(data.inscripcionAspirante),
        this.commonService.getNameAspirante(data.inscripcionAspirante),
        this.getCodCargoAspirante(data),
        this.commonService.getCargoAspirante(data.inscripcionAspirante),
        data.observacion,
      ];
      return C.filterTable(dataCompare, filter);
    };
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!C.validateList(this.lstCompanies)) {
        this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.alertService.loading();
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstTable = this.lstCitacionAspirantesAll.filter(x => x.idEmpresa === this.f.idEmpresa.value);
    this.lstConvocatories = this.lstConvocatoriesAll;  
    this.alertService.close();      
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);

    if (pConvocatoria.value) {
      // Carga la información de la convocatoria seleccionada
      this.convocatoryCurrent = (await this.cs.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;

      this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }
      // Cargar el lugar de pruebas de la convocatoria seleccionada
      this.lstLugarPruebasByConvocatoria = this.lstLugarPruebasAll.filter(x => this.areEqualsIdGuid(x.idConvocatoria, pConvocatoria.value));


      //cargar el modelo de proceso
      this.modelo = this.convocatoryCurrent.tipoModelo;

      if (this.modelo == Constants.MODELO_1) {
        // Carga los aspirantes admitidos de la convocatoria seleccionada
        this.lstAspirantesAdmitidosByConvocatoria = [];
        this.lstAspirantesAdmitidosByConvocatoria = this.lstAspirantesAdmitidosAll.filter(a => a.idConvocatoria === pConvocatoria.value);
        if (this.esAltasCortes(this.convocatoryCurrent.idTipoLugar)) {
          const lstInscripcionTemp = (await this.commonService.getInscripcionesConvocatoria(pConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];
          this.lstAspirantesAdmitidosByConvocatoria = this.lstAspirantesAdmitidosByConvocatoria.filter(x => {
            const insAsp = lstInscripcionTemp.find(z => z.id === x.idInscripcionAspirante);
            if (insAsp && this.areEqualsIdGuid(insAsp.idEstadoAspirante, this.idEstadoAspirantePreseleccionado.valor)) {
              return true;
            }
            return false;
          });
        }
        this.dataSourceAspirantes.data = this.lstAspirantesAdmitidosByConvocatoria;
        this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);

      } else if (this.modelo == Constants.MODELO_2) {

        //this.lstInscripcionesAllM2 = (await this.commonService.getInscripcionesEmpresa(this.f.idEmpresa.value).toPromise() as any).datos as InscripcionAspiranteModel[];
        //cargar variables necesesarias
        this.idEstadoAspiranteCitacion = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CITACION));
        this.idEstadoAspiranteInscripcion = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_INSCRITO));
        this.idEstadoAspiranteAproboPruebas = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_PRUEBAS));
        this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];

        this.lstInscripcionesTableM2 = (await this.commonService.getInscripcionesConvocatoria(pConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];
        this.lstInscripcionesTableM2 = this.lstInscripcionesTableM2.filter(x => this.areEqualsIdGuid(x.idEstadoAspirante, this.idEstadoAspiranteInscripcion.valor) || this.areEqualsIdGuid(x.idEstadoAspirante, this.idEstadoAspiranteAproboPruebas.valor));
        this.lstPerfilConvocatoriaM2 = (await this.cs.getConvocatoriaPerfilByConvocatoria(pConvocatoria.value).toPromise() as any).datos as ConvocatoriaPerfil[];
        this.lstInscripcionesTableM2.forEach(x => {
          x.resumenHVModel = JSON.parse(x.resumenHV);
          if (x.resumenRecalificacionHV) {
            x.resumenRecalificacionHVModel = JSON.parse(x.resumenRecalificacionHV);
          }
          x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
          const cPerfil: ConvocatoriaPerfil = this.lstPerfilConvocatoriaM2.find(cp => cp.id === x.idConvocatoriaPerfil);
          if (cPerfil) {
            cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
            x.convocatoriaPerfilModel = cPerfil;
          }
        });
        this.dataSourceInscripcionM2.data = this.lstInscripcionesTableM2;
        this.selectionInscripcionM2 = new SelectionModel<InscripcionAspiranteModel>(true, this.lstInscripcionesTableSelectedM2);
      }

      // Carga las citaciones por convocatoria
      this.lstTable = this.lstCitacionAspirantesAll.filter(x => x.idConvocatoria === this.f.idConvocatoria.value);
    } else {
      this.lstTable = [];
    }
    this.dataSource.data = this.lstTable;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING);
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.form.reset();
    this.f.idConvocatoria.setValue(this.dataTemp.idConvocatoria);

    // Se cargan todas las convocatorias
    this.lstConvocatoriesAll = [];
    if (this.f.idEmpresa.value || this.idEmpresaT) {
      const val = this.f.idEmpresa.value ? this.f.idEmpresa.value : this.idEmpresaT;
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(val).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }
    this.lstConvocatories = [];
    this.lstConvocatories = this.lstConvocatoriesAll;

    // Cargar la lista con los lugares de pruebas
    this.lstLugarPruebasAll = (await this.cs.getTodosLugarPruebas().toPromise() as any).datos;
    if (this.lstLugarPruebasAll.length > 0) {
      this.lstLugarPruebasAll.forEach(async e => {
        if (e.idCiudad) {
          const ciudadPruebas: Ciudad = (await this.commonService.getCityById(e.idCiudad).toPromise() as any).datos;
          e.ciudad = ciudadPruebas.ciudad;
          e.lugarPrueba = e.aula + ' - ' + e.direccion + ' - ' + e.ciudad;
        }
      });
    }

    // Se cargan todas los tipos de pruebas
    this.lstPruebasAll = (await this.adminConvService.getTipoPruebas().toPromise() as any).datos;
    this.dataSourcePruebas.data = this.lstPruebasAll;
    this.lstPruebasSelectedTemp = [];
    this.selection = new SelectionModel<TipoPrueba>(true, this.lstPruebasSelectedTemp);

    //cargar el tipoModelo de la convocatoria
    this.modelo = this.convocatoryCurrent ? this.convocatoryCurrent.tipoModelo : 1;

    //cargar la variable de altas cortes
    this.varAltasCortes = (await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES));
    this.setJson(this.varAltasCortes);
    this.idEstadoAspirantePreseleccionado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_PRESELECCIONADO));

    if (this.modelo === Constants.MODELO_1) {

      // Se cargan los aspirantes admitidos
      this.lstAspirantesAdmitidosAll = (await this.cs.getAspiranteAdmitidos().toPromise() as any).datos;
      if (this.lstAspirantesAdmitidosAll.length > 0) {
        this.lstAspirantesAdmitidosAll = this.lstAspirantesAdmitidosAll.filter(x => x.aspiranteAdmitido === 1);

        this.lstAspirantesAdmitidosAll.forEach(async a => {

          const inscripcionAspirante: InscripcionAspiranteModel = (await this.commonService.getInscripcionAspiranteById(a.idInscripcionAspirante).toPromise() as any).datos[0];

          if (inscripcionAspirante) {
            const resumenHVModel = JSON.parse(inscripcionAspirante.resumenHV);
            inscripcionAspirante.resumenHVModel = resumenHVModel;
            a.inscripcionAspirante = inscripcionAspirante ? inscripcionAspirante : null;

            this.cs.getConvocatoriaPerfilById(inscripcionAspirante.idConvocatoriaPerfil)
              .subscribe(
                (res: any) => {
                  const cPerfil: ConvocatoriaPerfil = res.datos;
                  cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                  inscripcionAspirante.convocatoriaPerfilModel = cPerfil;
                }, err => {
                  console.log(err);
                }
              );
          }
        });
      }

      // Se cargan todas las citaciones de aspirantes
      this.lstCitacionAspirantesAll = (await this.cs.getTodosCitacionAspirante().toPromise() as any).datos;

      if (this.lstCitacionAspirantesAll.length > 0) {
        this.lstCitacionAspirantesAll.forEach(async e => {

          const inscripcionAspirante: InscripcionAspiranteModel = (await this.commonService.getInscripcionAspiranteById(e.idInscripcionAspirante).toPromise() as any).datos[0];
          if (inscripcionAspirante) {
            const resumenHVModel = JSON.parse(inscripcionAspirante.resumenHV);
            inscripcionAspirante.resumenHVModel = resumenHVModel;
            e.inscripcionAspiranteModel = inscripcionAspirante ? inscripcionAspirante : null;

            this.cs.getConvocatoriaPerfilById(inscripcionAspirante.idConvocatoriaPerfil)
              .subscribe(
                (res: any) => {
                  const cPerfil: ConvocatoriaPerfil = res.datos;
                  cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                  inscripcionAspirante.convocatoriaPerfilModel = cPerfil;
                }, err => {
                  console.log(err);
                }
              );
          }

          const convoTemp = this.lstConvocatoriesAll.find(c => c.id === e.idConvocatoria);
          e.nombreConvocatoria = convoTemp ? convoTemp.nombreConvocatoria : '';

          const lugarPruebaCon = this.lstLugarPruebasAll.find(x => x.id === e.idLugarPrueba && x.idConvocatoria === e.idConvocatoria);
          e.lugarPrueba = lugarPruebaCon ? lugarPruebaCon.ciudad + ' ' + lugarPruebaCon.direccion : '';
        });
      }

      if (this.dataTemp.idConvocatoria) {
        // Cargar el lugar de pruebas de la convocatoria seleccionada


        this.lstLugarPruebasByConvocatoria = this.lstLugarPruebasAll.filter(x => x.idConvocatoria === this.dataTemp.idConvocatoria);
        this.lstAspirantesAdmitidosByConvocatoria = [];
        this.lstAspirantesAdmitidosByConvocatoria = this.lstAspirantesAdmitidosAll.filter(a => a.idConvocatoria === this.dataTemp.idConvocatoria);
        this.dataSourceAspirantes.data = this.lstAspirantesAdmitidosByConvocatoria;
        this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);

        const convSelected = this.lstConvocatoriesAll.find(c => c.id === this.dataTemp.idConvocatoria);
        if (this.esAltasCortes(convSelected.idTipoLugar)) {
          const lstInscripcionTemp = (await this.commonService.getInscripcionesConvocatoria(this.dataTemp.idConvocatoria).toPromise() as any).datos as InscripcionAspiranteModel[];
          this.lstAspirantesAdmitidosByConvocatoria = this.lstAspirantesAdmitidosByConvocatoria.filter(x => {
            const insAsp = lstInscripcionTemp.find(z => z.id === x.idInscripcionAspirante);
            if (insAsp && this.areEqualsIdGuid(insAsp.idEstadoAspirante, this.idEstadoAspirantePreseleccionado.valor)) {
              return true;
            }
            return false;
          });
        }

        // Carga las citaciones por convocatoria
        this.lstTable = [];
        this.dataSource.data = this.lstTable;
      }


    } else if (this.modelo === Constants.MODELO_2) {

      //cargar variables necesesarias
      this.idEstadoAspiranteCitacion = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CITACION));
      this.idEstadoAspiranteInscripcion = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_INSCRITO));
      this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];

      // Se cargan las inscripciones
      if (this.f.idEmpresa && this.f.idEmpresa.value || this.idEmpresaT) {
        const val = this.f.idEmpresa.value ? this.f.idEmpresa.value : this.idEmpresaT;
        this.lstInscripcionesAllM2 = (await this.commonService.getInscripcionesEmpresa(val).toPromise() as any).datos as InscripcionAspiranteModel[];
      } else if (this.f.idConvocatoria && this.f.idConvocatoria.value) {
        this.lstInscripcionesAllM2 = (await this.commonService.getInscripcionesConvocatoria(this.f.idConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];
      }

      if (this.lstInscripcionesAllM2.length > 0) {
        this.lstInscripcionesAllM2 = this.lstInscripcionesAllM2.filter(x => this.areEqualsIdGuid(x.idEstadoAspirante, this.idEstadoAspiranteInscripcion.valor));

        this.lstInscripcionesAllM2.forEach(async inscripcionAspirante => {

          const resumenHVModel = JSON.parse(inscripcionAspirante.resumenHV);
          inscripcionAspirante.resumenHVModel = resumenHVModel;
          this.cs.getConvocatoriaPerfilById(inscripcionAspirante.idConvocatoriaPerfil)
            .subscribe(
              (res: any) => {
                const cPerfil: ConvocatoriaPerfil = res.datos;
                cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                inscripcionAspirante.convocatoriaPerfilModel = cPerfil;
              }, err => {
                console.log(err);
              }
            );
        });
      }

      // Se cargan todas las citaciones de aspirantes
      this.lstCitacionAspirantesAll = (await this.cs.getTodosCitacionAspirante().toPromise() as any).datos;

      if (this.lstCitacionAspirantesAll.length > 0) {
        this.lstCitacionAspirantesAll.forEach(async e => {

          const inscripcionAspirante: InscripcionAspiranteModel = (await this.commonService.getInscripcionAspiranteById(e.idInscripcionAspirante).toPromise() as any).datos[0];
          if (inscripcionAspirante) {
            const resumenHVModel = JSON.parse(inscripcionAspirante.resumenHV);
            inscripcionAspirante.resumenHVModel = resumenHVModel;
            e.inscripcionAspiranteModel = inscripcionAspirante ? inscripcionAspirante : null;

            this.cs.getConvocatoriaPerfilById(inscripcionAspirante.idConvocatoriaPerfil)
              .subscribe(
                (res: any) => {
                  const cPerfil: ConvocatoriaPerfil = res.datos;
                  cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                  inscripcionAspirante.convocatoriaPerfilModel = cPerfil;
                }, err => {
                  console.log(err);
                }
              );
          }

          const convoTemp = this.lstConvocatoriesAll.find(c => c.id === e.idConvocatoria);
          e.nombreConvocatoria = convoTemp ? convoTemp.nombreConvocatoria : '';

          const lugarPruebaCon = this.lstLugarPruebasAll.find(x => x.id === e.idLugarPrueba && x.idConvocatoria === e.idConvocatoria);
          e.lugarPrueba = lugarPruebaCon ? lugarPruebaCon.ciudad + ' ' + lugarPruebaCon.direccion : '';
        });
      }

      if (this.dataTemp.idConvocatoria) {
        // Cargar el lugar de pruebas de la convocatoria seleccionada
        this.lstLugarPruebasByConvocatoria = this.lstLugarPruebasAll.filter(x => x.idConvocatoria === this.dataTemp.idConvocatoria);
        this.lstInscripcionesTableM2 = [];
        this.lstInscripcionesTableM2 = this.lstInscripcionesAllM2.filter(a => a.idConvocatoria === this.dataTemp.idConvocatoria);
        this.dataSourceInscripcionM2.data = this.lstInscripcionesTableM2;
        this.selectionInscripcionM2 = new SelectionModel<InscripcionAspiranteModel>(true, this.lstInscripcionesTableSelectedM2);

        // Carga las citaciones por convocatoria
        this.lstTable = [];
        this.dataSource.data = this.lstTable;
      }
    }

  }
  /* public async loadFieldsByConvocatoria(event) {

    this.dataTemp.idConvocatoria = event.value;

    // limpiamos el formulario y seteamos el valor de la convocatoria seleccionada y el id de la empresa
    this.form.reset();
    this.f.idConvocatoria.setValue(this.dataTemp.idConvocatoria);

    // Carga la convocatoria seleccionada 
    this.convocatoryCurrent = (await this.cs.getConvocatoriaById(this.dataTemp.idConvocatoria).toPromise() as any).datos as Convocatoria;
    this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
    if (!this.f.idEmpresa.value) {
      this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
      this.f.idEmpresa.updateValueAndValidity();
    }

    // Cargar el lugar de pruebas de la convocatoria seleccionada
    this.lstLugarPruebasByConvocatoria = this.lstLugarPruebasAll.filter(x => x.idConvocatoria === this.dataTemp.idConvocatoria);

    // this.loadDataByConvocatoria(this.dataTemp.idConvocatoria);

    this.lstTable = this.lstCitacionAspirantesAll.filter(x => x.idConvocatoria === this.dataTemp.idConvocatoria);
    this.dataSource.data = this.lstTable;

    // Carga los aspirantes admitidos de la convocatoria seleccionada
    this.lstAspirantesAdmitidosByConvocatoria = this.lstAspirantesAdmitidosAll.filter(a => a.idConvocatoria === this.dataTemp.idConvocatoria);
    this.dataSourceAspirantes.data = this.lstAspirantesAdmitidosByConvocatoria;
    this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);
    this.selection = new SelectionModel<TipoPrueba>(true, this.lstPruebasSelectedTemp);
  } */

  public sortData(sort: Sort, value?: any) {
    let data = null;
    if (value === 1) {
      data = this.dataSourcePruebas.data;
      if (!sort.active || sort.direction === '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'tipoPrueba': return this.compare(a.tipoPrueba, b.tipoPrueba, isAsc);
          default: return 0;
        }
      });
    } else if (value === 2) {
      data = this.dataSourceAspirantes.data;
      if (!sort.active || sort.direction === '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'usuario': return this.compare(a.nombreCompletoUsuario, b.nombreCompletoUsuario, isAsc);
          case 'numeroDocumento': return this.compare(a.usuario.numeroDocumento, b.usuario.numeroDocumento, isAsc);
          case 'categoria': return this.compare(a.categoriaAdmitidos, b.categoriaAdmitidos, isAsc);
          case 'otraCategoria': return this.compare(a.otraCategoria, b.otraCategoria, isAsc);
          case 'observacion': return this.compare(a.observacion, b.observacion, isAsc);
          default: return 0;
        }
      });
    } else if (value === 3) {
      data = this.dataSource.data;
      if (!sort.active || sort.direction === '') {
        this.sortedData = data;
        return;
      }
      this.sortedData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
          case 'usuario': return this.compare(a.usuarioAspirante, b.usuarioAspirante, isAsc);
          case 'identificacionUsuario': return this.compare(a.numeroDocumento, b.numeroDocumento, isAsc);
          case 'lugarPrueba': return this.compare(a.lugarPrueba, b.lugarPrueba, isAsc);
          case 'fechaCitacion': return this.compare(a.fechaCitacion, b.fechaCitacion, isAsc);
          default: return 0;
        }
      });
    }
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        idEmpresa: new FormControl(''),
        id: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idLugarPrueba: new FormControl('', [Validators.required]),
        fechaPrueba: new FormControl(null, [Validators.required]),
        horaPrueba: new FormControl({ value: '', disabled: true }),
      }
    );

    this.f.fechaPrueba.valueChanges.subscribe(
      val => {
        if (val) {
          const datePipe = new DatePipe('es-CO');
          const hora = datePipe.transform(val, Constants.FORMAT_TIME_VIEW);
          this.f.horaPrueba.setValue(hora);
        } else {
          this.f.horaPrueba.setValue('');
        }
        this.f.horaPrueba.updateValueAndValidity();
      }
    );
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        ciudadPrueba: new FormControl({ value: '', disabled: true }),
        lugarPrueba: new FormControl({ value: '', disabled: true }),
        fechaPrueba: new FormControl({ value: '', disabled: true }),
        horaPrueba: new FormControl({ value: '', disabled: true }),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  public async edit(element: any) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.scrollTop();
    this.lstLugarPruebasByConvocatoria = this.lstLugarPruebasAll.filter(x => x.idConvocatoria === element.idConvocatoria);

    this.form.patchValue({
      id: element.id,
      idEmpresa: element.idEmpresa,
      idConvocatoria: element.idConvocatoria,
      idLugarPrueba: element.idLugarPrueba,
      fechaPrueba: element.fechaCitacion,
      horaPrueba: element.horaCitacion
    });
    this.f.idLugarPrueba.setValue(element.idLugarPrueba);
    this.f.fechaPrueba.updateValueAndValidity();

    this.dataSourcePruebas.data = this.lstPruebasAll;
    const lstTemp: TipoPrueba[] = JSON.parse(element.idTipoPrueba);
    this.lstPruebasSelectedTemp = [];
    this.lstPruebasAll.forEach(c => {
      const encontro = lstTemp.find(x => x.id === c.id);
      if (encontro) {
        this.lstPruebasSelectedTemp.push(c);
      }
    });
    this.selection = new SelectionModel<TipoPrueba>(true, this.lstPruebasSelectedTemp);

    this.loadDataByConvocatoria({ value: element.idConvocatoria }).then(() => {

      if (this.modelo === Constants.MODELO_1) {
        this.dataSourceAspirantes.data = this.lstAspirantesAdmitidosByConvocatoria;
        this.lstAspirantesSelectedTemp = [];
        const encontroAspirante = this.lstAspirantesAdmitidosByConvocatoria.find(a => a.idUsuario === element.idUsuarioAspirante);
        this.lstAspirantesSelectedTemp.push(encontroAspirante);
        this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);

      } else if (this.modelo === Constants.MODELO_2) {
        this.dataSourceInscripcionM2.data = this.lstInscripcionesTableM2;
        this.lstInscripcionesTableSelectedM2 = [];
        const encontroAspiranteM2 = this.lstInscripcionesTableM2.find(a => a.idUsuario === element.idUsuarioAspirante);
        this.lstInscripcionesTableSelectedM2.push(encontroAspiranteM2);
        this.selectionInscripcionM2 = new SelectionModel<InscripcionAspiranteModel>(true, this.lstInscripcionesTableSelectedM2);
      }
    });
  }

  public saveCitacionAspirante() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (!Constants.validateList(this.selection.selected)) {
      this.alertService.message(this.ct.MSG_LIST_TEST_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }

    if (!Constants.validateList(this.selectionAspirante.selected)) {
      this.alertService.message(this.ct.MSG_LIST_APPLICANT_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }
    this.alertService.loading();

    // const pruebasSelected = JSON.stringify(this.selection.selected);
    // const datePipe = new DatePipe('es-CO');
    // const fechaPruebaFormat = datePipe.transform(this.f.fechaPrueba.value, Constants.FORMAT_DATE_VIEW);

    this.alertService.comfirmation(this.ct.MSG_CITACION_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.selectionAspirante.selected.forEach(async a => {
            const newCitacion: CitacionAspiranteModel = {
              id: this.f.id.value ? this.f.id.value : undefined,
              idEmpresa: this.f.idEmpresa.value,
              idConvocatoria: this.f.idConvocatoria.value,
              idTipoPrueba: JSON.stringify(this.selection.selected),
              idLugarPrueba: this.f.idLugarPrueba.value,
              fechaCitacion: this.f.fechaPrueba.value,
              horaCitacion: this.f.horaPrueba.value,
              idUsuarioAspirante: a.idUsuario,
              idUsuarioAdmin: this.user.id,
              idInscripcionAspirante: a.inscripcionAspirante.id
            };

            await this.cs.saveCitacionAspirante(newCitacion).toPromise()
              .then(() => { })
              .catch(error => {
                console.log('err', error);
                this.alertService.showError(error);
              });

          });
          this.dataTemp.idConvocatoria = this.convocatoryCurrent.id;
          this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
          // this.loadFieldsByConvocatoria({ value: this.dataTemp.idConvocatoria })
          this.loadData()
            .then(() => {
              this.alertService.message(this.ct.MSG_SUCCESSFUL_CALL, TYPES.SUCCES)
                .finally(() => this.submit = false);
            });
        }
      });
  }

  public getCodCargoAspirante(element: AspiranteAdmintidoModel) {
    if (element && element.inscripcionAspirante && element.inscripcionAspirante.convocatoriaPerfilModel) {
      if (element.inscripcionAspirante.convocatoriaPerfilModel.perfil) {
        if (element.inscripcionAspirante.convocatoriaPerfilModel.perfil.idTipoCargo) {
          return element.inscripcionAspirante.convocatoriaPerfilModel.perfil.cargoModel.codAlterno;
        } else {
          return element.inscripcionAspirante.convocatoriaPerfilModel.perfil.cargoHumanoModel.codCargo;
        }
      }
    }
    return '';
  }

  public getCodCargoAspiranteCitacion(element: CitacionAspiranteModel) {
    if (element.inscripcionAspiranteModel.convocatoriaPerfilModel) {
      if (element.inscripcionAspiranteModel.convocatoriaPerfilModel.perfil) {
        if (element.inscripcionAspiranteModel.convocatoriaPerfilModel.perfil.idTipoCargo) {
          return element.inscripcionAspiranteModel.convocatoriaPerfilModel.perfil.cargoModel.codAlterno;
        } else {
          return element.inscripcionAspiranteModel.convocatoriaPerfilModel.perfil.cargoHumanoModel.codCargo;
        }
      }
    }
    return '';
  }

  public async showDetailCitacion(element: CitacionAspiranteModel) {
    const lugarPruebaCon = this.lstLugarPruebasAll.find(x => x.id === element.idLugarPrueba && x.idConvocatoria === element.idConvocatoria);
    element.ciudad = lugarPruebaCon ? lugarPruebaCon.ciudad : '';
    element.lugarPrueba = lugarPruebaCon ? lugarPruebaCon.direccion : '';

    const datePipe = new DatePipe('es-CO');
    const fechaPruebaFormat = datePipe.transform(element.fechaCitacion, Constants.FORMAT_DATE_VIEW);

    this.lstPruebasByCitacion = [];
    this.lstPruebasByCitacion = JSON.parse(element.idTipoPrueba);

    this.form2.patchValue({
      ciudadPrueba: element.ciudad,
      lugarPrueba: element.lugarPrueba,
      fechaPrueba: fechaPruebaFormat,
      horaPrueba: element.horaCitacion,
    });

    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public delete(element: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.cs.deleteCitacionAspirante(element.id)
            .subscribe(o => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
  }

  public generarReporte(idConv: string) {
    this.alertService.loading();
    this.submit = true;
    const ds = [];
    const paramsReport: any = {
      idConvocatoria: idConv,
      language: '',
      reportTitle: 'RptCitacionConvocatoria',
      reportType: 'Excel',
      rptFileName: 'RptCitacionConvocatoria.rdlc',
      exportExtension: 'EXCELOPENXML',
    };

    this.reporteService.getListadoCitacion(paramsReport)
      .toPromise()
      .then((resReporte: Blob) => {
        this.downloadBlob(resReporte, 'RptCitacionConvocatoria');
        this.alertService.close();
        this.submit = false;
      })
      .catch(erro => {
        this.alertService.showError(erro);
        this.submit = false;
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourcePruebas.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourcePruebas.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  isAllSelected2() {
    const numSelected = this.selectionAspirante.selected.length;
    const numRows = this.dataSourceAspirantes.data.length;
    return numSelected === numRows;
  }

  isAllSelectedM2() {
    const numSelected = this.selectionInscripcionM2.selected.length;
    const numRows = this.dataSourceInscripcionM2.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle2() {
    this.isAllSelected2() ?
      this.selectionAspirante.clear() :
      this.dataSourceAspirantes.data.forEach(row => this.selectionAspirante.select(row));
  }

  masterToggleM2() {
    this.isAllSelectedM2() ?
      this.selectionInscripcionM2.clear() :
      this.dataSourceInscripcionM2.data.forEach(row => this.selectionInscripcionM2.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel2(row?: any): string {
    if (!row) {
      return `${this.isAllSelected2() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAspirante.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkboxLabelM2(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedM2() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionInscripcionM2.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public cleanForm() {
    this.formV.resetForm();
    this.convocatoryCurrent = null;
    this.lstLugarPruebasByConvocatoria = [];
    this.dataSource.data = [];
    this.lstPruebasSelectedTemp = [];
    // this.dataSourcePruebas.data = [];
    this.lstAspirantesAdmitidosByConvocatoria = [];
    this.lstAspirantesSelectedTemp = [];
    this.lstInscripcionesTableSelectedM2 = [];
    this.dataSourceAspirantes.data = [];
    this.selectionAspirante.clear();
    this.selection.clear();
    this.submit = false;
    
  }

  public saveInscripciones() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (!Constants.validateList(this.selection.selected)) {
      this.alertService.message(this.ct.MSG_LIST_TEST_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }

    if (!Constants.validateList(this.selectionInscripcionM2.selected)) {
      this.alertService.message(this.ct.MSG_LIST_APPLICANT_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }
    this.alertService.loading();

    this.alertService.comfirmation(this.ct.MSG_CITACION_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();

          const lstRecordsInsHtpp: Observable<any>[] = [];
          const lstRecordsCitacionesHtpp: Observable<any>[] = [];

          this.selectionInscripcionM2.selected.forEach(a => {

            //crear el objeo a insertar
            const newCitacion: CitacionAspiranteModel = {
              id: this.f.id.value ? this.f.id.value : undefined,
              idEmpresa: this.f.idEmpresa.value,
              idConvocatoria: this.f.idConvocatoria.value,
              idTipoPrueba: JSON.stringify(this.selection.selected),
              idLugarPrueba: this.f.idLugarPrueba.value,
              fechaCitacion: this.f.fechaPrueba.value,
              horaCitacion: this.f.horaPrueba.value,
              idUsuarioAspirante: a.idUsuario,
              idUsuarioAdmin: this.user.id,
              idInscripcionAspirante: a.id
            };

            //guardar las citaciones
            lstRecordsCitacionesHtpp.push(this.cs.saveCitacionAspirante(newCitacion));

            // Actualizar estados inscritos en citacion
            // Primero valida si el aspirante está en estado 'Aprobó pruebas'. 
            // Si se encuentra en dicho estado, no lo cambia. De lo contrario, SI lo cambia
            if (a.idEstadoAspirante === this.idEstadoAspiranteAproboPruebas.valor) {
              a.idEstadoAspirante = this.idEstadoAspiranteAproboPruebas.valor;
            } else {
              a.idEstadoAspirante = this.idEstadoAspiranteCitacion.valor;
            }
            lstRecordsInsHtpp.push(this.commonService.actualizarEstadoInscripcionAspirante(a.id, this.user.id, a.idEstadoAspirante));
          });

          //enviar los request de citaciones
          forkJoin(lstRecordsCitacionesHtpp)
            .subscribe({
              next: (res: any) => {
                //enviar los request de inscripcion
                forkJoin(lstRecordsInsHtpp)
                  .subscribe({
                    next: (res2: any) => {
                      this.dataTemp.idConvocatoria = this.convocatoryCurrent.id;
                      this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
                      // this.loadFieldsByConvocatoria({ value: this.dataTemp.idConvocatoria })
                      this.loadData()
                        .then(() => {
                          this.alertService.message(this.ct.MSG_SUCCESSFUL_CALL, TYPES.SUCCES)
                            .finally(() => this.submit = false);
                        });
                    },
                    error: (error2) => this.alertService.showError(error2)
                  });
              },
              error: (error2) => this.alertService.showError(error2)
            });
        }
      });
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
}
