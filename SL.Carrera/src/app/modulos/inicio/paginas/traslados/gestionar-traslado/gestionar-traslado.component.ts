import { CargoConDespachoModel } from '@app/compartido/modelos/cargo-con-despacho-model';
import { SoporteModel } from '@app/compartido/modelos/soporte-model';
import { SoporteTrasladoUsuarioModel } from '@app/compartido/modelos/soporte-traslado-usuario-model';
import { TipoDocumentoTrasladoModel } from '@app/compartido/modelos/tipo-documento-traslado-model';
import { TrasladoCSJModel } from '@app/compartido/modelos/trasladoCSJ-model';
import { Despachos } from '@app/compartido/modelos/despachos';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { User } from '@app/compartido/modelos/user';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, documentsType, modulesSoports } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { TrasladosService } from '@app/core/servicios/traslados.service';
import { FilesService } from '@app/core/servicios/files.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Configuration } from '@app/compartido/modelos/configuration';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MatDialog } from '@angular/material';
import { FileInput } from 'ngx-material-file-input';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { SoporteTrasladoModel } from '@app/compartido/modelos/soporte-traslado-model';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';


const MODALIDAD: any[] = [
  { id: '1', modalidad: 'Salud servidor' },
  { id: '2', modalidad: 'Salud familiar de servidor' }
];

const DICTAMEN_MEDICO: any[] = [
  { id: '1', dictamenMedico: 'EPS' },
  { id: '2', dictamenMedico: 'ARL' }
];

@Component({
  selector: 'app-gestionar-traslado',
  templateUrl: './gestionar-traslado.component.html',
  styleUrls: ['./gestionar-traslado.component.scss']
})
export class GestionarTrasladoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTipoTraslado: TipoTrasladoModel[] = [];
  public lstTipoDocumentoTrasladoAll: TipoDocumentoTrasladoModel[] = [];
  public lstTipoDocumentoByTraslado: TipoDocumentoTrasladoModel[] = [];
  public lstDespachos: Despachos[] = [];
  public lstSoporteTrasladoUsuario: SoporteTrasladoUsuarioModel[] = [];
  public lstSoportes: SoporteModel[] = [];
  public lstIdSoportes: string[] = [];
  public lstSoporteByTraslado: SoporteTrasladoModel[] = [];

  public lstCargosConDespachos: CargoConDespachoModel[] = [];

  public lstModalidad = MODALIDAD;
  public lstDictamenMedico = DICTAMEN_MEDICO;
  public filteredDespachos: Observable<Despachos[]>;

  public calificacionDeServicios: Configuration;
  public codNivelContratacionPropiedad: Configuration;
  public elementCurrent: any = {};
  public usuarioCurrent: any = {};
  public usuarioReciprocoCurrent: any = {};
  private user: User = this.commonService.getVar(configMsg.USER);
  public activateForm = 0;
  public form: FormGroup;
  public submit = false;
  public submit2 = false;
  public showLstSoportes = false;

  public disableForm: boolean = false; // Para controlar el nivel de contratación
  public showBtnAccept: boolean = true;
  public infoUsuario: any = {};

  public idTrasladosSinFechas: Configuration;
  public lstIdTrasladosSinFechas: any[] = [];
  public lstFechasHabilesTraslado: any[] = [];
  public showAlert = false;

  public despachoSeleccionado: Despachos;
  public cargoSeleccionado: CargoConDespachoModel;

  public idTipoDocumentoTraslado: FormControl = new FormControl('', [Validators.required]);
  public idSoporte: FormControl = new FormControl('', [Validators.required]);

  public displayedColumns: string[] = ['tipoDocumentoTraslado', 'nombreSoporteTraslado', 'verSoporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;

  public displayedColumnsDialog: string[] = ['codigoDespacho', 'despacho', 'sede', 'options'];
  public dataSourceDialog = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceDialog.paginator = value;
  }

  public displayedColumnsDialogCargos: string[] = ['codigoCargo', 'cargo', 'options'];
  public dataSourceDialogCargos = new MatTableDataSource<any>([]);
  private dialogRefInfoCargos: MatDialogRef<any, any>;
  @ViewChild('dialogInfoCargos', { static: true }) dialogInfoCargos: TemplateRef<any>;
  @ViewChild('paginatorDialogCargos', { static: false }) set paginatorDialogCargos(value: MatPaginator) {
    this.dataSourceDialogCargos.paginator = value;
  }

  constructor(
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private convocatoryServices: ConvocatoriaService,
    private ct: CustomTranslateService,
    private fService: FilesService,
    private fb: FormBuilder,
    private dialogService: MatDialog,
    private trasladoService: TrasladosService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.commonService.getConfigJson()
      .toPromise()
      .then((data: any) => {
        this.loadData()
          .catch(error => {
            console.log('Error', error);
          })
          .finally(() => {
            this.alertService.close();
          });
      });

    this.filteredDespachos = this.f.idDespacho.valueChanges
      .pipe(
        startWith(''),
        map(value => value ? typeof value === 'string' ? value : value.despacho + value.codigoDespacho : undefined),
        map(despacho => despacho ? this._filter(despacho) : this.lstDespachos.slice())
      );
  }

  private _filter(value: any): any[] {
    if (!value || value === '') {
      return this.lstDespachos;
    }
    const filterValue = value.toLowerCase();
    return this.lstDespachos.filter(e => {
      const source: string = (e.codigoDespacho + ' - ' + e.despacho);
      return source.toLowerCase().includes(filterValue);
    });
  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      // Información personal
      numDocumento: new FormControl({ value: '', disabled: true }),
      servidor: new FormControl({ value: '', disabled: true }),
      sexo: new FormControl({ value: '', disabled: true }),
      edad: new FormControl({ value: '', disabled: true }),
      estadoCivil: new FormControl({ value: '', disabled: true }),
      lugarNacimiento: new FormControl({ value: '', disabled: true }),
      ciudadResidencia: new FormControl({ value: '', disabled: true }),
      telefono: new FormControl({ value: '', disabled: true }),
      celular: new FormControl({ value: '', disabled: true }),
      correo: new FormControl({ value: '', disabled: true }),
      profesion: new FormControl({ value: '', disabled: true }),
      esquema: new FormControl({ value: '', disabled: true }),

      // Información laboral
      fechaIngreso: new FormControl({ value: '', disabled: true }),
      establecimientoActual: new FormControl({ value: '', disabled: true }),
      cargoInfoLaboral: new FormControl({ value: '', disabled: true }),

      // Información traslado
      idTipoTraslado: new FormControl('', [Validators.required]),
      idSoporteXTraslado: new FormControl(''),
      motivoTraslado: new FormControl('', [Validators.required]),
      // idDespacho: new FormControl({ value: '', disabled: true }),
      idDespacho: new FormControl(''),
      cargo: new FormControl(''),

      // Traslado por salud
      modalidad: new FormControl(''),
      dictamenMedico: new FormControl(''),

      // Traslado recíproco
      idUsuarioReciproco: new FormControl(''),
      codUsuarioReciproco: new FormControl(''),
      nombreUsuarioReciproco: new FormControl({ value: '', disabled: true }),
      numDocumentoUsuarioReciproco: new FormControl(''),
      sexoUsuarioReciproco: new FormControl({ value: '', disabled: true }),
      gradoUsuarioReciproco: new FormControl({ value: '', disabled: true }),
      codCargoUsuarioReciproco: new FormControl({ value: '', disabled: true }),
      cargoUsuarioReciproco: new FormControl({ value: '', disabled: true }),
      codEstablecimientoPermuta: new FormControl({ value: '', disabled: true }),
      establecimientoPermuta: new FormControl({ value: '', disabled: true }),
      calificacionServicioReciproco: new FormControl(''),

      // Traslado servidor de carrera
      calificacionServCarrera: new FormControl(''),

      // Traslado por servicio
      calificacionServicios: new FormControl(''),
    });
    this.listenerControls();
  }

  get f() {
    return this.form.controls;
  }

  public listenerControls() {

    this.f.idDespacho.disable();
    this.f.cargo.disable();
    this.f.idTipoTraslado.setValidators([Validators.required]);
    this.f.motivoTraslado.setValidators([Validators.required]);
    this.f.idDespacho.clearValidators();
    this.f.modalidad.clearValidators();
    this.f.dictamenMedico.clearValidators();
    this.f.numDocumentoUsuarioReciproco.clearValidators();

    if (this.activateForm === 1) { // Traslado para servidor de carrera
      this.f.idDespacho.setValidators([Validators.required]);
      this.f.cargo.setValidators([Validators.required]);
    } else if (this.activateForm === 2) { // Traslado por salud
      this.f.modalidad.setValidators([Validators.required]);
      this.f.idDespacho.setValidators([Validators.required]);
      this.f.cargo.setValidators([Validators.required]);
      this.f.dictamenMedico.setValidators([Validators.required]);
    } else if (this.activateForm === 3) { // Traslado por seguridad
      this.f.idDespacho.setValidators([Validators.required]);
      this.f.cargo.setValidators([Validators.required]);
    } else if (this.activateForm === 4) { // Traslado por servicio
      this.f.cargo.setValidators([Validators.required]);
      this.f.idDespacho.setValidators([Validators.required]);
    } else if (this.activateForm === 5) { // Traslado recíproco
      this.f.numDocumentoUsuarioReciproco.setValidators([Validators.required]);
    } else {
      this.f.idTipoTraslado.setValidators([Validators.required]);
      this.f.motivoTraslado.setValidators([Validators.required]);
    }

    this.f.idTipoTraslado.updateValueAndValidity();
    this.f.motivoTraslado.updateValueAndValidity();
    this.f.idDespacho.updateValueAndValidity();
    this.f.cargo.updateValueAndValidity();
    this.f.modalidad.updateValueAndValidity();
    this.f.dictamenMedico.updateValueAndValidity();
    this.f.numDocumentoUsuarioReciproco.updateValueAndValidity();
  }

  public async loadData() {
    this.calificacionDeServicios = await this.commonService.getVarConfig(configMsg.CALIFICACION_DE_SERVICIOS); // Consulta la config para determinar el puntaje mínimo de calificación de servicios
    this.codNivelContratacionPropiedad = await this.commonService.getVarConfig(configMsg.COD_NIVEL_CONTRATACION_PROPIEDAD); // Consulta la config para determinar el puntaje mínimo de calificación de servicios
    if (!this.lstTipoTraslado || this.lstTipoTraslado.length == 0) {
      this.lstTipoTraslado = (await this.trasladoService.getTodosTipoTraslados().toPromise() as any).datos as TipoTrasladoModel[]; // Consulta todos los tipos de traslados
    }

    if (!this.lstTipoDocumentoTrasladoAll || this.lstTipoDocumentoTrasladoAll.length == 0) {
      this.lstTipoDocumentoTrasladoAll = (await this.trasladoService.getTodosTipoDocumentoTraslado().toPromise() as any).datos as TipoDocumentoTrasladoModel[]; // Consulta todos los tipos de documentos por traslados
    }

    if (!this.lstDespachos || this.lstDespachos.length == 0) {
      this.lstDespachos = (await this.trasladoService.getDespachosConVacantes().toPromise() as any).datos as Despachos[]; // Consulta los despachos existentes
      // this.lstDespachos = (await this.convocatoryServices.getTodosDespachos().toPromise() as any).datos as Despachos[]; // Consulta los despachos existentes
    }


    this.lstCargosConDespachos = (await this.trasladoService.getCargosConDespachos().toPromise() as any).datos as CargoConDespachoModel[]; // Consulta los cargos con despachos existentes
    if (this.lstCargosConDespachos.length > 0) {
      this.lstCargosConDespachos.forEach(cd => {
        cd.detallePerfilModel = JSON.parse(cd.detallePerfil);
      });
    }


    this.idTrasladosSinFechas = (await this.commonService.getVarConfig(configMsg.ID_TRASLADOS_SIN_FECHAS)); // Carga los tipos de traslados que no tienen fechas habiles configuradas para solicitar traslado
    if (this.idTrasladosSinFechas) {
      this.lstIdTrasladosSinFechas = this.idTrasladosSinFechas.valor.split(',');
    }

    if (this.user.existeEmpleadoTraslado && this.user.numDocumento) {
      const datosUsuario = (await this.trasladoService.getInformacionByNumDocumento(this.user.numDocumento).toPromise() as any).datos as any; // Consulta la información del empleado con el documento de identificación
      this.infoUsuario = JSON.parse(datosUsuario);
      if (this.infoUsuario.datos.length > 0) {
        this.usuarioCurrent = this.infoUsuario.datos[0];

        // Setea los datos personales 
        this.f.numDocumento.setValue(this.usuarioCurrent.numdocumento);
        const nombre = [
          this.usuarioCurrent.nombrE1,
          this.usuarioCurrent.nombrE2,
          this.usuarioCurrent.apellidO1,
          this.usuarioCurrent.apellidO2,
        ].join(' ');
        this.f.servidor.setValue(nombre);
        this.f.sexo.setValue(this.usuarioCurrent.sexo);
        this.f.edad.setValue(this.usuarioCurrent.edad);
        this.f.estadoCivil.setValue(this.usuarioCurrent.estadocivil);
        this.f.lugarNacimiento.setValue(this.usuarioCurrent.lugarnacimiento);
        this.f.ciudadResidencia.setValue(this.usuarioCurrent.ciudadresidencia);
        this.f.telefono.setValue(this.usuarioCurrent.telefono);
        this.f.celular.setValue(this.usuarioCurrent.celular);
        this.f.correo.setValue(this.usuarioCurrent.email);
        this.f.profesion.setValue(this.usuarioCurrent.profesion);
        this.f.esquema.setValue(this.usuarioCurrent.esquema);

        // Setea información laboral
        this.f.fechaIngreso.setValue(this.usuarioCurrent.fechaingreso);
        this.f.establecimientoActual.setValue(this.usuarioCurrent.establecimientoactual);
        this.f.cargoInfoLaboral.setValue(this.usuarioCurrent.cargo);

        // Actualiza los FormControl
        this.f.numDocumento.updateValueAndValidity();
        this.f.servidor.updateValueAndValidity();
        this.f.sexo.updateValueAndValidity();
        this.f.edad.updateValueAndValidity();
        this.f.estadoCivil.updateValueAndValidity();
        this.f.lugarNacimiento.updateValueAndValidity();
        this.f.ciudadResidencia.updateValueAndValidity();
        this.f.telefono.updateValueAndValidity();
        this.f.celular.updateValueAndValidity();
        this.f.correo.updateValueAndValidity();
        this.f.profesion.updateValueAndValidity();
        this.f.esquema.updateValueAndValidity();
        this.f.fechaIngreso.updateValueAndValidity();
        this.f.establecimientoActual.updateValueAndValidity();
        this.f.cargoInfoLaboral.updateValueAndValidity();
      }
    }
  }

  /**
   * Carga el formulario correspondiente al tipo de traslado seleccionado
   * @param pTipoTraslado - Tipo traslado seleccionado
   */
  public async loadFormByTipoTraslado(pTipoTraslado: any) {
    this.showAlert = false;
    if (pTipoTraslado.value) {
      if (this.lstIdTrasladosSinFechas && this.lstIdTrasladosSinFechas.length > 0) {
        const encontro = this.lstIdTrasladosSinFechas.find(x => this.areEqualsIdGuid(x, pTipoTraslado.value));
        const today = new Date().toISOString().split('T')[0];
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        if (!encontro) {
          this.lstFechasHabilesTraslado = (await this.trasladoService.getFechasHabilesParaTraslado(month).toPromise() as any).resultado as any[];
          this.lstFechasHabilesTraslado.forEach(fe => {
            const fechaHabil = this.lstFechasHabilesTraslado.find(fe => new Date(fe.fechaNoHabil).toISOString().split('T')[0] === today);
            if (!fechaHabil) {
              this.showAlert = true;
            } else {
              this.showAlert = false;
            }
          })
        }
      }

      // Carga los soportes por traslado, para diligenciar 
      this.lstSoporteByTraslado = (await this.trasladoService.getTodosSoporteByTraslado(pTipoTraslado.value).toPromise() as any).datos as SoporteTrasladoModel[];
      if (this.lstSoporteByTraslado.length > 0) {
        this.lstSoporteByTraslado.forEach(async st => {
          st.nombreSoporte = (await this.fService.getInformationFile(st.idSoporte).toPromise() as any).datos.nombreAuxiliar;
        });
        this.showLstSoportes = true;
      } else {
        this.showLstSoportes = false;
      }

      this.lstTipoDocumentoByTraslado = [];
      this.lstTipoDocumentoByTraslado = this.lstTipoDocumentoTrasladoAll.filter(td => td.idTipoTraslado === pTipoTraslado.value);

      const traslado = this.lstTipoTraslado.find(t => t.id === pTipoTraslado.value);
      if (traslado) {
        this.disableForm = true;
        if (traslado.tipoTraslado.toLowerCase().includes('carrera')) {
          this.activateForm = 1;
        } else if (traslado.tipoTraslado.toLowerCase().includes('salud')) {
          this.activateForm = 2;
        } else if (traslado.tipoTraslado.toLowerCase().includes('seguridad')) {
          this.disableForm = false;
          this.activateForm = 3;
        } else if (traslado.tipoTraslado.toLowerCase().includes('servicio')) {
          this.activateForm = 4;
        } else if (traslado.tipoTraslado.toLowerCase().includes('recíproco')) {
          this.activateForm = 5;
        }
      }

      if ((this.infoUsuario.datos[0].codnivelcontratacion !== Number(this.codNivelContratacionPropiedad.valor)) && this.disableForm !== false) {
        this.alertService.message(this.ct.MSG_COD_NIVEL_CONTRATACION_PROPIEDAD, TYPES.WARNING);
        this.submit = false;
        this.showBtnAccept = false;
        return;
      } else {
        this.showBtnAccept = true;
      }
    } else {
      this.activateForm = 0;
      this.submit = false;
    }
    this.listenerControls();
  }

  public descargarSoporteTraslado() {
    if (this.f.idSoporteXTraslado.value) {
      this.submit2 = true;
      this.fService.downloadFile(this.f.idSoporteXTraslado.value).subscribe(
        res => {
          let blob: any = new Blob([res], { type: 'application/msword; charset=utf-8' });
          C.viewFile(blob);
          this.submit2 = false;
        }, error => {
          console.log('Error', error);
        }
      );
    } else {
      this.submit2 = false;
      return;
    }
  }

  /**
   * Guarda la información del traslado en BD
   */
  public save() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    let lstCompleta = true;
    // if (this.lstSoporteTrasladoUsuario.length > 0) {
    if (this.lstTipoDocumentoByTraslado.length > 0) {
      
      this.lstTipoDocumentoByTraslado.forEach(tdt => {
        if (tdt.esObligatorio) {
          const encontro = this.lstSoporteTrasladoUsuario.find(x => x.tipoDocumentoTraslado.id === tdt.id);
          if (!encontro) {
            lstCompleta = false;
            this.submit = false;
            return;
          }
        }
      });

      if (lstCompleta) {
        this.clearAndSetValidatorRequired(false, [this.idTipoDocumentoTraslado, this.idSoporte]);
        this.touchedFields(false, [this.idTipoDocumentoTraslado, this.idSoporte]);
      } else {
        this.alertService.message(this.ct.MSG_DOCUMENTOS_TRASLADO_INCOMPLETOS, TYPES.WARNING);
        this.submit = false;
        return;
      }
    } else {
      this.alertService.message(this.ct.MSG_DOCUMENTOS_TRASLADO_INCOMPLETOS, TYPES.WARNING);
      lstCompleta = false;
      this.submit = false;
      return;
    }

    if (this.showAlert) {
      this.alertService.message(this.ct.MSG_TRASLADO_SIN_FECHA_HABIL, TYPES.WARNING);
      this.submit = false;
      return;
    }

    const newTraslado: TrasladoCSJModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuario: this.user.id,
      numDocumentoUsuario: '',
      numRadicado: '',
      idTipoTraslado: this.f.idTipoTraslado.value,
      fechaSolicitud: new Date().toISOString(),
      motivoTraslado: this.f.motivoTraslado.value,
      codigoDespacho: '',
      codAlternoDependencia: '',
      modalidad: '',
      dictamenMedico: '',
      idUsuarioReciproco: null,
      numDocumentoUsuarioReciproco: '',
      calificacionServicioReciproco: 0,
      calificacionServCarrera: 0,
      calificacionServicios: 0,
      idSoportes: this.lstIdSoportes
    };

    if (this.activateForm === 5) { // Traslado recíproco
      newTraslado.idUsuarioReciproco = this.usuarioReciprocoCurrent ? this.usuarioReciprocoCurrent.id : null;
      newTraslado.numDocumentoUsuarioReciproco = this.f.numDocumentoUsuarioReciproco.value;
      newTraslado.calificacionServicioReciproco = this.f.calificacionServicioReciproco.value ? Number(this.f.calificacionServicioReciproco.value) : 0;
    } else {

      if (!this.f.idDespacho || !this.f.idDespacho.value || !this.despachoSeleccionado) {
        this.alertService.message(this.ct.MSG_SELECCIONE_DESPACHO, TYPES.WARNING);
        this.submit = false;
        return;
      }

      if (!this.f.cargo || !this.f.cargo.value || !this.cargoSeleccionado) {
        this.alertService.message(this.ct.MSG_SELECCIONE_CARGO, TYPES.WARNING);
        this.submit = false;
        return;
      }

      const despachoSelected: Despachos = this.despachoSeleccionado;
      newTraslado.codigoDespacho = despachoSelected.codigoDespacho;
      newTraslado.despacho = despachoSelected.despacho;
      newTraslado.codAlternoDependencia = despachoSelected.codAlterno ? despachoSelected.codAlterno : '';

      const cargoSelected = this.cargoSeleccionado.detallePerfilModel;
      newTraslado.codigoCargo = cargoSelected.cargoHumanoModel ? cargoSelected.cargoHumanoModel.codCargo : cargoSelected.cargoModel.codAlterno;
      newTraslado.cargo = cargoSelected.cargoHumanoModel ? cargoSelected.cargoHumanoModel.cargo : cargoSelected.cargoModel.cargo;

      if (this.activateForm === 1) { // Traslado servidor de carrera
        newTraslado.calificacionServCarrera = this.f.calificacionServCarrera.value ? Number(this.f.calificacionServCarrera.value) : 0;
      } else if (this.activateForm === 2) { // Traslado por salud
        newTraslado.modalidad = this.f.modalidad.value;
        newTraslado.dictamenMedico = this.f.dictamenMedico.value;
      } /* else if (this.activateForm === 3) {

      } */ else if (this.activateForm === 4) { // Traslado por servicios
        newTraslado.calificacionServicios = this.f.calificacionServicios.value ? Number(this.f.calificacionServicios.value) : 0;
      }
    }
    this.alertService.loading();
    console.log('new', newTraslado);
    this.trasladoService.saveTrasladoCSJ(newTraslado).toPromise()
      .then((record: any) => {
        const obj = record.datos;
        newTraslado.id = newTraslado.id ? newTraslado.id : obj.idTraslado;
        this.saveSoporteXTrasladoUsuario(newTraslado);
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.MSG_SOLICITUD_TRASLADO_EXITOSA, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      })
      .catch(err => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  /**
   * Guarda el documento en BD, con el tipo de traslado seleccionado
   */
  public async agregarSoporteTraslado() {
    this.submit = true;

    if (!this.idTipoDocumentoTraslado.value || !this.idSoporte.value) {
      this.clearAndSetValidatorRequired(true, [this.idTipoDocumentoTraslado, this.idSoporte]);
      this.touchedFields(true, [this.idTipoDocumentoTraslado, this.idSoporte]);
      this.submit = false;
      return;
    }

    const obj = this.lstSoporteTrasladoUsuario.find((x: SoporteTrasladoUsuarioModel) =>
      this.areEqualsValues(x.tipoDocumentoTraslado.id, this.idTipoDocumentoTraslado.value));
    if (obj) {
      this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
      this.submit = false;
      return;
    }

    const tipoDocumentoTraslado: TipoDocumentoTrasladoModel = this.lstTipoDocumentoByTraslado.find(td => td.id === this.idTipoDocumentoTraslado.value);
    const file = (<FileInput>this.idSoporte.value).files[0];
    const params = {
      NombreSoporte: C.generateNameFile(file.name, tipoDocumentoTraslado.tipoDocumento, modulesSoports.SOPORTE_TRASLADO, documentsType.SOPORTE, this.commonService.getDateString()),
      Modulo: modulesSoports.SOPORTE_TRASLADO,
      NombreAuxiliar: file.name,
      idUsuarioModificacion: this.user.id
    }
    const documentFile: any = await this.fService.postFile(file, params).toPromise();
    if (documentFile) {
      this.lstSoportes.push(documentFile); // Se guarda el obj de soporte
      this.lstIdSoportes.push(documentFile.id); // Se guardan los id de los soportes agregados
      const newSoporteXTrasladoUsuario: SoporteTrasladoUsuarioModel = {
        id: undefined,
        idTraslado: '',
        idTipoTraslado: this.f.idTipoTraslado.value,
        idSoporte: documentFile.id,
        idUsuario: this.user.id,
        soporte: documentFile,
        idTipoDocumentoTraslado: tipoDocumentoTraslado.id,
        tipoDocumentoTraslado: tipoDocumentoTraslado
      }
      this.lstSoporteTrasladoUsuario.push(newSoporteXTrasladoUsuario);
    }

    // this.refreshTable(this.lstSoportes);
    this.refreshTable(this.lstSoporteTrasladoUsuario);
    this.touchedFields(false, [this.idTipoDocumentoTraslado, this.idSoporte]);
    this.deleteFile();
    this.submit = false;
  }

  public refreshTable(lstSoportesTrasladoUsuario: any[]) {
    this.dataSource.data = lstSoportesTrasladoUsuario;
    /* C.setValidatorFile(true, this.idSoporte, this.configFile.sizeFile);
    this.idSoporte.setValue(null);
    this.idSoporte.markAsUntouched(); */

    if (lstSoportesTrasladoUsuario.length > 0) {
      this.f.idTipoTraslado.disable();
    } else if (lstSoportesTrasladoUsuario.length === 0) {
      this.f.idTipoTraslado.enable();
    }
    this.f.idTipoTraslado.updateValueAndValidity();
  }

  public saveSoporteXTrasladoUsuario(newTraslado: TrasladoCSJModel) {
    if (this.lstSoporteTrasladoUsuario.length > 0) {
      this.lstSoporteTrasladoUsuario.forEach(async stu => {
        stu.idTraslado = newTraslado.id;
        try {
          await this.trasladoService.saveSoporteXTrasladoUsuario(stu).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
  }

  public buscarCargo() {
    this.dataSourceDialogCargos.data = this.lstCargosConDespachos;
    this.dialogRefInfoCargos = this.dialogService.open(this.dialogInfoCargos, {
      maxWidth: '90%',
      height: '70%',
    });
    this.dialogRefInfoCargos.addPanelClass(['col-xs-12', 'col-sm-12', 'col-md-8']);
  }

  public buscarTraslado() {
    // this.dataSourceDialog.data = this.lstDespachos;
    if (!this.cargoSeleccionado || this.cargoSeleccionado === undefined) {
      this.alertService.message(this.ct.MSG_SELECCIONE_CARGO, TYPES.WARNING);
      this.submit = false;
      return;
    }
    this.lstDespachos = [];
    this.lstDespachos = this.cargoSeleccionado.despachos;
    this.dataSourceDialog.data = this.lstDespachos;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo, {
      maxWidth: '90%',
      height: '70%',
    });
    this.dialogRefInfo.addPanelClass(['col-xs-12', 'col-sm-12', 'col-md-8']);
  }

  public closeDialogInfoCargos() {
    this.cargoSeleccionado = undefined;
    this.dataSourceDialogCargos.data = [];
    this.dataSourceDialogCargos.filter = '';
    this.dialogRefInfoCargos.close();
  }

  public closeDialogInfo() {
    this.despachoSeleccionado = undefined;
    this.dataSourceDialog.data = [];
    this.dataSourceDialog.filter = '';
    this.dialogRefInfo.close();
  }

  public selectDespacho(element: Despachos) {
    this.despachoSeleccionado = element;
    const nDespacho = [
      this.despachoSeleccionado.codigoDespacho,
      this.despachoSeleccionado.despacho
    ].join(' ');
    this.f.idDespacho.setValue(nDespacho);
    this.dialogRefInfo.close();
  }

  public selectCargo(element: CargoConDespachoModel) {
    this.cargoSeleccionado = element;
    const codCargo = this.cargoSeleccionado.detallePerfilModel.cargoHumanoModel ? this.cargoSeleccionado.detallePerfilModel.cargoHumanoModel.codCargo :
      this.cargoSeleccionado.detallePerfilModel.cargoModel.codAlterno;

    const nCargo = this.cargoSeleccionado.detallePerfilModel.cargoHumanoModel ? this.cargoSeleccionado.detallePerfilModel.cargoHumanoModel.cargo :
    this.cargoSeleccionado.detallePerfilModel.cargoModel.cargo;
    const cargo = [
      codCargo,
      nCargo
    ].join(' ');
    this.f.cargo.setValue(cargo);
    this.dialogRefInfoCargos.close();
  }

  /**
   * Permite visualizar el documento que se agregó.
   * @param id - Identificador del documento
   */
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

  /**
   * Elimina el soporte seleccionado de la lista.
   * @param element - Soporte o documento seleccionado y/o que se desea borrar.
   */
  public deleteSoporte(element: SoporteTrasladoUsuarioModel) {
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.fService.deleteFile(element.soporte.id).subscribe(o => {
            const indice = this.lstSoporteTrasladoUsuario.indexOf(element);
            this.lstSoporteTrasladoUsuario.splice(indice, 1);
            this.refreshTable(this.lstSoporteTrasladoUsuario);
            this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
          }, err => {
            this.alertService.showError(err);
          });
        }
      });
  }

  /**
   * Quita el documento seleccionado del formulario.
   */
  public deleteFile() {
    this.idSoporte.markAsUntouched();
    C.setValidatorFile(true, this.idSoporte, this.configFile.sizeFile);
    this.idSoporte.setValue(null);

    this.clearInputFile(this.inputFileView);
  }

  public getTipoDocumentoTraslado(element: SoporteModel) {
    const nombre = element.nombreSoporte.split('_');
    const tipoDocumento = nombre[0];
    return tipoDocumento;
  }

  /**
   * Consulta la información del empleado, con el número de documento que
   * recibe en el cuadro de texto.
   */
  public getInfoEmpleado() {
    if (!Constants.validateData(this.f.numDocumentoUsuarioReciproco.value)) {
      return;
    }
    this.alertService.loading();
    this.trasladoService.getInformacionByNumDocumento(this.f.numDocumentoUsuarioReciproco.value)
      .subscribe(
        (res: any) => {
          const infoUsuario = JSON.parse(res.datos);
          if (infoUsuario.datos.length > 0) {
            const obj = infoUsuario.datos[0];
            const idUsuarioRecriprocoTemp = res.idUsuario ? res.idUsuario : null;
            // this.f.idUsuarioReciproco.setValue(obj);
            const nombre = [
              obj.nombrE1,
              obj.nombrE2,
              obj.apellidO1,
              obj.apellidO2,
            ].join(' ');
            this.f.nombreUsuarioReciproco.setValue(nombre);
            this.f.idUsuarioReciproco.setValue(idUsuarioRecriprocoTemp);
            this.f.sexoUsuarioReciproco.setValue(obj.sexo);
            this.f.gradoUsuarioReciproco.setValue(obj.grado);
            this.f.codCargoUsuarioReciproco.setValue(obj.codcargoempresa);
            this.f.cargoUsuarioReciproco.setValue(obj.cargo);
            this.f.codEstablecimientoPermuta.setValue(obj.codestablecimientoactual);
            this.f.establecimientoPermuta.setValue(obj.establecimientoactual);

            this.f.nombreUsuarioReciproco.updateValueAndValidity();
            this.f.idUsuarioReciproco.updateValueAndValidity();
            this.f.sexoUsuarioReciproco.updateValueAndValidity();
            this.f.gradoUsuarioReciproco.updateValueAndValidity();
            this.f.codCargoUsuarioReciproco.updateValueAndValidity();
            this.f.cargoUsuarioReciproco.updateValueAndValidity();
            this.f.codEstablecimientoPermuta.updateValueAndValidity();
            this.f.establecimientoPermuta.updateValueAndValidity();

            this.alertService.close();
          } else {
            this.alertService.message(this.ct.MSG_NUMERO_DOCUMENTO_NO_EXISTE, TYPES.WARNING);
            this.f.numDocumentoUsuarioReciproco.setValue('');
          }
        }, err => {
          console.log('Error', err);
        }
      );
  }

  public displayDespacho(pDespacho: any): string {
    const field = pDespacho ? BaseController.translateField(pDespacho, 'despacho', BaseController.lang) : '';
    return field ? field : '';
  }

  /**
   * Limpia los campos del formulario
   */
  public cleanForm() {
    this.f.idTipoTraslado.enable();
    this.f.idDespacho.clearValidators();
    this.f.cargo.clearValidators();
    this.f.modalidad.clearValidators();
    this.f.dictamenMedico.clearValidators();
    this.f.numDocumentoUsuarioReciproco.clearValidators();

    this.f.idTipoTraslado.setValue('');
    this.f.idSoporteXTraslado.setValue('');
    this.f.motivoTraslado.setValue('');
    this.f.idDespacho.setValue('');
    this.f.cargo.setValue('');
    this.f.calificacionServCarrera.setValue('');
    this.f.modalidad.setValue('');
    this.f.dictamenMedico.setValue('');
    this.f.calificacionServicios.setValue('');
    this.f.numDocumentoUsuarioReciproco.setValue('');
    this.f.calificacionServicioReciproco.setValue('');

    this.f.idTipoTraslado.updateValueAndValidity();
    this.f.idSoporteXTraslado.updateValueAndValidity();
    this.f.motivoTraslado.updateValueAndValidity();
    this.f.idDespacho.updateValueAndValidity();
    this.f.cargo.updateValueAndValidity();
    this.f.calificacionServCarrera.updateValueAndValidity();
    this.f.modalidad.updateValueAndValidity();
    this.f.dictamenMedico.updateValueAndValidity();
    this.f.calificacionServicios.updateValueAndValidity();
    this.f.numDocumentoUsuarioReciproco.updateValueAndValidity();
    this.f.calificacionServicioReciproco.updateValueAndValidity();

    this.touchedFields(false, [
      this.f.idTipoTraslado, this.f.motivoTraslado, this.f.idDespacho, this.f.cargo,
      this.f.calificacionServCarrera, this.f.modalidad, this.f.dictamenMedico,
      this.f.calificacionServicios, this.f.numDocumentoUsuarioReciproco, this.f.calificacionServicioReciproco,
      this.idTipoDocumentoTraslado]);

    this.clearAndSetValidatorRequired(false, [this.idTipoDocumentoTraslado, this.idSoporte]);
    this.touchedFields(false, [this.idTipoDocumentoTraslado, this.idSoporte]);

    this.lstTipoDocumentoByTraslado = [];
    this.lstSoportes = [];
    this.lstIdSoportes = [];
    this.dataSource.data = [];
    this.dataSourceDialog.data = [];
    this.dataSourceDialogCargos.data = [];
    this.lstSoporteTrasladoUsuario = [];
    this.submit = false;
    this.submit2 = false;
    this.activateForm = 0;
    this.showLstSoportes = false;
    this.despachoSeleccionado = undefined;
    this.cargoSeleccionado = undefined;
    this.showAlert = false;
  }

  public clearAndSetValidatorRequired(validator: boolean, controls: AbstractControl[]) {
    if (validator) {
      controls.forEach(x => {
        x.setValidators([Validators.required]);
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.setValidators([]);
        x.updateValueAndValidity();
      });
    }
  }

  private touchedFields(touched: boolean, controls: AbstractControl[], emmitEvent?: boolean) {
    if (touched) {
      controls.forEach(x => {
        x.markAsTouched();
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.markAsUntouched();
        // x.setValue('', { emitEvent: false, emitModelToViewChange: true, emitViewToModelChange: false });
        x.setValue('', { emitEvent: emmitEvent });
        x.updateValueAndValidity();
      });
    }
  }

}
