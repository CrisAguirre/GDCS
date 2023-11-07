import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialog, MatDialogRef } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, stateConvocatoria, PermisosAcciones } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { ResultadoPruebasModel } from '@app/compartido/modelos/resultado-pruebas-model';
import { Configuration } from '@app/compartido/modelos/configuration';

@Component({
  selector: 'app-resultados-pruebas',
  templateUrl: './resultados-pruebas.component.html',
  styleUrls: ['./resultados-pruebas.component.scss']
})
export class ResultadosPruebasComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstResultadoPruebasByAspirante: ResultadoPruebasModel[] = [];
  // public lstTable: ResultadoPruebasModel[] = [];
  public lstCompanies: Empresa[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstPruebasAll: TipoPrueba[] = [];
  public lstPruebasByConvocatoria: TipoPrueba[] = [];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstInscripcionAspiranteByConvocatoria: InscripcionAspiranteModel[] = [];
  public estadoConvocatoria: string;

  public activeOptionsButton = false;
  public idEstadoAspiranteAdmitido: Configuration = null;
  public idEstadoAspiranteInscrito: Configuration = null;
  public idEstadoAspiranteAproboPruebas: Configuration = null;
  public idEstadoAspiranteNoAproboPruebas: Configuration = null;
  public idEstadoAspiranteCitacion: Configuration = null;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public aspiranteCurrent: any = {};
  public convocatoryCurrent: Convocatoria = null;
  public form: FormGroup;
  public form2: FormGroup;
  public idEmpresaT = null;
  public showSelectCompany = false;
  public submit = false;
  public dataConvocatory: Convocatoria;
  private dataTemp = {
    idConvocatoria: null,
    convocatoriaSeleccionada: null
  };

  public identificacion: FormControl = new FormControl({ value: '', disabled: true });
  public nombreAspirante: FormControl = new FormControl({ value: '', disabled: true });
  public cargoAspirante: FormControl = new FormControl({ value: '', disabled: true });

  public displayedColumnsAspirantes: string[] = ['identificacion', 'nombreAspirante', 'cargoAspirante', 'gradoCargo', 'estadoAspirante', 'ingresarResultado', 'verResultados'];
  public displayedColumns: string[] = ['tipoPrueba', 'resultado', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public dataSourceAspirantes = new MatTableDataSource<any>();
  public sortedData: any;

  private modelo: number = 0;

  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('matPaginator1', { static: true }) paginator1: MatPaginator;
  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('matSort1', { static: true }) sort1: MatSort;
  @ViewChild('matSort2', { static: true }) sort2: MatSort;

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
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {

    this.dataSource.paginator = this.paginator1;
    this.dataSource.sort = this.sort1;

    this.dataSourceAspirantes.paginator = this.paginator2;
    this.dataSourceAspirantes.sort = this.sort2;

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

    this.dataSourceAspirantes.filterPredicate = (data: InscripcionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.getNumeroDocumento(data),
        this.getNameAspirante(data),
        this.getCargoAspirante(data),
        this.getGradoCargo(data),
      ];
      return C.filterTable(dataCompare, filter);
    };

    this.dataSource.filterPredicate = (data: ResultadoPruebasModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        data.tipoPrueba,
        data.resultadoFinal
      ];
      return C.filterTable(dataCompare, filter);
    };
  }

  public sortData(sort: Sort) {
    const data = this.dataSourceAspirantes.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'identificacion': return this.compare(this.getNumeroDocumento(a), this.getNumeroDocumento(b), isAsc);
        case 'nombreAspirante': return this.compare(this.getNameAspirante(a), this.getNameAspirante(b), isAsc);
        case 'cargoAspirante': return this.compare(this.getCargoAspirante(a), this.getCargoAspirante(b), isAsc);
        case 'gradoCargo': return this.compare(this.getGradoCargo(a), this.getGradoCargo(b), isAsc);
        case 'estadoAspirante': return this.compare(a.estadoAspiranteModel['nombreCategoria' + this.lang], a.estadoAspiranteModel['nombreCategoria' + this.lang], isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idEmpresa: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idTipoPrueba: new FormControl('', [Validators.required]),
        resultadoFinal: new FormControl('', [Validators.required]),

        // Nuevos campos
        numRegistro: new FormControl(''),
        puntajeDirecto: new FormControl(''),
        media: new FormControl(''),
        desviacion: new FormControl(''),
        z: new FormControl(''),
        mayor_0_5: new FormControl(''),
        apruebaMayor_0_5: new FormControl(''),
        mayor_1: new FormControl(''),
        apruebaMayor_1: new FormControl(''),
        mayor_1_5: new FormControl(''),
        apruebaMayor_1_5: new FormControl(''),
        mayor_2: new FormControl(''),
        apruebaMayor_2: new FormControl('')
      }
    );

    this.listenerControls(false);
  }

  get f() {
    return this.form.controls;
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        id: new FormControl({ value: '', disabled: true }),
        idEmpresa: new FormControl({ value: '', disabled: true }),
        idConvocatoria: new FormControl({ value: '', disabled: true }),
        idTipoPrueba: new FormControl({ value: '', disabled: true }),
        resultadoFinal: new FormControl({ value: '', disabled: true }),
        numRegistro: new FormControl({ value: '', disabled: true }),
        puntajeDirecto: new FormControl({ value: '', disabled: true }),
        media: new FormControl({ value: '', disabled: true }),
        desviacion: new FormControl({ value: '', disabled: true }),
        z: new FormControl({ value: '', disabled: true }),
        mayor_0_5: new FormControl({ value: '', disabled: true }),
        apruebaMayor_0_5: new FormControl({ value: '', disabled: true }),
        mayor_1: new FormControl({ value: '', disabled: true }),
        apruebaMayor_1: new FormControl({ value: '', disabled: true }),
        mayor_1_5: new FormControl({ value: '', disabled: true }),
        apruebaMayor_1_5: new FormControl({ value: '', disabled: true }),
        mayor_2: new FormControl({ value: '', disabled: true }),
        apruebaMayor_2: new FormControl({ value: '', disabled: true })
      }
    );

    this.listenerControls(false);
  }

  get f2() {
    return this.form2.controls;
  }

  public listenerControls(value: boolean) {
    if (this.aspiranteCurrent.id && value) {
      this.f.idTipoPrueba.enable();
      this.f.idTipoPrueba.setValidators([Validators.required]);

      this.f.resultadoFinal.enable();
      this.f.resultadoFinal.setValidators([Validators.required]);

      this.f.numRegistro.enable();
      this.f.puntajeDirecto.enable();
      this.f.media.enable();
      this.f.desviacion.enable();
      this.f.z.enable();
      this.f.mayor_0_5.enable();
      this.f.apruebaMayor_0_5.enable();
      this.f.mayor_1.enable();
      this.f.apruebaMayor_1.enable();
      this.f.mayor_1_5.enable();
      this.f.apruebaMayor_1_5.enable();
      this.f.mayor_2.enable();
      this.f.apruebaMayor_2.enable();
    } else {
      this.f.idTipoPrueba.disable();
      this.f.resultadoFinal.disable();

      this.f.numRegistro.disable();
      this.f.puntajeDirecto.disable();
      this.f.media.disable();
      this.f.desviacion.disable();
      this.f.z.disable();
      this.f.mayor_0_5.disable();
      this.f.apruebaMayor_0_5.disable();
      this.f.mayor_1.disable();
      this.f.apruebaMayor_1.disable();
      this.f.mayor_1_5.disable();
      this.f.apruebaMayor_1_5.disable();
      this.f.mayor_2.disable();
      this.f.apruebaMayor_2.disable();

      this.submit = false;
    }

    this.f.idTipoPrueba.updateValueAndValidity();
    this.f.resultadoFinal.updateValueAndValidity();

    this.f.numRegistro.updateValueAndValidity();
    this.f.puntajeDirecto.updateValueAndValidity();
    this.f.media.updateValueAndValidity();
    this.f.desviacion.updateValueAndValidity();
    this.f.z.updateValueAndValidity();
    this.f.mayor_0_5.updateValueAndValidity();
    this.f.apruebaMayor_0_5.updateValueAndValidity();
    this.f.mayor_1.updateValueAndValidity();
    this.f.apruebaMayor_1.updateValueAndValidity();
    this.f.mayor_1_5.updateValueAndValidity();
    this.f.apruebaMayor_1_5.updateValueAndValidity();
    this.f.mayor_2.updateValueAndValidity();
    this.f.apruebaMayor_2.updateValueAndValidity();
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
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstConvocatories = this.lstConvocatoriesAll;
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.cleanFormResult();
    this.aspiranteCurrent = {};
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.cargoAspirante.setValue('');
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.cargoAspirante.updateValueAndValidity();

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);
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
      // Carga la información de la convocatoria seleccionada
      this.convocatoryCurrent = (await this.cs.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;

      this.lstPruebasByConvocatoria = (await this.cs.getPruebasByConvocatoria(pConvocatoria.value).toPromise() as any).datos;

      this.dataTemp.idConvocatoria = pConvocatoria.value;
      this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }

      this.lstInscripcionAspiranteByConvocatoria = [];
      this.lstInscripcionAspiranteByConvocatoria = (await this.commonService.getInscripcionesConvocatoria(pConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];

      // this.lstInscripcionAspiranteByConvocatoria = this.lstInscripcionAspiranteByConvocatoria.filter(a => a.idEstadoAspirante === estadoAspirante.valor);
      this.lstInscripcionAspiranteByConvocatoria.forEach(x => {
        x.resumenHVModel = JSON.parse(x.resumenHV);
        x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
        this.cs.getConvocatoriaPerfilById(x.idConvocatoriaPerfil)
          .subscribe(
            (res: any) => {
              const cPerfil: ConvocatoriaPerfil = res.datos;
              cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
              x.convocatoriaPerfilModel = cPerfil;
            }, err => {
              console.log(err);
            }
          );

        if (x.idEstadoAspirante === this.idEstadoAspiranteAdmitido.valor) {
          x.orden = 1;
        } else {
          x.orden = 0;
        }
      });

      this.lstInscripcionAspiranteByConvocatoria.sort((a, b) => b.orden - a.orden);


      //cargar el modelo de proceso
      this.modelo = this.convocatoryCurrent.tipoModelo;

      //filtros para el modelo segun la convocatoria
      if (this.modelo === Constants.MODELO_1) {
        //filtro por estado admitidos o que tengan resultados
        this.lstInscripcionAspiranteByConvocatoria.filter(ins => {
          this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteAdmitido.valor) ||
            this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteAproboPruebas.valor) ||
            this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteNoAproboPruebas.valor)
        });
      } else if (this.modelo === Constants.MODELO_2) {
        //filtro por estado citacion o que tengan resultados
        this.lstInscripcionAspiranteByConvocatoria.filter(ins => {
          this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteCitacion.valor) ||
            this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteAproboPruebas.valor) ||
            this.areEqualsIdGuid(ins.idEstadoAspirante, this.idEstadoAspiranteNoAproboPruebas.valor)
        });
      }


    } else {
      this.lstInscripcionAspiranteByConvocatoria = [];
    }
    this.dataSource.data = [];
    this.dataSourceAspirantes.data = this.lstInscripcionAspiranteByConvocatoria;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    // Se cargan todas las convocatorias
    this.lstConvocatoriesAll = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }
    this.lstConvocatories = this.lstConvocatoriesAll;

    // Se cargan todas los tipos de pruebas
    this.lstPruebasAll = (await this.adminConvService.getTipoPruebas().toPromise() as any).datos;

    // Carga los estados del aspirante
    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];

    // Cargar el estado aspirante admitido
    this.idEstadoAspiranteAdmitido = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ADMITIDO);
    this.idEstadoAspiranteInscrito = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_INSCRITO);
    this.idEstadoAspiranteAproboPruebas = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_PRUEBAS);
    this.idEstadoAspiranteNoAproboPruebas = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_APROBO_PRUEBAS);
    this.idEstadoAspiranteCitacion = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_CITACION);



    this.dataSourceAspirantes.data = [];
  }

  public async loadResultadoPruebas(element: InscripcionAspiranteModel, value: boolean) {
    this.cleanFormResult();
    this.aspiranteCurrent = C.cloneObject(element);

    this.identificacion.setValue(this.getNumeroDocumento(element));
    this.nombreAspirante.setValue(this.getNameAspirante(element));
    this.cargoAspirante.setValue(this.getCargoAspirante(element));

    this.listenerControls(value);
    this.activeOptionsButton = value ? true : false;

    let cargoTemp = '';
    cargoTemp = element.convocatoriaPerfilModel.perfil.cargoHumanoModel ? element.convocatoriaPerfilModel.perfil.cargoHumanoModel.cargo : element.convocatoriaPerfilModel.perfil.cargoModel.cargo;
    this.lstResultadoPruebasByAspirante = [];
    this.lstResultadoPruebasByAspirante = (await this.cs.getResultadoByUsuarioCargo(element.idUsuario, element.idConvocatoriaPerfil, element.idConvocatoria).toPromise() as any).datos as ResultadoPruebasModel[];
    if (this.lstResultadoPruebasByAspirante.length > 0) {
      this.lstResultadoPruebasByAspirante.forEach(async r => {
        r.convocatoria = this.convocatoryCurrent.nombreConvocatoria;
      });
    }

    this.dataSource.data = this.lstResultadoPruebasByAspirante;
  }

  public editResultadoPruebas(element: any) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      idConvocatoria: element.idConvocatoria,
      idTipoPrueba: element.idTipoPrueba,
      resultadoFinal: element.resultadoFinal,
      /* pruebaActitud: element.pruebaActitud,
      pruebaConocimientos: element.pruebaConocimientos,
      pruebaConocimientosEsp: element.pruebaConocimientosEsp, */
      numRegistro: element.numeroRegistro,
      puntajeDirecto: element.puntajeDirecto,
      media: element.media,
      desviacion: element.desviacion,
      z: element.z,
      mayor_0_5: element.mayor_0_5,
      apruebaMayor_0_5: element.aprueba_Mayor_0_5,
      mayor_1: element.mayor_1,
      apruebaMayor_1: element.aprueba_Mayor_1,
      mayor_1_5: element.mayor_1_5,
      apruebaMayor_1_5: element.aprueba_Mayor_1_5,
      mayor_2: element.mayor_2,
      apruebaMayor_2: element.aprueba_Mayor_2,
    });

    if (this.lstPruebasAll.length > 0) {
      const prueba = this.lstPruebasAll.find(e => e.id === element.idTipoPrueba);
      if (prueba) {
        this.f.idTipoPrueba.setValue(prueba.id);
      }
    }
  }

  public saveResultadosPruebas() {
    if (this.aspiranteCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.aspiranteCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    // validar el formulario
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (this.aspiranteCurrent.id) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    // validar que  no se encuentre repetido el resultado y la prueba
    // const tipoPruebaSelect: TipoPrueba = this.f.idTipoPrueba.value;
    const tipoPruebaTemp: TipoPrueba = this.lstPruebasAll.find(c => c.id === this.f.idTipoPrueba.value);
    const objTemp = this.lstResultadoPruebasByAspirante.find(e => e.tipoPrueba === tipoPruebaTemp.tipoPrueba);
    if (objTemp) {
      if ((this.f.id && objTemp.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    let cargoTemp = '';
    cargoTemp = this.aspiranteCurrent.convocatoriaPerfilModel.perfil.cargoHumanoModel ? this.aspiranteCurrent.convocatoriaPerfilModel.perfil.cargoHumanoModel.cargo : this.aspiranteCurrent.convocatoriaPerfilModel.perfil.cargoModel.cargo;
    const newResultadoPruebas: ResultadoPruebasModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idConvocatoria: this.f.idConvocatoria.value,
      idTipoPrueba: this.f.idTipoPrueba.value,
      cargo: cargoTemp,
      idUsuarioAspirante: this.aspiranteCurrent.idUsuario,
      idUsuarioModificacion: this.user.id,
      idConvocatoriaPerfil: this.aspiranteCurrent.idConvocatoriaPerfil,
      resultadoFinal: Number(this.f.resultadoFinal.value),
      idInscripcionAspirante: this.aspiranteCurrent.id,
      numeroRegistro: this.f.numRegistro.value,
      puntajeDirecto: Number(this.f.puntajeDirecto.value),
      media: Number(this.f.media.value),
      desviacion: Number(this.f.desviacion.value),
      z: Number(this.f.z.value),
      mayor_0_5: Number(this.f.mayor_0_5.value),
      aprueba_Mayor_0_5: Number(this.f.apruebaMayor_0_5.value),
      mayor_1: Number(this.f.mayor_1.value),
      aprueba_Mayor_1: Number(this.f.apruebaMayor_1.value),
      mayor_1_5: Number(this.f.mayor_1_5.value),
      aprueba_Mayor_1_5: Number(this.f.apruebaMayor_1_5.value),
      mayor_2: Number(this.f.mayor_2.value),
      aprueba_Mayor_2: Number(this.f.apruebaMayor_2.value)
    };

    this.cs.saveResultadoPruebas(newResultadoPruebas)
      .subscribe(
        r => {
          this.loadResultadoPruebas(this.aspiranteCurrent, true)
            // this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value })
            .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => {
                this.submit = false;
                this.cleanFormResult();
              })
            );
        }, err => {
          this.alertService.showError(err);
          this.submit = false;
        }
      );
  }

  public deleteResultadoPruebas(element: ResultadoPruebasModel) {
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
          this.cs.deleteResultadoPruebas(element.id)
            .subscribe(o => {
              this.loadResultadoPruebas(this.aspiranteCurrent, true)
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  this.cleanFormResult();
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
  }

  public showDetailResult(element: any) {
    this.elementCurrent = C.cloneObject(element);
    this.form2.patchValue({
      id: element.id,
      idConvocatoria: element.idConvocatoria,
      idTipoPrueba: element.idTipoPrueba,
      resultadoFinal: element.resultadoFinal,
      numRegistro: element.numeroRegistro,
      puntajeDirecto: element.puntajeDirecto,
      media: element.media,
      desviacion: element.desviacion,
      z: element.z,
      mayor_0_5: element.mayor_0_5,
      apruebaMayor_0_5: element.aprueba_Mayor_0_5,
      mayor_1: element.mayor_1,
      apruebaMayor_1: element.aprueba_Mayor_1,
      mayor_1_5: element.mayor_1_5,
      apruebaMayor_1_5: element.aprueba_Mayor_1_5,
      mayor_2: element.mayor_2,
      apruebaMayor_2: element.aprueba_Mayor_2,
    });

    if (this.lstPruebasAll.length > 0) {
      const prueba = this.lstPruebasAll.find(e => e.id === element.idTipoPrueba);
      if (prueba) {
        this.f.idTipoPrueba.setValue(prueba.id);
      }
    }


    this.dialogRefInfo = this.dialogService.open(this.dialogInfo, {
      maxWidth: '90%',
      height: '80%',
    });
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.elementCurrent = {};
    this.dialogRefInfo.close();
  }

  public getNumeroDocumento(element: InscripcionAspiranteModel) {
    if (element.resumenHVModel) {
      if (element.resumenHVModel.datosPersonales) {
        return element.resumenHVModel.datosPersonales.numeroDocumento;
      }
    }
    return '';
  }

  public getNameAspirante(element: InscripcionAspiranteModel) {
    const nombreAspirante = [
      element.resumenHVModel.datosPersonales.primerNombre,
      element.resumenHVModel.datosPersonales.segundoNombre,
      element.resumenHVModel.datosPersonales.primerApellido,
      element.resumenHVModel.datosPersonales.segundoApellido,
    ].join(' ');
    return nombreAspirante;
  }

  public getCargoAspirante(element: InscripcionAspiranteModel) {
    if (element.convocatoriaPerfilModel) {
      if (element.convocatoriaPerfilModel.perfil) {
        if (element.convocatoriaPerfilModel.perfil.idTipoCargo) {
          return this.translateField(element.convocatoriaPerfilModel.perfil.cargoModel, 'cargo', this.lang);
        } else {
          return element.convocatoriaPerfilModel.perfil.cargoHumanoModel.cargo;
        }
      }
    }
    return '';
  }

  public getGradoCargo(element: InscripcionAspiranteModel) {
    if (element.convocatoriaPerfilModel) {
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

  public validateNumber(e: any) {
    const input = String.fromCharCode(e.charCode);
    /* const reg = /^\d*(?:[.,]\d{1,2})?$/;
    const reg2 = /^[0-9]+(.[0-9]{0,2})?$/;
    const reg3 = /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/;
    const reg4 = /^\d+[.,]?\d{0,2}$/g; */
    const regExpString = /^[0-9]*\.?[0-9]*$/g;

    if (!regExpString.test(input)) {
      e.preventDefault();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.convocatoryCurrent = null;
    this.aspiranteCurrent.id = undefined;
    this.dataSource.data = [];
    this.dataSourceAspirantes.data = [];
    this.submit = false;
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.cargoAspirante.setValue('');
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.cargoAspirante.updateValueAndValidity();
    this.activeOptionsButton = false;
    this.listenerControls(false);

  }

  public cleanFormResult() {
    this.f.id.setValue(undefined);
    this.f.idTipoPrueba.setValue('');
    this.f.resultadoFinal.setValue('');
    this.f.numRegistro.setValue('');
    this.f.puntajeDirecto.setValue('');
    this.f.media.setValue('');
    this.f.desviacion.setValue('');
    this.f.z.setValue('');
    this.f.mayor_0_5.setValue('');
    this.f.apruebaMayor_0_5.setValue('');
    this.f.mayor_1.setValue('');
    this.f.apruebaMayor_1.setValue('');
    this.f.mayor_1_5.setValue('');
    this.f.apruebaMayor_1_5.setValue('');
    this.f.mayor_2.setValue('');
    this.f.apruebaMayor_2.setValue('');

    this.f.id.updateValueAndValidity();
    this.f.idTipoPrueba.updateValueAndValidity();
    this.f.resultadoFinal.updateValueAndValidity();
    this.f.numRegistro.updateValueAndValidity();
    this.f.puntajeDirecto.updateValueAndValidity();
    this.f.media.updateValueAndValidity();
    this.f.desviacion.updateValueAndValidity();
    this.f.z.updateValueAndValidity();
    this.f.mayor_0_5.updateValueAndValidity();
    this.f.apruebaMayor_0_5.updateValueAndValidity();
    this.f.mayor_1.updateValueAndValidity();
    this.f.apruebaMayor_1.updateValueAndValidity();
    this.f.mayor_1_5.updateValueAndValidity();
    this.f.apruebaMayor_1_5.updateValueAndValidity();
    this.f.mayor_2.updateValueAndValidity();
    this.f.apruebaMayor_2.updateValueAndValidity();
  }

  public verifyActions(element: InscripcionAspiranteModel) {
    let btnStates = {
      btnAddResult: false,
    }

    //si es tipo modelo 1 y el estado es admitido
    if (this.modelo == Constants.MODELO_1) {
      if (element.idEstadoAspirante === this.idEstadoAspiranteAdmitido.valor) {
        btnStates.btnAddResult = true;
      } else {
        btnStates.btnAddResult = false;
      }
    } else if (this.modelo == Constants.MODELO_2) {
      //si es tipo modelo 2 y el estado es citacion
      if (element.idEstadoAspirante === this.idEstadoAspiranteCitacion.valor) {
        btnStates.btnAddResult = true;
      } else {
        btnStates.btnAddResult = false;
      }
    }

    return btnStates;
  }

}
