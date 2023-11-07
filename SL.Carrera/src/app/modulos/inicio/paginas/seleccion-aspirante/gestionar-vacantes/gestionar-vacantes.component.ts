import { VacanteModel } from '@app/compartido/modelos/vacante-model';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MatDialog } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, PermisosAcciones, stateConvocatoria, EstadoVacante, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { User } from '@app/compartido/modelos/user';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { VacantesService } from '@app/core/servicios/vacantes.service';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';
import { FileInput } from 'ngx-material-file-input';
import { FilesService } from '@app/core/servicios/files.service';
import { ReportesService } from '@app/core/servicios/reportes.service';

export interface SituacionVacante {
  id: number;
  vacante: string;
  vacante_En: string;
  estado: number;
}

const LST_SITUACIONES_VACANTE: SituacionVacante[] = [
  { id: 1, vacante: 'Vacante nueva para publicar', vacante_En: 'New vacancy to post', estado: 1 },
  { id: 2, vacante: 'Vacante para publicar por lista agotada o por traslado no acogido o declinado', vacante_En: 'vacancy to publish due to exhausted list or due to transfer not accepted or declined', estado: 2 },
  { id: 3, vacante: 'Con lista de aspirantes en trámite', vacante_En: 'With list of applicants pending', estado: 3 },
  { id: 4, vacante: 'Con traslado en trámite (Proyectado por la seccional)', vacante_En: 'With transfer in process (Projected by the section)', estado: 4 },
  { id: 5, vacante: 'Con traslado en trámite (Proyectado por el consejo superior)', vacante_En: 'Con traslado en trámite (Proyectado por el consejo superior)', estado: 5 },
  { id: 6, vacante: 'Con proyecto de reordenamiento en trámite', vacante_En: 'With reorganization project in process', estado: 6 },
  { id: 7, vacante: 'Inhabilitar publicar', vacante_En: 'Disable posting', estado: 7 },
  { id: 7, vacante: 'En posesión', vacante_En: 'In possession', estado: 8 }
];

@Component({
  selector: 'app-gestionar-vacantes',
  templateUrl: './gestionar-vacantes.component.html',
  styleUrls: ['./gestionar-vacantes.component.scss']
})
export class GestionarVacantesComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;

  public lstTable: VacanteModel[] = [];
  public lstVacantesByConvocatoria: VacanteModel[] = [];

  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public vacanteCurrent: any = {};
  public form: FormGroup;
  public form2: FormGroup;
  public submit = false;
  public showSelectCompany = false;
  public matcher: any;
  public sortedData: any;
  public infoVacante = '';

  public idSoporte: FormControl = new FormControl('', [Validators.required]);
  public fechaPosesion: FormControl = new FormControl('', [Validators.required]);
  public observaciones: FormControl = new FormControl('', [Validators.required]);

  public dataSource = new MatTableDataSource<any>([]);
  public dataSourceInfo = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;
  private dialogRefInfo2: MatDialogRef<any, any>;
  private dialogRefInfo3: MatDialogRef<any, any>;
  public selection = new SelectionModel<any>(false, []);
  public displayedColumns: string[] = ['cargo', 'codigoDespacho', 'despacho', 'distrito', 'municipio', 'vacanteFuncionario', 'fechaVacante', 'situacionVacante', 'fechaPosesion', 'inscritos', 'estado', 'options'];
  public displayedColumnsInfo: string[] = ['numeroDocumento', 'nombres', 'apellidos', 'puntajeTotal', 'observaciones', 'options'];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('dialogInfo2', { static: true }) dialogInfo2: TemplateRef<any>;
  @ViewChild('inputSoport1', { static: false }) inputFileView1: ElementRef;
  @ViewChild('dialogInfo3', { static: true }) dialogInfo3: TemplateRef<any>;
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fService: FilesService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private convService: ConvocatoriaService,
    private empresaService: EmpresaService,
    private dialogService: MatDialog,
    private reporteServ: ReportesService,
    private vacanteService: VacantesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadForm2();
    this.commonService.getConfigJson()
      .toPromise()
      .then((data: any) => {
        this.loadUserData()
          .then(async res => {
            this.loadData();
          });
      });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  public loadForm2() {
    this.form2 = this.fb.group({
      observaciones: new FormControl(''),
      actoAdministrativo: new FormControl(''),
      soporteActoAdministrativo: new FormControl(''),
      fechaActoAdministrativo: new FormControl(''),
      fechaNotificacionActoAdministrativo: new FormControl(''),
    });
  }

  get f2() {
    return this.form2.controls;
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
    // filtrar las convocatorias activas
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

  public async loadDataByConvocatoria(pConvocatoria: any, validateSize: boolean = false) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.alertService.loading();

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
      const convocatoryCurrent = (await this.convService.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;
      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }

      const idConvocatoria = pConvocatoria.value;
      this.lstTable = (await this.vacanteService.getInscripcionesByConvocatoria(idConvocatoria).toPromise() as any).datos as VacanteModel[];
      this.lstVacantesByConvocatoria = (await this.vacanteService.getObtenerVacantesByConvocatoria(idConvocatoria).toPromise() as any).datos as VacanteModel[];


      if (this.lstTable && this.lstTable.length > 0) {
        this.lstTable.forEach(v => {
          if (v.inscritos) {
            v.totalInscritos = v.inscritos.length;
          } else if (v.inscritos === null) {
            v.totalInscritos = 0;
          }

          v.detallePerfilModel = JSON.parse(v.detallePerfil);

          const situacionAct = LST_SITUACIONES_VACANTE.find(sv => sv.estado === v.estadoVacante);
          if (situacionAct) {
            v.situacionActualVacante = situacionAct.vacante + this.lang;
          }
        });
      }

    } else {
      this.lstTable = [];
    }
    this.dataSource.data = this.lstTable;
    this.alertService.close();

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

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

    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public mostrarAspirantesVacante(element: any) {
    this.vacanteCurrent = Constants.cloneObject(element);
    let nombreCargo = '';
    nombreCargo = element.detallePerfilModel.cargoHumanoModel ? element.detallePerfilModel.cargoHumanoModel.cargo : element.detallePerfilModel.cargoModel.cargo;
    let codigoAlterno = '';
    codigoAlterno = element.detallePerfilModel.codigoAlterno ? element.detallePerfilModel.codigoAlterno : '';
    this.infoVacante = nombreCargo + ' - ' + codigoAlterno;
    let lstAspirantesVacantes: any[] = [];
    lstAspirantesVacantes = element.inscritos;
    if (lstAspirantesVacantes && lstAspirantesVacantes.length > 0) {
      if (element.documentoUsuarioPosesion && element.nombreUsuarioPosesion) {
        lstAspirantesVacantes.forEach(x => {
          if (x.numeroDocumento === element.documentoUsuarioPosesion) {
            x.observaciones = 'Aspirante en posesión';
          }
        });
      }
      lstAspirantesVacantes.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
      this.dataSourceInfo.data = lstAspirantesVacantes;
    }

    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public getReporteAspirantesSedes() {
    this.submit = true;

    this.alertService.loading();
    this.reporteServ.getAspirantesSedes(this.f.idConvocatoria.value, this.lang)
      .toPromise()
      .then((resReporte: Blob) => {
        this.downloadBlob(resReporte, 'reporte');
        this.alertService.close();
        this.submit = false;
      })
      .catch(erro => {
        this.alertService.showError(erro);
        this.submit = false;
      });
  }

  public showDialogDetallePosesion(element: any) {

    this.elementCurrent = Constants.cloneObject(element);

    this.idSoporte.setValidators([Validators.required]);
    this.fechaPosesion.setValidators([Validators.required]);
    this.idSoporte.updateValueAndValidity();
    this.fechaPosesion.updateValueAndValidity();

    this.dialogRefInfo2 = this.dialogService.open(this.dialogInfo2);
    this.dialogRefInfo2.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public modificarEstadoVacantePosesion() {
    if (this.idSoporte.value && this.fechaPosesion.value) {
      this.submit = true;
      this.dialogRefInfo2.close();
    } else {
      this.submit = false;
      return;
    }

    this.alertService.comfirmation(this.ct.MSG_POSESION_ASPIRANTE_CONFIRMACION, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();
          const nombreAspirante = [
            this.elementCurrent.primerNombre,
            this.elementCurrent.segundoNombre,
            this.elementCurrent.primerApellido,
            this.elementCurrent.segundoApellido,
          ].join(' ');

          const data: any = {
            id: this.vacanteCurrent.id,
            documentoUsuarioPosesion: this.elementCurrent.numeroDocumento,
            nombreUsuarioPosesion: nombreAspirante,
            idSoportePosesion: '',
            fechaPosesion: this.fechaPosesion.value,
            esTraslado: 0
          }

          const file = (<FileInput>this.idSoporte.value).files[0];
          const params = {
            NombreSoporte: Constants.generateNameFile(file.name, 'Posesion', modulesSoports.INSCRIPCION_VACANTES, documentsType.SOPORTE, this.commonService.getDateString()),
            Modulo: modulesSoports.INSCRIPCION_VACANTES,
            NombreAuxiliar: file.name,
            idUsuarioModificacion: this.user.id
          }
          const documentFile: any = await this.fService.postFile(file, params).toPromise();
          data.idSoportePosesion = documentFile.id;

          this.vacanteService.modificarEstadoVacantePosesion(data).toPromise()
            .then(ok => {
              this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
                .then(async () => {
                  const msg = `
                    Estimado aspirante ${nombreAspirante}
                    <br /><br />
                    A continuación, encontrará información del estado del proceso al cual aplicó en el CARJUD-APP.
                    <br /><br />
                    Nombre del cargo: ${this.vacanteCurrent.detallePerfilModel.cargoHumanoModel ? this.vacanteCurrent.detallePerfilModel.cargoHumanoModel.cargo : this.vacanteCurrent.detallePerfilModel.cargoModel.cargo}<br />
                    Grado cargo: ${this.vacanteCurrent.detallePerfilModel.idGradoCargo}<br />
                    Nombre de la convocatoria: ${this.vacanteCurrent.nombreConvocatoria}<br />
                    Número de la convocatoria: ${this.vacanteCurrent.numeroConvocatoria}<br />
                    Estado aspirante: En proceso de posesión
                    <br /><br />
                    Por favor conservar el correo.
                    <br />`;

                  const newNotificacion: NotificacionModel = {
                    asunto: 'Posesion aspirante a vacante',
                    mensaje: msg,
                    esLeido: 0,
                    idUsuarioDestinatario: this.elementCurrent.idUsuarioInscrito,
                    idUsuarioRemitente: this.user.id,
                    idEmpresa: this.vacanteCurrent.idEmpresa,
                    idConvocatoria: this.vacanteCurrent.idConvocatoria,
                    copiaACorreo: 1
                  };
                  this.commonService.saveNotificacion(newNotificacion).toPromise()
                    .then(async () => {
                      const idEstadoAspiranteVinculado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ELEGIDO));
                      const itemActualizar: any = {
                        idConvocatoriaPerfil: this.vacanteCurrent.idConvocatoriaPerfil,
                        idConvocatoria: this.vacanteCurrent.idConvocatoria,
                        idUsuario: this.elementCurrent.idUsuarioInscrito,
                        idUsuarioModificacion: this.user.id,
                        idEstado: idEstadoAspiranteVinculado.valor
                      };

                      this.commonService.actualizarEstadoAspiranteByUsuarioConvocatoriaPerfil(itemActualizar).toPromise()
                        .then(() => {
                          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES);
                          this.scrollTop();
                        }).finally(() => {
                          this.submit = false;
                          this.vacanteCurrent = {};
                          this.closeDialogInfo();
                          this.closeDialogInfo2();
                        });
                    });
                })
            }).catch(e => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => {
                  this.submit = false;
                  this.vacanteCurrent = {};
                });
            });
        }
      }).catch((err: any) => {
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  public openDialogObservaciones(element: any) {
    this.elementCurrent = Constants.cloneObject(element);
    /* this.observaciones.setValidators([Validators.required]);
    this.observaciones.updateValueAndValidity(); */

    this.dialogRefInfo3 = this.dialogService.open(this.dialogInfo3);
    this.dialogRefInfo3.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public eliminarDeLista() {
    this.alertService.comfirmation(this.ct.MSG_CONFIRMACION_ELIMINAR_ASPIRANTE_DE_LISTA, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

          const data: any = {
            // id: this.elementCurrent.id,
            observacion: this.f2.observaciones.value,
            actoAdministrativo: this.f2.actoAdministrativo.value,
            idSoporteActoAdministrativo: '',
            fechaActoAdministrativo: this.f2.fechaActoAdministrativo.value,
            fechaNotificacionActoAdministrativo: this.f2.fechaNotificacionActoAdministrativo.value
          }

          if (this.f2.soporteActoAdministrativo.value) {
            const file = (<FileInput>this.f2.soporteActoAdministrativo.value).files[0];
            const params = {
              NombreSoporte: Constants.generateNameFile(file.name, 'EliminarDeLista', modulesSoports.INSCRIPCION_VACANTES, documentsType.SOPORTE, this.commonService.getDateString()),
              Modulo: modulesSoports.CONVOCATORIA,
              NombreAuxiliar: file.name,
              idUsuarioModificacion: this.user.id
            }
            const documentFile: any = await this.fService.postFile(file, params).toPromise();
            data.idSoporteActoAdministrativo = documentFile.id;
          }

          this.vacanteService.eliminarDeLista(this.elementCurrent.id, data.observacion).toPromise()
            .then(ok => {
              this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
                .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => {
                    this.submit = false;
                    this.closeDialogInfo3();
                    this.closeDialogInfo2();
                    this.closeDialogInfo();
                  }));
            }).catch(e => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => {
                  this.submit = false;
                  this.vacanteCurrent = {};
                });
            });
        }

      }).catch((err: any) => {
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  public cambiarEstadoVacanteListaAspirantes(element: VacanteModel) {
    if (element.totalInscritos > 0 || element.inscritos.length > 0) {
      this.alertService.comfirmation(this.ct.MSG_STATUS_CHANGE_VACANCY_CONFIRMATION, TYPES.INFO)
        .then(async ok => {
          if (ok.value) {
            this.alertService.loading();
            const vacante = this.lstVacantesByConvocatoria.find(vc => vc.id === element.id);
            if (vacante && vacante.id) {
              vacante.estadoVacante = EstadoVacante.LISTA_EN_TRAMITE;
              vacante.situacionActualVacante = element.situacionActualVacante;
            }
            this.vacanteService.saveVacante(vacante).toPromise()
              .then(ok => {
                this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
                  .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                    .finally(() => this.submit = false));
              }).catch(e => {
                this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                  .finally(() => this.submit = false);
              });
          }
        }).catch((err: any) => {
          this.alertService.showError(err, this.ct.ERROR_MSG);
        });
    } else {
      this.alertService.message(this.ct.MSG_LISTA_ASPIRANTES_VACANTE_VACIA, TYPES.WARNING);
    }
  }

  public cambiarEstadoVacanteParaPublicar(element: any) {

    this.alertService.comfirmation(this.ct.MSG_STATUS_CHANGE_VACANCY_CONFIRMATION, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();
          const data: any = {
            id: element.id,
            estado: Number(EstadoVacante.PARA_PUBLICAR)
          }

          this.vacanteService.modificarEstadoVacantePorId(data.id, data.estado).toPromise()
            .then(ok => {
              this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
                .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => this.submit = false));
            }).catch(e => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      }).catch((err: any) => {
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  public liberarVacantePosesion(element: VacanteModel) {
    this.alertService.comfirmation(this.ct.MSG_LIBERAR_VACANTE_POSESION_CONFIRMATION, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();
          this.vacanteService.liberarVacanteEnPosesion(element.id).toPromise()
            .then(ok => {
              this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
                .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => this.submit = false));
            }).catch(e => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      }).catch((err: any) => {
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  public async enviarEmailAspirantes(element: any) {
    if (this.lstTable.length > 0) {
      this.submit = true;
      this.alertService.loading();
      const varMensaje = await this.commonService.getVarConfig(configMsg.MENSAJE_NOTIFICACION_VACANTES_PUBLICADAS);
      const mensajeEmail = varMensaje.valor.replace(Constants.replaceNamePortal, this.commonService.getVar(configMsg.PORTAL_NAME));

      const dataEmail: any = {
        idConvocatoria: element,
        asunto: 'Vacantes publicadas',
        mensaje: mensajeEmail
      }

      this.vacanteService.enviarCorreosAspirantes(dataEmail).toPromise()
        .then(ok => {
          this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
            .then(() => this.alertService.message(this.ct.MSG_SUCCESSFUL_MAILING_MESSAGE, TYPES.SUCCES)
              .finally(() => this.submit = false));
        }).catch(e => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        });
    } else {
      this.submit = false;
      return;
    }
  }

  public closeDialogInfo() {
    this.vacanteCurrent = {};
    this.elementCurrent = {};
    this.infoVacante = '';
    this.dialogRefInfo.close();
    this.dataSourceInfo.data = [];
  }

  public closeDialogInfo2() {
    // this.vacanteCurrent = {};
    this.fechaPosesion.setValue('');
    this.fechaPosesion.updateValueAndValidity();
    this.idSoporte.setValue('');
    this.idSoporte.updateValueAndValidity();
    this.elementCurrent = {};
    this.dialogRefInfo2.close();
    this.clearInputFile(this.inputFileView1);
    C.setValidatorFile(true, this.idSoporte, this.configFile.sizeFile);
  }

  public closeDialogInfo3() {
    this.observaciones.setValue('');
    this.observaciones.updateValueAndValidity();
    this.formV2.resetForm();
    this.dialogRefInfo3.close();
  }
}
