import { DiasHabilesVacantes } from '@app/compartido/modelos/Dias-habiles-vacantes';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, documentsType, modulesSoports, stateConvocatoria } from '@app/compartido/helpers/enums';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { MatDialog, MatDialogRef, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { FilesService } from '@app/core/servicios/files.service';
import { AcuerdoConvocatoria } from '@app/compartido/modelos/acuerdo-convocatoria';
import { FormControl, } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RptHojaVidaModel } from '@app/compartido/modelos/rpt-hoja-vida-model';
import { ReportesService } from '@app/core/servicios/reportes.service';
import { ActualizarRecalificacionModel } from '@app/compartido/modelos/actualizar-recalificacion-model';
import { SolicitudRecalificacionModel } from '@app/compartido/modelos/solicitud-recalificacion-model';
import { AcademicInformation } from '@app/compartido/modelos/academic-information';
import { Annexed } from '@app/compartido/modelos/annexed';
import { FamilyInformation } from '@app/compartido/modelos/family-information';
import { PersonalActivities } from '@app/compartido/modelos/personal-activities';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { WorkExperienceRama } from '@app/compartido/modelos/work-experience-rama';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { ObservationActivity } from '@app/compartido/modelos/observation-activity';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { Router } from '@angular/router';
import { DataService } from '@app/core/servicios/data.service';
import { Configuration } from '@app/compartido/modelos/configuration';
import { DeclinacionModel } from '@app/compartido/modelos/declinacion-model';
import { VacantesService } from '@app/core/servicios/vacantes.service';
import { InscripcionAspiranteVacanteModel } from '@app/compartido/modelos/inscripcion-aspirante-vacante-model';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-mis-convocatorias',
  templateUrl: './mis-convocatorias.component.html',
  styleUrls: ['./mis-convocatorias.component.scss']
})
export class MisConvocatoriasComponent extends BaseController implements OnInit {

  public lstInscripcionesByUsuario: InscripcionAspiranteModel[] = [];
  public lstConvocatoriaPerfil: ConvocatoriaPerfil[] = [];
  public lstConvocatory: Convocatoria[] = [];
  public lstDeclinacionesByUsuario: any[] = [];
  public lstInscripcionesVacantesByAspirante: InscripcionAspiranteVacanteModel[] = [];
  public lstInscripcionesVacantesByAspiranteConvocatoria: InscripcionAspiranteVacanteModel[] = [];

  public elementCurrent: any = {};
  public soporteCurrent: any = {};
  public inscripcionConvocatoriaCurrent: any = {};
  public rutaSafe: SafeResourceUrl;
  private pathSoportes: string;
  public disableButton = false;
  public submit = false;
  public disableAllButtonsXDecline = false;

  //#region Listas para cargar resumen Hoja de vida aspirante
  public data: any = {};
  public dataPersonal: any = {};
  public datosAprobatorios: any = {};
  public lstNameCualities: any[] = [];
  public lstKnowledgeArea: any[] = [];
  public lstEducationLevels: any[] = [];
  public lstInstitutions: any[] = [];
  public lstSectors: any[] = [];
  public lstSex: any[] = [];
  public lstRelationships: any[] = [];
  public activities: any[] = [];
  public frequencies: any[] = [];
  public lstDiscapacidades: any[] = [];
  public lstTitles: any[] = [];
  public updateDataInformationFamily: FamilyInformation[] = [];
  public updateDataPersonalActivities: PersonalActivities[] = [];
  public updateDataAcademicInformation: AcademicInformation[] = [];
  public updateDataWorkExperience: WorkExperience[] = [];
  public updateDataWorkExperienceRama: WorkExperienceRama[] = [];
  public updateDataAnnexed: Annexed[] = [];
  //#endregion

  private user = this.commonService.getVar(configMsg.USER);
  public enPosesion = false;
  public idEstadoAspiranteRegistroElegibles: Configuration;
  public aplicaRecalificacion: Configuration = null;
  public aplicaRecalificacionValor = 0;

  public convocatoria: FormControl = new FormControl({ value: '', disabled: true });
  public cargoAspirante: FormControl = new FormControl({ value: '', disabled: true });
  public observaciones: FormControl = new FormControl(''); // Control para dialogo declinar vacante

  public displayedColumns: string[] = ['nombreConvocatoria', 'cargoInscrito', 'estadoAspirante', 'fechaInscripcion', 'acuerdoConvocatoria', 'constancia', 'aclaracionesModifificaciones', 'recalificacion', 'vacantes', 'declinar'];
  public dataSource = new MatTableDataSource<any>([]);
  private dialogRef1: MatDialogRef<any, any>;
  private dialogRefInfo: MatDialogRef<any, any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dialogHVInfo', { static: true }) dialog1: TemplateRef<any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;

  constructor(
    private adminConfiService: AdministracionConfiguracionService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private convocatoriaService: ConvocatoriaService,
    private ct: CustomTranslateService,
    private cvService: CurriculumVitaeService,
    private dataService: DataService,
    private dialogService: MatDialog,
    private fileService: FilesService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private reportService: ReportesService,
    private router: Router,
    private vacantesService: VacantesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
    this.commonService.getConfigJson()
      .toPromise()
      .then((data: any) => {
        this.pathSoportes = data.soportes;
      });
    this.loadData()
      .catch(error => {
        this.alertService.showError(error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const dataCompare = [
        data.convocatoria ? data.convocatoria.nombreConvocatoria : data.convocatoria.numeroConvocatoria,
        data.convocatoria ? data.convocatoria.numeroConvocatoria : '',
        data.cargoHumano ? data.cargoHumano : data.cargo,
        data.estadoAspirante,
        data.fechaModificacion
      ];
      return C.filterTable(dataCompare, filter);
    };

  }

  public async loadData() {
    // this.idEstadoAspiranteRegistroElegibles = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_PRUEBAS)); // Carga la configuración del estado aspirante pasado como parámetro
    this.idEstadoAspiranteRegistroElegibles = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_REGISTRO_ELEGIBLES)); // Carga la configuración del estado aspirante pasado como parámetro
    this.aplicaRecalificacion = await this.commonService.getVarConfig(configMsg.APLICA_RECALIFICACION_CONVOCATORIA); // Carga la configuración para saber si aplica recalificación
    this.aplicaRecalificacionValor = Number(this.aplicaRecalificacion.valor);

    this.lstConvocatory = ((await this.convocatoriaService.getConvocatorias().toPromise() as any).datos) as Convocatoria[]; // Carga la lista de convocatorias
    const lstDiasHabilesVacante = (await this.convocatoriaService.getTodosDiasHabilesVacantes().toPromise() as any).datos as DiasHabilesVacantes[]; // Carga la lista de dias habiles para seleccionar vacante

    this.lstInscripcionesVacantesByAspirante = (await this.vacantesService.getObtenerInscripcionesUsuario(this.user.id).toPromise() as any).datos; // Carga la lista de inscripciones a vacantes del usuario actual    
    this.lstDeclinacionesByUsuario = (await this.vacantesService.getDeclinacionesByUsuario(this.user.id).toPromise() as any).datos as any[]; // Carga las declinaciones que ha realizado el usuario actual  
    this.lstInscripcionesByUsuario = (await this.commonService.getInscripcionesUsuario(this.user.id).toPromise() as any).datos; // Carga las inscripciones a Convocatorias que ha realizado el usuario actual
    if (this.lstInscripcionesByUsuario.length > 0) {
      this.lstInscripcionesByUsuario.forEach(async e => {

        this.lstConvocatory.forEach(async c => {
          if (c.id === e.idConvocatoria) {
            e.convocatoria = c;
            return;
          }
        });

        const conPerfil = (await this.convocatoriaService.getConvocatoriaPerfilById(e.idConvocatoriaPerfil).toPromise() as any).datos; // Busca convocatoriaPerfil
        if (conPerfil.id) { // Si lo encuentra, setea el objeto y también el objeto en formato json
          e.convocatoriaPerfil = conPerfil;
          e.detallePerfilModel = JSON.parse(e.convocatoriaPerfil.detallePerfil);
          if (e.detallePerfilModel.cargoHumanoModel) {
            e.cargoHumano = e.detallePerfilModel.cargoHumanoModel.cargo;
          } else {
            e.cargo = e.detallePerfilModel.cargoModel.cargo;
          }
        }

        const estadoAspiranteCon = (await this.adminConfiService.getEstadoAspiranteConvocatoriaById(e.idEstadoAspirante).toPromise() as any).datos; // Busca el estado del aspirante
        e.estadoAspirante = estadoAspiranteCon ? this.translateField(estadoAspiranteCon, 'nombreCategoria', this.lang) : ''; // Setea el nombre del estado

        let lstAgreementsByConvocatory: AcuerdoConvocatoria[] = [];
        lstAgreementsByConvocatory = (await this.convocatoriaService.getAcuerdoConvocatoriaByConvocatoria({ idConvocatoria: e.convocatoria.id }).toPromise() as any).datos as AcuerdoConvocatoria[]; // Verifica si la convocatoria tiene acuerdos
        if (lstAgreementsByConvocatory.length > 0) { // Si tiene acuerdos, los ordena por fecha de acuerdo
          lstAgreementsByConvocatory.sort((a, b) => new Date(b.fechaAcuerdo).getTime() - new Date(a.fechaAcuerdo).getTime());
          if (lstAgreementsByConvocatory.length > 1) { // Si tiene varios, selecciona el mas reciente
            e.idSoporteAclaracionesModificaciones = lstAgreementsByConvocatory[0].id;
          }
        }

        // Busca los dias habiles para inscripción a vacantes para cada convocatoria
        /* const diasHabilesVac = lstDiasHabilesVacante.find(dh => dh.idConvocatoria === e.idConvocatoria);
        if (diasHabilesVac) {
          e.fechaInicioInscripcionVacante = diasHabilesVac.fechaInicio;
          e.fechaFinInscripcionVacante = diasHabilesVac.fechaFin;
        } */
        const lstFechaSelVac: any[] = [];
        lstDiasHabilesVacante.forEach(dh => { // Recorre la lista de días habiles 
          if (dh.idConvocatoria === e.idConvocatoria) { // Si es igual al idConvocatoria, lo agrega a la lista
            lstFechaSelVac.push(dh);
          }
        });
        e.fechasSeleccionVacantes = lstFechaSelVac; // Seteamos la lista al objeto

        // Valida si el aspirante declinó en alguna convocatoria
        if (this.lstDeclinacionesByUsuario.length > 0) {
          const declinacionTemp = this.lstDeclinacionesByUsuario.find(decl => decl.idConvocatoria === e.idConvocatoria);
          if (declinacionTemp) {
            e.existeDeclinacion = true;
            e.fechaDeclinacion = declinacionTemp.fechaDeclinacion;
          } else {
            e.existeDeclinacion = false;
          }
        }

        if (this.lstInscripcionesVacantesByAspirante.length > 0) { // Si el aspirante tiene inscripciones a vacante
          const inscripcionVacanteTemp = this.lstInscripcionesVacantesByAspirante.find(insVac => insVac.idConvocatoria === e.idConvocatoria);
          if (inscripcionVacanteTemp) {
            e.tieneInscripcionAVacante = true;
          } else {
            e.tieneInscripcionAVacante = false;
          }
          /* this.lstInscripcionesVacantesByAspirante.forEach(insVac => { // Recorre la lista 
            if (insVac.idConvocatoria === e.idConvocatoria) { // Si es igual a la convocatoria actual, le setea el valor TRUE
              e.tieneInscripcionAVacante = true;
            }
          }); */
        }
      });
      this.lstInscripcionesByUsuario.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    }
    console.log('lst', this.lstInscripcionesByUsuario);
    this.dataSource.data = this.lstInscripcionesByUsuario;
  }

  public async openDialogHVInfo(element: any) {
    this.alertService.loading();
    this.elementCurrent = Constants.cloneObject(element);

    this.convocatoria.setValue(this.elementCurrent.convocatoria.nombreConvocatoria);
    const nombreCargo = this.elementCurrent.cargoHumano ? this.elementCurrent.cargoHumano : this.elementCurrent.cargo;
    this.cargoAspirante.setValue(nombreCargo);

    // Carga el resumen de la hoja de vida del usuario
    this.data = (await this.commonService.getDetailSummaryUser(this.user.id).toPromise() as any).datos;
    this.loadUserDataDetails();

    // Se crean parametros para generar el reporte del resumen del usuario
    const paramsReport: RptHojaVidaModel = {
      idUsuario: this.user.id,
      idConvocatoriaPerfil: element.idConvocatoriaPerfil,
      language: !this.lang ? 'Es' : this.lang,
      reportTitle: 'RptResumenHV',
      reportType: 'PDF',
      rptFileName: 'RptResumenHV.rdlc',
      exportExtension: 'PDF'
    };
    const nameReport = paramsReport.reportTitle + '.' + paramsReport.reportType;
    const resumen = await this.reportService.getResumenByUsuario(paramsReport).toPromise();
    const fileReport: File = this.blobToFile(resumen, paramsReport.reportTitle + paramsReport.reportType);

    // Guarda el soporte
    const params = {
      NombreSoporte: C.generateNameFile(nameReport, this.user.numeroDocumento, modulesSoports.INSCRIPCION_CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
      Modulo: modulesSoports.INSCRIPCION_CONVOCATORIA,
      NombreAuxiliar: nameReport,
      idUsuarioModificacion: this.user.id
    };

    this.soporteCurrent = {};
    const newFileReport: any = await this.fileService.postFile(fileReport, params).toPromise();
    this.soporteCurrent = newFileReport;
    if (newFileReport.id) {
      this.fileService.getInformationFilePath(newFileReport.id)
        .toPromise()
        .then(res => {
          const ruta = String(this.pathSoportes + res.path).replace('\\', '/');
          this.rutaSafe = this.sanitizer.bypassSecurityTrustResourceUrl(ruta);
        })
        .catch(err => {
          this.snackBar.open(this.ct.ARCHIVO_NO_EXISTE, this.ct.CLOSE, {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['snackbar-style']
          });
        });
    }

    this.dialogRef1 = this.dialogService.open(this.dialog1, {
      maxWidth: '90%',
      maxHeight: '90%',
    });
    this.dialogRef1.addPanelClass(['col-sm-6', 'col-md-6', 'col-lg-6']);
    this.dialogRef1.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === 'yes') {
        } else if (result === 'no') {
        }
      }
    });
  }

  public async saveRecalificacion() {
    if (this.elementCurrent.id) {
      let soporteAnterior: any = '';
      try {
        soporteAnterior = (await this.convocatoriaService.getSoporteAnterior(this.elementCurrent.idConvocatoria, this.elementCurrent.idUsuario).toPromise() as any).datos;
      } catch (e) {
        this.alertService.showError(e);
      }

      const newRecalificacion: SolicitudRecalificacionModel = {
        id: undefined,
        idConvocatoria: this.elementCurrent.idConvocatoria,
        idUsuario: this.elementCurrent.idUsuario,
        idSoporteAnterior: soporteAnterior ? soporteAnterior : this.elementCurrent.idSoporte,
        idSoporteNuevo: this.soporteCurrent.id,
        fechaSolicitud: new Date()
        // estadoSolicitado: 1,
      };

      this.alertService.comfirmation(this.ct.REQUALIFICATION_CONFIRMATION, TYPES.INFO)
        .then(ok => {
          if (ok.value) {
            this.alertService.loading();
            this.convocatoriaService.saveSolicitudRecalificacion(newRecalificacion)
              .subscribe(
                (record: any) => {
                  const actualizarRecalificacion: ActualizarRecalificacionModel = {
                    idConvocatoria: this.elementCurrent.idConvocatoria,
                    idUsuario: this.elementCurrent.idUsuario,
                    idSolicitudRecalificacion: record.id,
                    resumenRecalificacionHV: JSON.stringify(this.data),
                    idSoporteRecalificacionHV: record.idSoporteNuevo
                  };

                  this.commonService.actualizarRecalificacion(actualizarRecalificacion)
                    .subscribe(r2 => {
                      this.alertService.message(this.ct.MSG_RECLASSIFICATION_SUCCESSFUL, TYPES.SUCCES);
                      this.clean();
                    }, err => {
                      this.alertService.showError(err);
                    });
                }, err => {
                  this.alertService.showError(err);
                }
              );
          }
        });
    } else {
      return;
    }
  }

  public verifyActionRecalificacion(element: InscripcionAspiranteModel) {
    const btnStates = {
      btnRecalificacion: false,
      btnInactive: true,
    };

    if (element.convocatoria.estadoConvocatoria === stateConvocatoria.CERRADA) {
      btnStates.btnRecalificacion = false;
      btnStates.btnInactive = true;
      this.disableButton = true;
      return btnStates;
    }

    const today = new Date().toISOString().split('T')[0];
    const lstFechasRecalificacion: any[] = element.fechasRecalificacion;
    if (lstFechasRecalificacion.length > 0) {
      lstFechasRecalificacion.forEach(e => {
        const fechaInicio = new Date(e.fechaInicio).toISOString().split('T')[0];
        const fechaFin = new Date(e.fechaFin).toISOString().split('T')[0];
        if ((today >= fechaInicio && today <= fechaFin) && (element.idEstadoAspirante === this.idEstadoAspiranteRegistroElegibles.valor || element.pasaListaElegibles === 1)) {
          btnStates.btnRecalificacion = true;
          btnStates.btnInactive = false;
          this.disableButton = false;
        } else {
          btnStates.btnRecalificacion = false;
          btnStates.btnInactive = true;
          this.disableButton = true;
        }
      });
    } else {
      btnStates.btnRecalificacion = false;
      btnStates.btnInactive = true;
      this.disableButton = true;
    }
    return btnStates;
  }

  public verifyActionVacantes(element: InscripcionAspiranteModel) {
    const btnStates = {
      btnActive: true,
      btnInactive: false,
    };

    if (element.convocatoria.estadoConvocatoria === stateConvocatoria.CERRADA) {
      btnStates.btnActive = false;
      btnStates.btnInactive = true;
      this.disableButton = true;
      return btnStates;
    }

    if (element.existeDeclinacion) {
      btnStates.btnActive = false;
      btnStates.btnInactive = true;
      this.disableButton = true;
      return btnStates;
    }

    if (element.fechasSeleccionVacantes) {
      const lstFechasSeleccionVacante: any[] = element.fechasSeleccionVacantes;
      if (lstFechasSeleccionVacante.length > 0) {
        lstFechasSeleccionVacante.forEach(sv => {
          const fechaInicio = new Date(sv.fechaInicio).toISOString().split('T')[0];
          const fechaFin = new Date(sv.fechaFin).toISOString().split('T')[0];
          const today = new Date().toISOString().split('T')[0];

          if ((today >= fechaInicio && today <= fechaFin) && element.enPosesion === 0 && element.pasaListaElegibles === 1) {
            btnStates.btnActive = true;
            btnStates.btnInactive = false;
            this.disableButton = false;

          } else {
            btnStates.btnActive = false;
            btnStates.btnInactive = true;
            this.disableButton = true;
          }
        });
      } else {
        btnStates.btnActive = false;
        btnStates.btnInactive = true;
        this.disableButton = true;
      }
    } else {
      btnStates.btnActive = false;
      btnStates.btnInactive = true;
      this.disableButton = true;
    }
    return btnStates;
  }

  public verifyActionsDeclinar(element: InscripcionAspiranteModel) {
    const btnStates = {
      btnInactive: false,
      btnActive: false,
      btnDate: false
    };

    if (element.convocatoria.estadoConvocatoria === stateConvocatoria.CERRADA) {
      btnStates.btnInactive = true;
      btnStates.btnActive = false;
      this.disableButton = true;
      return btnStates;
    }

    if (element.existeDeclinacion) {
      btnStates.btnActive = false;
      btnStates.btnDate = true;
      this.disableButton = true;
      return btnStates;
    }

    if (element.tieneInscripcionAVacante) {
      btnStates.btnInactive = false;
      btnStates.btnActive = true;
      this.disableButton = false;
    } else {
      btnStates.btnInactive = true;
      btnStates.btnActive = false;
      this.disableButton = true;
    }
    return btnStates;
  }

  public declinarAVacante(element: InscripcionAspiranteModel) {
    this.inscripcionConvocatoriaCurrent = Constants.cloneObject(element);
    this.lstInscripcionesVacantesByAspiranteConvocatoria = this.lstInscripcionesVacantesByAspirante.filter(insVac => insVac.idConvocatoria === element.idConvocatoria);
    this.alertService.comfirmation(this.ct.MSG_DECLINAR_VACANTE_CONFIRMACION, TYPES.WARNING)
      .then(ok => {
        if (ok.value) {
          this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
          this.dialogRefInfo.addPanelClass(['col-sm-10', 'col-md-6']);
        }
      }).catch(e => {
        this.alertService.showError(e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
      });
  }

  public saveDeclinacion() {
    if (this.lstInscripcionesVacantesByAspiranteConvocatoria.length > 0) {
      this.alertService.loading();
      const lst: Observable<any>[] = [];
      this.lstInscripcionesVacantesByAspiranteConvocatoria.forEach(insVac => {
        const newDeclinacion: DeclinacionModel = {
          idConvocatoria: this.inscripcionConvocatoriaCurrent.idConvocatoria,
          idUsuarioInscrito: this.user.id,
          idVacante: insVac.idVacante,
          observacion: this.observaciones.value ? this.observaciones.value : '',
          idUsuarioModificacion: this.user.id
        }
        lst.push(this.vacantesService.saveDeclinacion(newDeclinacion));
      });

      forkJoin(lst).subscribe({
        next: (res: any) => {
          this.loadData()
            .then(() => this.alertService.message(this.ct.MSG_DECLINACION_EXITOSA, TYPES.SUCCES)
              .finally(() => {
                this.submit = false;
                this.closeDialogInfo();
              }));
        }, error: e => {
          this.alertService.showError(e);
          this.submit = false;
        }
      });
    }
  }

  public verVacantes(element: InscripcionAspiranteModel) {
    this.dataService.vacantesData = element;
    this.router.navigate(['convocatorias-aspirante', 'opcion-sedes']);
  }

  public viewFile(element: any) {
    if (!element.convocatoria) {
      return;
    }
    this.fileService.downloadFile(element.convocatoria.idSoporteAcuerdo).subscribe(
      res => {
        const blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        this.alertService.showError(error);
      }
    );
  }

  public viewFileContancia(element: any) {
    if (!element.convocatoria) {
      return;
    }
    this.fileService.downloadFile(element.idSoporte).subscribe(
      res => {
        const blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        this.alertService.showError(error);
      }
    );
  }

  /**
   * Función que se encarga de carga todos los detalles del usuario actual.
   */
  public async loadUserDataDetails() {
    try {
      this.dataPersonal = this.data.datosPersonales;

      // cargar listas
      this.lstNameCualities = this.ct.lstNameCualities();
      this.lstSex = (await this.commonService.getSex().toPromise() as any).datos;
      this.lstDiscapacidades = (await this.commonService.getDiscapacidad().toPromise() as any).datos;

      const muniCorrespondence: any = this.dataPersonal.idCiudadCorrespondencia ? (await this.commonService.getCityById(this.dataPersonal.idCiudadCorrespondencia).toPromise() as any).datos : '';
      const departmentCorrespondence: any = muniCorrespondence.idDepartamento ? (await this.commonService.getDepartmentById(muniCorrespondence.idDepartamento).toPromise() as any).datos : '';

      this.dataPersonal.ciudadResidencia = muniCorrespondence;
      this.dataPersonal.departamentoResidencia = departmentCorrespondence;

      const muniBirthdate: any = this.dataPersonal.idLugarNacimiento ? (await this.commonService.getCityById(this.dataPersonal.idLugarNacimiento).toPromise() as any).datos : '';
      const departmentBirthdate: any = muniBirthdate.idDepartamento ? (await this.commonService.getDepartmentById(muniBirthdate.idDepartamento).toPromise() as any).datos : '';

      this.dataPersonal.ciudadNacimiento = muniBirthdate;
      this.dataPersonal.departamentoNacimiento = departmentBirthdate;

      const muniExpideDocument: any = this.dataPersonal.idLugarExpedicionDocumento ? (await this.commonService.getCityById(this.dataPersonal.idLugarExpedicionDocumento).toPromise() as any).datos : '';
      const departmentExpideDocument: any = muniExpideDocument.idDepartamento ? (await this.commonService.getDepartmentById(muniExpideDocument.idDepartamento).toPromise() as any).datos : '';

      this.dataPersonal.ciudadExpedicionDocumento = muniExpideDocument;
      this.dataPersonal.departamentoExpedicionDocumento = departmentExpideDocument;

      const typeIdenti: string = this.dataPersonal.idTipoDocumento ? (await this.commonService.getTypesIdentificationById(this.dataPersonal.idTipoDocumento).toPromise() as any).datos.tipoDocumento : '';
      const relationshipEmergencyContact: string = this.dataPersonal.idParentesco ? this.translateField((await this.commonService.getRelationshipById(this.dataPersonal.idParentesco).toPromise() as any).datos, 'parentesco', this.lang) : '';

      this.dataPersonal.tipoDocumentoId = typeIdenti;
      this.dataPersonal.parentezcoContantoEmergencia = relationshipEmergencyContact;

      if (this.dataPersonal.soporteIdentificacion) {
        this.dataPersonal.detailFileIdentification = (await this.fileService.getInformationFile(this.dataPersonal.soporteIdentificacion).toPromise() as any).datos;
      }
      if (this.dataPersonal.soporteLibretaMilitar) {
        this.dataPersonal.detailFileMilitarydCard = (await this.fileService.getInformationFile(this.dataPersonal.soporteLibretaMilitar).toPromise() as any).datos;
      }

      this.dataPersonal.soporteId = C.validateData(this.dataPersonal.detailFileIdentification) ? this.dataPersonal.detailFileIdentification.nombreAuxiliar : undefined;
      this.dataPersonal.soporteLibretaMil = C.validateData(this.dataPersonal.detailFileMilitarydCard) ? this.dataPersonal.detailFileMilitarydCard.nombreAuxiliar : undefined;

      // cargar listas
      this.lstRelationships = (await this.commonService.getRelationship().toPromise() as any).datos;
      this.activities = (await this.commonService.getPersonalActivity().toPromise() as any).datos;
      this.frequencies = (await this.commonService.getFrecuentlyActivity().toPromise() as any).datos;
      this.lstEducationLevels = (await this.commonService.getLevelStudy().toPromise() as any).datos;
      const c: any[] = [];
      this.lstEducationLevels.forEach((e, i) => {
        c[i] = e.nivelEstudio + ' - ' + e.codTipoEstudio;
      });
      this.lstInstitutions = (await this.commonService.getInstitutions().toPromise() as any).datos;
      this.lstKnowledgeArea = (await this.commonService.getAreaKnowledge().toPromise() as any).datos;
      this.lstSectors = (await this.commonService.getSectorExperience().toPromise() as any).datos;
      this.lstTitles = (await this.commonService.getTitulos().toPromise() as any).datos;

      /* INFORMACIÓN FAMILIAR */
      this.updateDataInformationFamily = (await this.cvService.getFamilyInformation(this.user.id).toPromise() as any).datos as FamilyInformation[];

      if (this.updateDataInformationFamily.length > 0) {
        this.updateDataInformationFamily.forEach(e => {
          this.lstSex.forEach(g => {
            if (e.idSexo === g.id) {
              // e.sex = g.sexo;
              e.sex = this.translateField(g, 'sexo', this.lang);
              return;
            }
          });
          this.lstRelationships.forEach(r => {
            if (e.idParentesco === r.id) {
              // e.relationship = r.parentesco + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              e.relationship = this.translateField(r, 'parentesco', this.lang) + (r.parentesco === 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              return;
            }
          });
        });
        this.data.infoFamiliar = this.updateDataInformationFamily;
      }

      /* ACTIVIDADES PERSONALES */
      this.updateDataPersonalActivities = (await this.cvService.getActivityInformationByUser(this.user.id).toPromise() as any).datos as PersonalActivities[];
      const oTemp = (await this.cvService.getObervatioActivityInformationByUser(this.user.id).toPromise() as any).datos as ObservationActivity[];

      if (oTemp.length > 0) {
        const observationTemp: ObservationActivity = oTemp[0];
      }

      if (this.updateDataPersonalActivities.length > 0) {
        this.updateDataPersonalActivities.forEach(e => {
          this.activities.forEach(g => {
            if (e.idActividadPersonal === g.id) {
              // e.activity = g.actividadPersonal;
              e.activity = this.translateField(g, 'actividadPersonal', this.lang);
              return;
            }
          });
          this.frequencies.forEach(r => {
            if (e.idFrecuencia === r.id) {
              // e.frecuently = r.frecuenciaActividad;
              e.frecuently = this.translateField(r, 'frecuenciaActividad', this.lang);
              return;
            }
          });
        });
        this.data.infoActividadesPersonales = this.updateDataPersonalActivities;
      }

      /* INFORMACION ACADEMICA */
      this.updateDataAcademicInformation = (await this.cvService.getAcademicInformation(this.user.id).toPromise() as any).datos as AcademicInformation[];
      if (this.updateDataAcademicInformation.length > 0) {
        this.updateDataAcademicInformation.forEach(e => {

          this.lstKnowledgeArea.forEach(g => {
            if (e.idAreaConocimiento === g.id) {
              e.areaKnowledge = this.translateField(g, 'areaConocimiento', this.lang);
              return;
            }
          });

          this.lstEducationLevels.forEach(g => {
            if (e.idNivelEstudio === g.id) {
              e.educationLevel = this.translateField(g, 'nivelEstudio', this.lang);
              return;
            }
          });
          this.lstInstitutions.forEach(r => {
            if (e.idInstitucion === r.id) {
              e.institution = this.translateField(r, 'institucion', this.lang);
              return;
            }
          });
          this.lstTitles.forEach(r => {
            if (e.idTipoTituloObtenido === r.id) {
              e.tipoTituloObtenido = this.translateField(r, 'titulo', this.lang);
              return;
            }
          });
        });
        this.data.infoAcademica = this.updateDataAcademicInformation;
      }

      /* EXPERIENCIA LABORAL FUERA DE LA RAMA JUDICIAL */
      this.updateDataWorkExperience = (await this.cvService.getWorkExperience(this.user.id).toPromise() as any).datos as WorkExperience[];
      this.updateDataWorkExperience.sort((a: WorkExperience, b: WorkExperience) => {
        return this.getTime(new Date(b.fechaIngreso)) - this.getTime(new Date(a.fechaIngreso));
      });
      if (this.updateDataWorkExperience.length > 0) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.updateDataWorkExperience.length; i++) {
          const cityTemp = (await this.commonService.getCityById(this.updateDataWorkExperience[i].idCiudad).toPromise() as any).datos;
          this.updateDataWorkExperience[i].municipality = cityTemp.ciudad;
          this.lstSectors.forEach(g => {
            if (this.updateDataWorkExperience[i].idSectorExperiencia === g.id) {
              this.updateDataWorkExperience[i].sector = g.sectorExperiencia;
              return;
            }
          });
        }
        this.data.infoExpLaboral = this.updateDataWorkExperience;
      }

      // Experiencia Laboral En la Rama Judicial
      this.updateDataWorkExperienceRama = (await this.cvService.getWorkExperienceRama(this.user.id).toPromise() as any).datos as WorkExperienceRama[];
      if (this.updateDataWorkExperienceRama.length > 0) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.updateDataWorkExperienceRama.length; i++) {
          const cityTemp = (await this.commonService.getCityById(this.updateDataWorkExperienceRama[i].idCiudad).toPromise() as any).datos;
          this.updateDataWorkExperienceRama[i].municipality = cityTemp.ciudad;
          this.lstNameCualities.forEach(g => {
            if (this.updateDataWorkExperienceRama[i].calidadNombramiento === g.id) {
              this.updateDataWorkExperienceRama[i].nameQuality = g.text;
              return;
            }
          });
        }
        this.data.infoExpLaboralRama = this.updateDataWorkExperienceRama;
      }

      // Anexos
      const lstTypeFileAnnexed = (await this.commonService.getTypeFileAnnexed().toPromise() as any).datos as TypeFileAnnexed[];
      this.updateDataAnnexed = (await this.cvService.getAnnexesByUser(this.user.id).toPromise() as any).datos as Annexed[];
      if (this.updateDataAnnexed.length > 0) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.updateDataAnnexed.length; i++) {
          lstTypeFileAnnexed.forEach(g => {
            if (this.updateDataAnnexed[i].idTipoArchivo === g.id) {
              this.updateDataAnnexed[i].nameTypeFile = g.tipoArchivo;
              return;
            }
          });
        }
        this.data.anexos = this.updateDataAnnexed;
      }
      this.alertService.close();
      return this.data;
    } catch (error) {
      this.alertService.showError(error);
    }
  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    const b: any = theBlob;
    // A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    // Cast to a File() type
    return theBlob as File;
  }

  private getTime(date?: Date) {
    return date != null ? date.getTime() : 0;
  }

  public clean() {
    this.elementCurrent = {};
    this.convocatoria.setValue('');
    this.cargoAspirante.setValue('');
    this.dialogRef1.close();
  }

  public closeDialogInfo() {
    this.inscripcionConvocatoriaCurrent = {};
    this.observaciones.setValue('');
    this.observaciones.setValidators([]);
    this.observaciones.updateValueAndValidity();
    this.dialogRefInfo.close();
  }
}
