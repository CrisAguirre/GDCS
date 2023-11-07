import { ResultadosCursoFormacionModel } from '@app/compartido/modelos/resultados-curso-formacion-model';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria, PermisosAcciones } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { DataPersonal } from '@app/compartido/modelos/data-personal';

@Component({
  selector: 'app-resultados-curso-formacion',
  templateUrl: './resultados-curso-formacion.component.html',
  styleUrls: ['./resultados-curso-formacion.component.scss']
})
export class ResultadosCursoFormacionComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstInscripcionAspiranteByConvocatoria: InscripcionAspiranteModel[] = [];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstEstadosCursoFormacion = [];
  public estadoConvocatoria: string;

  public lstTable: ResultadosCursoFormacionModel[] = [];
  public lstResultadoCursoFormacionAll: ResultadosCursoFormacionModel[] = [];
  public lstResultadoCursoFormacionByConvocatoria: ResultadosCursoFormacionModel[] = [];

  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public aspiranteCurrent: InscripcionAspiranteModel;
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

  public showRegionAprueba = false;
  public showRegionReprueba = false;
  public showRegionHomologado = false;
  public showRegionPierdeXInasistencia = false;
  public showRegionRetiroVoluntario = false;

  public idEmpresa: FormControl = new FormControl('');
  public idConvocatoria: FormControl = new FormControl('', [Validators.required]);
  public identificacion: FormControl = new FormControl({ value: '', disabled: true });
  public nombreAspirante: FormControl = new FormControl({ value: '', disabled: true });

  public displayedColumnsAspirantes: string[] = ['identificacion', 'nombreAspirante', 'cargoAspirante', 'gradoCargo', 'estadoAspirante', 'options'];
  public displayedColumns: string[] = ['identificacion', 'nombreAspirante', 'resultadoCurso', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public dataSourceAspirantes = new MatTableDataSource<any>();
  public sortedData: any;

  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('matPaginator1', { static: true }) paginator1: MatPaginator;
  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('matSort1', { static: true }) sort1: MatSort;
  @ViewChild('matSort2', { static: true }) sort2: MatSort;

  constructor(
    // private adminConvService: AdministracionConvocatoriaService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cvService: CurriculumVitaeService,
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
    this.lstEstadosCursoFormacion = this.ct.lstEstadosCursoFormacion();
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
      return Constants.filterTable(dataCompare, filter);
    };

    this.dataSource.filterPredicate = (data: ResultadosCursoFormacionModel, filter: string): boolean => {
      const dataCompare = [
        this.getNombreAspiranteResultadoCF(data),
        this.getResultadoFinalCFAspirante(data)
      ];
      return Constants.filterTable(dataCompare, filter);
    };
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        fechaResolucion: new FormControl(''),
        resolucion: new FormControl(''),
        totalCFJI_100: new FormControl(''),
        resultadoCursoFormacion: new FormControl({ value: '', disabled: true }, [Validators.required]),
        notaConsolidadaHomologacion: new FormControl(''),
      }
    );

    this.changeForm();
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
        fechaResolucion: new FormControl({ value: '', disabled: true }),
        resolucion: new FormControl({ value: '', disabled: true }),
        totalCFJI_100: new FormControl({ value: '', disabled: true }),
        resultadoCursoFormacion: new FormControl({ value: '', disabled: true }),
        notaConsolidadaHomologacion: new FormControl({ value: '', disabled: true }),
      }
    );
  }

  get f2() {
    return this.form2.controls;
  }

  public listenerControls() {
    if (this.aspiranteCurrent) {
      this.f.resultadoCursoFormacion.enable();
      this.f.resultadoCursoFormacion.setValidators([Validators.required]);
      this.changeForm();
    } else {
      this.f.resultadoCursoFormacion.disable();
      this.showRegionAprueba = false;
      this.showRegionReprueba = false;
      this.showRegionHomologado = false;
      this.showRegionPierdeXInasistencia = false;
      this.showRegionRetiroVoluntario = false;
    }
    this.f.resultadoCursoFormacion.updateValueAndValidity();
  }

  public changeForm() {
    this.f.resultadoCursoFormacion.valueChanges.subscribe(
      value => {
        this.form.clearValidators();
        this.idConvocatoria.setValidators([Validators.required]);
        this.showRegionAprueba = false;
        this.showRegionReprueba = false;
        this.showRegionHomologado = false;
        this.showRegionPierdeXInasistencia = false;
        this.showRegionRetiroVoluntario = false;

        if (value === 1) { // Aprueba
          this.showRegionAprueba = true;
          this.clearAndSetValidatorRequired(true, [this.f.resolucion, this.f.fechaResolucion, this.f.totalCFJI_100]);
          this.clearAndSetValidatorRequired(false, [this.f.notaConsolidadaHomologacion]);

        } else if (value === 2) { // Pierde por inasistencia
          this.showRegionPierdeXInasistencia = true;
          this.clearAndSetValidatorRequired(true, [this.f.resolucion, this.f.fechaResolucion]);
          this.clearAndSetValidatorRequired(false, [this.f.totalCFJI_100, this.f.notaConsolidadaHomologacion]);

        } else if (value === 3) { // Pierde por nota
          this.showRegionReprueba = true;
          this.clearAndSetValidatorRequired(true, [this.f.resolucion, this.f.fechaResolucion, this.f.totalCFJI_100]);
          this.clearAndSetValidatorRequired(false, [this.f.notaConsolidadaHomologacion]);

        } else if (value === 4) { // Homologado
          this.showRegionHomologado = true;
          this.clearAndSetValidatorRequired(true, [this.f.resolucion, this.f.fechaResolucion, this.f.notaConsolidadaHomologacion]);
          this.clearAndSetValidatorRequired(false, [this.f.totalCFJI_100]);

        } else if (value === 5) { // Retiro voluntario
          this.showRegionRetiroVoluntario = true;
          this.clearAndSetValidatorRequired(true, [this.f.resolucion, this.f.fechaResolucion]);
          this.clearAndSetValidatorRequired(false, [this.f.totalCFJI_100, this.f.notaConsolidadaHomologacion]);
        } else if (value === 6) { // No inscrito al curso de formación
          this.clearAndSetValidatorRequired(false, [this.f.resolucion, this.f.fechaResolucion, this.f.totalCFJI_100, this.f.notaConsolidadaHomologacion]);
        }
      }
    );
  }

  public clearAndSetValidatorRequired(validator: boolean, controls: AbstractControl[], emmitEvent?: boolean) {
    if (validator) {
      controls.forEach(x => {
        x.setValidators([Validators.required]);
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.setValidators([]);
        x.setValue(null, { emitEvent: emmitEvent });
        x.updateValueAndValidity();
      });
    }
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
      this.idEmpresa.setValue(this.user.idEmpresa);
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

    //#region Convocatoria
    // this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.idConvocatoria.value);
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

      this.dataTemp.idConvocatoria = pConvocatoria.value;
      this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
      // if (!this.f.idEmpresa.value) {
      if (!this.idEmpresa.value) {
        // this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        this.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        // this.f.idEmpresa.updateValueAndValidity();
        this.idEmpresa.updateValueAndValidity();
      }

      // Carga los aspirantes inscritos
      const estadoAproboPruebas = await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_PRUEBAS);
      // const estadoAspirante: EstadoAspiranteComvocatoria = this.lstEstadosAspiranteAll.find(e => e.nombreCategoria === 'Admitido');

      this.lstInscripcionAspiranteByConvocatoria = [];
      this.lstInscripcionAspiranteByConvocatoria = (await this.commonService.getInscripcionesConvocatoria(pConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];
      this.lstInscripcionAspiranteByConvocatoria = this.lstInscripcionAspiranteByConvocatoria.filter(a => a.idEstadoAspirante === estadoAproboPruebas.valor);
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
      });

      // Carga los resultados por convocatoria
      this.lstTable = [];
      // this.lstTable = this.filterResultadosByConvocatoria();
      this.lstResultadoCursoFormacionByConvocatoria = [];
      this.lstResultadoCursoFormacionByConvocatoria = (await this.cs.getResultadoCursoFormacionByConvocatoria(pConvocatoria.value).toPromise() as any).datos;

      this.lstTable = this.lstResultadoCursoFormacionByConvocatoria;

    } else {
      this.lstInscripcionAspiranteByConvocatoria = [];
      this.lstTable = [];
    }
    this.dataSourceAspirantes.data = this.lstInscripcionAspiranteByConvocatoria;
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

    // Se cargan todas las convocatorias
    this.lstConvocatoriesAll = [];
    if (this.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }
    this.lstConvocatories = this.lstConvocatoriesAll;

    // Carga los estados del aspirante
    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];

    this.lstResultadoCursoFormacionByConvocatoria = [];
    this.lstResultadoCursoFormacionAll = (await this.cs.getTodosResultadoCursoFormacion().toPromise() as any).datos;
    if (this.lstResultadoCursoFormacionAll.length > 0) {
      this.lstResultadoCursoFormacionAll.forEach(e => {
        this.cvService.getPersonalData(e.idUsuarioAspirante)
          .subscribe(
            (res: any) => {
              const dataPersonal = res.datos[0];
              e.datosPersonales = dataPersonal as DataPersonal;

            }, err => {
              console.log(err);
            }
          );
      });
    }

    this.dataSourceAspirantes.data = [];
  }

  public loadFormResult(element: InscripcionAspiranteModel) {
    this.cleanFormResult();
    this.aspiranteCurrent = Constants.cloneObject(element);

    this.identificacion.setValue(this.getNumeroDocumento(element));
    this.nombreAspirante.setValue(this.getNameAspirante(element));

    this.listenerControls();
  }

  public editResultadoPruebas(element: ResultadosCursoFormacionModel) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.cleanFormResult();
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      idConvocatoria: element.idConvocatoria,
      fechaResolucion: element.fechaResolucion,
      resolucion: element.resolucion,
      // notaConsolidadaHomologacion: element.notaConsolidadaHomologacion,
    });
    let result = 0;
    if (element.pierdeXInasistencia === 1) {
      result = 2;
    } else if (element.pierdeXNota === 1) {
      this.f.totalCFJI_100.setValue(element.totalCFJI_100);
      this.f.totalCFJI_100.updateValueAndValidity();
      result = 3;
    } else if (element.esHomologado === 1) {
      this.f.notaConsolidadaHomologacion.setValue(element.notaConsolidadaHomologacion);
      this.f.notaConsolidadaHomologacion.updateValueAndValidity();
      result = 4;
    } else if (element.retiroVoluntario === 1) {
      result = 5;
    } else if (element.noInscrito === 1) {
      result = 6;
    } else {
      this.f.totalCFJI_100.setValue(element.totalCFJI_100);
      this.f.totalCFJI_100.updateValueAndValidity();
      result = 1;
    }
    this.f.resultadoCursoFormacion.enable();
    this.f.resultadoCursoFormacion.setValue(result);

    this.identificacion.setValue(element.numeroDocumento);

    const nombreAspirante = [
      element.nombres,
      element.apellidos
    ].join(' ');
    this.nombreAspirante.setValue(nombreAspirante);
  }

  public saveResultadosCursoFormacion() {
    if (this.aspiranteCurrent && this.aspiranteCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (this.aspiranteCurrent && !this.aspiranteCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (!this.aspiranteCurrent && !this.elementCurrent.id) {
      this.alertService.message(this.ct.MSG_LIST_APPLICANT_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }

    const aspirante = this.elementCurrent.idUsuarioAspirante ? this.elementCurrent.idUsuarioAspirante : this.aspiranteCurrent.idUsuario;

    const obj = this.lstTable.find((x: ResultadosCursoFormacionModel) =>
      this.areEqualsValues(x.idConvocatoria, this.idConvocatoria.value) &&
      this.areEqualsValues(x.idUsuarioAspirante, aspirante));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.MSG_ASPIRANTE_TIENE_RESULTADO_CURSO_FORMACION, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    const newResultCFJI: ResultadosCursoFormacionModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idConvocatoria: this.idConvocatoria.value,
      idUsuarioAspirante: '',
      totalCFJI_100: 0,
      pierdeXInasistencia: null,
      pierdeXNota: null,
      noInscrito: null,
      esHomologado: null,
      resolucion: null,
      fechaResolucion: null,
      notaConsolidadaHomologacion: null,
      retiroVoluntario: null,
      idUsuarioModificacion: this.user.id,
    };

    if (this.f.id.value) { // si el registro se va a editar
      newResultCFJI.idUsuarioAspirante = this.elementCurrent.idUsuarioAspirante;
    } else { // si es un registro nuevo
      newResultCFJI.idUsuarioAspirante = this.aspiranteCurrent.idUsuario;
    }

    if (this.f.resultadoCursoFormacion.value === 1) { // Aprueba
      newResultCFJI.resolucion = this.f.resolucion.value;
      newResultCFJI.fechaResolucion = this.f.fechaResolucion.value;
      newResultCFJI.totalCFJI_100 = Number(this.f.totalCFJI_100.value);
    } else if (this.f.resultadoCursoFormacion.value === 2) { // Pierde por inasistencia
      newResultCFJI.pierdeXInasistencia = 1;
      newResultCFJI.resolucion = this.f.resolucion.value;
      newResultCFJI.fechaResolucion = this.f.fechaResolucion.value;
    } else if (this.f.resultadoCursoFormacion.value === 3) { // Pierde por nota
      newResultCFJI.resolucion = this.f.resolucion.value;
      newResultCFJI.fechaResolucion = this.f.fechaResolucion.value;
      newResultCFJI.totalCFJI_100 = Number(this.f.totalCFJI_100.value);
      newResultCFJI.pierdeXNota = 1;
    } else if (this.f.resultadoCursoFormacion.value === 4) { // Homologado
      newResultCFJI.esHomologado = 1;
      newResultCFJI.resolucion = this.f.resolucion.value;
      newResultCFJI.fechaResolucion = this.f.fechaResolucion.value;
      newResultCFJI.notaConsolidadaHomologacion = Number(this.f.notaConsolidadaHomologacion.value);
    } else if (this.f.resultadoCursoFormacion.value === 5) { // Retiro voluntario
      newResultCFJI.retiroVoluntario = 1;
      newResultCFJI.resolucion = this.f.resolucion.value;
      newResultCFJI.fechaResolucion = this.f.fechaResolucion.value;
    } else if (this.f.resultadoCursoFormacion.value === 6) { // No inscrito al curso formación
      newResultCFJI.noInscrito = 1;
    }
    try {
      this.cs.saveResultadoCursoFormacion(newResultCFJI)
        .toPromise()
        .then((res) => {
          this.loadDataByConvocatoria({ value: this.dataTemp.idConvocatoria }).then(() => {
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES);
            this.submit = false;
            this.cleanFormResult();
            this.scrollTop();
          });
        })
        .catch(err => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        })
        .finally(() => this.submit = false);
    } catch (error) {
      this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
    }
  }

  public showDetailResult(element: ResultadosCursoFormacionModel) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form2.patchValue({
      id: element.id,
      idConvocatoria: element.idConvocatoria,
      resolucion: element.resolucion,
      fechaResolucion: element.fechaResolucion,
      totalCFJI_100: element.totalCFJI_100,
      notaConsolidadaHomologacion: element.notaConsolidadaHomologacion,
    });

    this.showRegionAprueba = false;
    this.showRegionReprueba = false;
    this.showRegionHomologado = false;
    this.showRegionPierdeXInasistencia = false;
    this.showRegionRetiroVoluntario = false;

    let result = 0;
    if (element.pierdeXInasistencia === 1) {
      this.showRegionPierdeXInasistencia = true;
      result = 2;
    } else if (element.pierdeXNota === 1) {
      this.showRegionReprueba = true;
      result = 3;
    } else if (element.esHomologado === 1) {
      this.showRegionHomologado = true;
      result = 4;
    } else if (element.retiroVoluntario === 1) {
      this.showRegionRetiroVoluntario = true;
      result = 5;
    } else if (element.noInscrito === 1) {
      result = 6;
    } else {
      this.showRegionAprueba = true;
      result = 1;
    }

    let heightDialog = '';
    if (this.showRegionAprueba || this.showRegionReprueba || this.showRegionHomologado || this.showRegionRetiroVoluntario || this.showRegionPierdeXInasistencia) {
      heightDialog = '70%';
    } else {
      heightDialog = '55%';
    }

    this.f2.resultadoCursoFormacion.setValue(result);

    this.identificacion.setValue(element.numeroDocumento);
    const nombreAspirante = [
      element.nombres,
      element.apellidos,
    ].join(' ');
    this.nombreAspirante.setValue(nombreAspirante);

    this.dialogRefInfo = this.dialogService.open(this.dialogInfo, {
      maxWidth: '90%',
      height: heightDialog,
    });
    this.dialogRefInfo.addPanelClass(['col-xs-12', 'col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.elementCurrent = {};
    this.dialogRefInfo.close();
  }

  public deleteResultadoCF(element: any) {
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
          this.cs.deleteResultadoCursoFormacion(element.id)
            .subscribe(o => {
              this.loadDataByConvocatoria({ value: this.dataTemp.idConvocatoria })
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
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

  public getResultadoFinalCFAspirante(element: ResultadosCursoFormacionModel) {
    let resultadoFinal = '';
    if (element.pierdeXNota === 1) {
      resultadoFinal = 'Pierde por nota';
    } else if (element.pierdeXInasistencia === 1) {
      resultadoFinal = 'Pierde por inasistencia';
    } else if (element.esHomologado === 1) {
      resultadoFinal = 'Es homologado';
    } else if (element.retiroVoluntario === 1) {
      resultadoFinal = 'Retiro voluntario';
    } else if (element.noInscrito === 1) {
      resultadoFinal = 'No inscrito al curso de formación';
    } else {
      resultadoFinal = 'Aprueba';
    }
    return resultadoFinal;
  }

  public getNumeroDocumentoAspiranteResultadoCF(element: any) {
    if (element.datosPersonales) {
      const numeroDocumento = element.datosPersonales.numeroDocumento;
      return numeroDocumento;
    }
  }

  public getNombreAspiranteResultadoCF(element: any) {
    if (element.datosPersonales) {
      const nombreAspirante = [
        element.datosPersonales.primerNombre,
        element.datosPersonales.segundoNombre,
        element.datosPersonales.primerApellido,
        element.datosPersonales.segundoApellido,
      ].join(' ');
      return nombreAspirante;
    }
  }

  public validateNumber(e: any) {
    const input = String.fromCharCode(e.charCode);
    const regExpString = /^[0-9]*\.?[0-9]*$/g;
    if (!regExpString.test(input)) {
      e.preventDefault();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.convocatoryCurrent = null;
    this.elementCurrent = {};
    this.aspiranteCurrent = undefined;
    this.elementCurrent.id = undefined;
    // this.aspiranteCurrent.id = undefined;
    this.dataSource.data = [];
    this.dataSourceAspirantes.data = [];
    this.submit = false;
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();

    this.idEmpresa.setValue('');
    this.idEmpresa.updateValueAndValidity();
    this.idConvocatoria.setValue('');
    this.idConvocatoria.clearValidators();
    this.idConvocatoria.updateValueAndValidity();

    this.listenerControls();
  }

  public cleanFormResult() {
    /* this.elementCurrent = {};
    this.aspiranteCurrent = {}; */
    this.elementCurrent.id = undefined;
    this.aspiranteCurrent = undefined;
    /* this.f.id.setValue(undefined);
    this.f.id.updateValueAndValidity();
    this.f.resultadoCursoFormacion.setValue('');
    this.f.resultadoCursoFormacion.updateValueAndValidity(); */
    this.submit = false;
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.formV.resetForm();

    this.listenerControls();
  }
}
