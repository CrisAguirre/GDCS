import { Cronograma } from '@app/compartido/modelos/cronograma';
import { ReportesService } from '@app/core/servicios/reportes.service';
import { FavoritoConvocatoriaModel } from '@app/compartido/modelos/favorito-convocatoria-model';
import { PerfilPorConvocatoriaModel } from '@app/compartido/modelos/perfil-por-convocatoria-model';
import { Router } from '@angular/router';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, TemplateRef, AfterViewChecked } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialogRef, MatDialog } from '@angular/material';
import { DataService } from '@app/core/servicios/data.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';
import { Constants as C } from '@app/compartido/helpers/constants';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { PerfilService } from '@app/core/servicios/perfil.service';
import { configMsg, documentsType, modulesSoports } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { DatePipe } from '@angular/common';
import { FilesService } from '@app/core/servicios/files.service';
import { FamilyInformation } from '@app/compartido/modelos/family-information';
import { PersonalActivities } from '@app/compartido/modelos/personal-activities';
import { AcademicInformation } from '@app/compartido/modelos/academic-information';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { WorkExperienceRama } from '@app/compartido/modelos/work-experience-rama';
import { Annexed } from '@app/compartido/modelos/annexed';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { ObservationActivity } from '@app/compartido/modelos/observation-activity';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { DataPersonal } from '@app/compartido/modelos/data-personal';
import { RptHojaVidaModel } from '@app/compartido/modelos/rpt-hoja-vida-model';
import { ConvocatoryActivity } from '@app/compartido/modelos/convocatory-activity';
import { Configuration } from '@app/compartido/modelos/configuration';

@Component({
  selector: 'app-cargos-convocatoria',
  templateUrl: './cargos-convocatoria.component.html',
  styleUrls: ['./cargos-convocatoria.component.scss']
})
export class CargosConvocatoriaComponent extends BaseController implements OnInit, AfterViewChecked {

  @Input() idConvocatoria: string;
  public lstProfilesByConvocatory: PerfilPorConvocatoriaModel[] = [];
  public lstTipoLugar: TypePlace[] = [];
  public lstTipoDependenciaHijasAll: TipoDependenciaHija[] = [];
  public lstInscripcionesByUsuario: InscripcionAspiranteModel[] = [];
  public lstActivities: ConvocatoryActivity[] = [];
  public lstCronogramaConvocatoria: Cronograma[] = [];

  public fechaInicioIns: string;
  public fechaFinIns: any;
  public profileCurrent: any = {};
  public elementCurrent: any = {};
  public convocatoryCurrent: any = {};
  public idConvocatoryCurrent = '';
  public subtitle = '';
  public disableButton = false;

  private user = this.commonService.getVar(configMsg.USER);
  public data: any = {};
  public dataPersonal: any = {};
  public datosAprobatorios: any = {};

  /* Listas para cargar resumen Hoja de vida aspirante */
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

  public idPeriodoInscripcionConvocatoria: Configuration;
  public lstFechasInscripcion: Cronograma[] = [];

  public form: FormGroup;
  // public displayedColumns: string[] = ['codCargo', 'cargo', 'grado', 'tipoDependencia', 'dependenciaLugar', 'nCargos', 'cierreInscripcion', 'perfil', 'fav', 'options'];
  public displayedColumns: string[] = ['codCargo', 'cargo', 'grado', 'tipoDependencia', 'dependenciaLugar', 'cierreInscripcion', 'perfil', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  private dialogRef1: MatDialogRef<any, any>;
  @ViewChild('dialogProfileInfo', { static: true }) dialog1: TemplateRef<any>;

  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private adminConvocatoryService: AdministracionConvocatoriaService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private convocatoryServices: ConvocatoriaService,
    private ct: CustomTranslateService,
    private dataService: DataService,
    private dialogService: MatDialog,
    private perfilService: PerfilService,
    private reportService: ReportesService,
    private router: Router,

    private datePipe: DatePipe,
    private fileService: FilesService,
    private cvService: CurriculumVitaeService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
    this.idConvocatoryCurrent = this.dataService.serviceData;
    if (this.idConvocatoryCurrent === undefined) {
      this.router.navigate(['convocatorias-aspirante', 'inscripcion-convocatoria']);
      return;
    }
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const dataCompare = [
        data.detallePerfilModel.cargoHumanoModel ? data.detallePerfilModel.cargoHumanoModel.codCargo : data.detallePerfilModel.cargoModel.codAlterno,
        data.detallePerfilModel.cargoHumanoModel ? data.detallePerfilModel.cargoHumanoModel.cargo : data.detallePerfilModel.cargoModel.cargo,
        data.detallePerfilModel.cargoHumanoModel ? data.detallePerfilModel.cargoHumanoModel.cargoNivel : data.detallePerfilModel.cargoModel.nivelJerarquico,
        data.detallePerfilModel.tipoLugar ? data.detallePerfilModel.tipoLugar.lugar : '',
        data.detallePerfilModel.dependenciaHija ? data.detallePerfilModel.dependenciaHija.nombre : ''
      ];
      return C.filterTable(dataCompare, filter);
    };
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadData() {
    this.convocatoryCurrent = (await this.convocatoryServices.getConvocatoriaById(this.idConvocatoryCurrent).toPromise() as any).datos as Convocatoria;

    this.idPeriodoInscripcionConvocatoria = (await this.commonService.getVarConfig(configMsg.ID_PERIODO_INSCRIPCION_CONVOCATORIA));

    /* Subtitulo de la vista con el nombre de la convocatoria seleccionada */ 
    this.subtitle = this.convocatoryCurrent.nombreConvocatoria;

    this.lstActivities = (await this.adminConvocatoryService.getActividadConvocatoria().toPromise() as any).datos as ConvocatoryActivity[];

    this.lstCronogramaConvocatoria = (await this.convocatoryServices.getCronogramaByConvocatory(this.convocatoryCurrent.id).toPromise() as any).datos;
    if (this.lstCronogramaConvocatoria.length > 0) {
      this.lstCronogramaConvocatoria.forEach(c => {

        this.lstActivities.forEach(a => {
          if (c.idActividadConvocatoria === a.id) {
            c.actividadaConvocatoria = this.translateField(a, 'actividadConvocatoria', this.lang);
          }
        });

        if (c.actividadaConvocatoria.toLowerCase().includes('inscripciones')  || this.idPeriodoInscripcionConvocatoria.valor === c.idActividadConvocatoria) {
          this.lstFechasInscripcion.push(c);
          if (c.esProrroga) {
            this.fechaInicioIns = c.fechaInicial;
            this.fechaFinIns = c.fechaFinal;
          } else {
            this.fechaInicioIns = c.fechaInicial;
            this.fechaFinIns = c.fechaFinal;
          }
        }
      });
    }

    /* Se carga la lista con los tipos lugar */
    this.lstTipoLugar = (await this.adminConvocatoryService.getTipoLugar().toPromise() as any).datos;

    /* Lista de dependecias hijas */
    this.lstTipoDependenciaHijasAll = (await this.adminConvocatoryService.getTipoDependenciaHija().toPromise() as any).datos;

    /* Lista de favoritos por convocatoria y usuario */
    let lstFavorite: FavoritoConvocatoriaModel[] = [];
    lstFavorite = (await this.convocatoryServices.getListarByConvocatoriaUsuario(this.convocatoryCurrent.id, this.user.id).toPromise() as any).datos;

    this.lstInscripcionesByUsuario = (await this.commonService.getInscripcionesUsuario(this.user.id).toPromise() as any).datos;

    /* Lista de perfiles por convocatoria */
    this.lstProfilesByConvocatory = (await this.convocatoryServices.getPerfilesByConvocatoria(this.idConvocatoryCurrent).toPromise() as any).datos;
    if (this.lstProfilesByConvocatory.length > 0) {
      this.lstProfilesByConvocatory.forEach(async e => {

        e.cierreInscripciones = this.fechaFinIns;

        e.detallePerfilModel = JSON.parse(e.detallePerfil);
        e.iconoFavorito = 'star_border';
        e.idFavoritoConvocatoria = null;
        e.esFavorito = 0;

        if (!e.detallePerfilModel.tipoLugar && e.detallePerfilModel.idTipoLugar) {
          const tipoLugarTemp = this.lstTipoLugar.find(c => e.detallePerfilModel.idTipoLugar === c.id);
          if (tipoLugarTemp) {
            e.detallePerfilModel.tipoLugar = tipoLugarTemp;
          }
        }

        if (!e.detallePerfilModel.dependenciaHija && e.detallePerfilModel.idTipoDependenciaHija) {
          const dependenciaTemp = this.lstTipoDependenciaHijasAll.find(d => e.detallePerfilModel.idTipoDependenciaHija === d.id);
          if (dependenciaTemp) {
            e.detallePerfilModel.dependenciaHija = dependenciaTemp;
          }
        }

        lstFavorite.forEach(c => {
          if (e.idConvocatoriaPerfil === c.idConvocatoriaPerfil) {
            e.esFavorito = 1;
            e.idFavoritoConvocatoria = c.id;
            e.iconoFavorito = 'star';
            return;
          }
        });

        if (this.lstInscripcionesByUsuario.length > 0) {
          this.lstInscripcionesByUsuario.forEach(c => {
            if (c.idConvocatoria === e.idConvocatoria && c.idConvocatoriaPerfil === e.idConvocatoriaPerfil) {
              e.tieneInscripciones = 1;
            }
          });
        }

      });
    }
    this.lstProfilesByConvocatory.sort((a, b) => b.esFavorito - a.esFavorito);
    this.dataSource.data = this.lstProfilesByConvocatory;
  }

  public async openDialogProfileInfo(idPerfil: any) {
    this.profileCurrent = (await this.perfilService.getInformacionPorPerfil(idPerfil).toPromise() as any).datos;
    this.dialogRef1 = this.dialogService.open(this.dialog1, {
      maxWidth: '90%',
      maxHeight: '90%',
    });
    this.dialogRef1.addPanelClass(['col-sm-12', 'col-md-6', 'col-lg-6']);
    this.dialogRef1.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === 'yes') {
        } else if (result === 'no') {
        }
      }
    });
  }

  public marcarFavorito(idConvocatory: any, idConvocatoriaProfile: any, idFavoritoConvocatoria: any) {
    if (idFavoritoConvocatoria) {
      this.convocatoryServices.deleteFavoritoConvocatoria(idFavoritoConvocatoria).toPromise()
        .then(ok => {
          this.loadData().then(() => {
            this.alertService.message(this.ct.UNSELECTED_FAVORITE, TYPES.SUCCES)
              .finally();
          });
        }).catch(error => {
          console.log('Error', error);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally();
        });
    } else {
      const favorito: FavoritoConvocatoriaModel = {
        idConvocatoria: idConvocatory,
        idUsuario: this.user.id,
        idConvocatoriaPerfil: idConvocatoriaProfile
      };
      this.convocatoryServices.saveFavoritoConvocatoria(favorito).toPromise()
        .then(ok => {
          this.loadData().then(() => {
            this.alertService.message(this.ct.SELECTED_FAVORITE, TYPES.SUCCES)
              .finally();
          });
        }).catch(error => {
          console.log('Error', error);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally();
        });
    }
  }

  /**
   * Función que se encarga de registrar una inscripción
   * al usuario actual.
   * @param element - Cargo al que se va a inscribir
   */
  public async inscripcionConvocatoria(element: any) {
    const numCargosAplicar = this.convocatoryCurrent.numCargosAplicar;
    const lstInscripcionesUsuario = (await this.commonService.getInscripcionesUsuario(this.user.id).toPromise() as any).datos as InscripcionAspiranteModel[];
    let numInscripciones = 0;
    if (lstInscripcionesUsuario.length > 0) {
      lstInscripcionesUsuario.forEach(e => {
        if (e.idConvocatoria === this.convocatoryCurrent.id) {
          numInscripciones++;
        }
      });
    }

    if (numInscripciones < this.convocatoryCurrent.numeroCargosAplicar) {
      this.alertService.comfirmation(this.ct.INSCRIPTION_CONFIRMATION, TYPES.INFO)
        .then(ok => {

          // Si el usuario confirma la inscripción a la convocatoria, se muestra el mensaje para validar información de H.V.
          if (ok.value) {
            this.alertService.comfirmationRedirect(this.ct.MSG_VALIDATE_INFORMATION_CV, TYPES.INFO)
              .then(async (ok2: any) => {
                if (ok2.value) {
                  this.alertService.loading();

                  // Carga el resumen de la hoja de vida del usuario
                  this.data = (await this.commonService.getDetailSummaryUser(this.user.id).toPromise() as any).datos;
                  this.loadUserDataDetails();

                  // Carga el reporte del resumen del usuario
                  const paramsReport: RptHojaVidaModel = {
                    idUsuario: this.user.id,
                    idConvocatoriaPerfil: element.idConvocatoriaPerfil,
                    language: !this.lang ? 'Es' : this.lang,
                    reportTitle: 'RptResumenHV',
                    reportType: 'PDF',
                    rptFileName: 'RptResumenHV.rdlc',
                    exportExtension: 'PDF'
                  };
                  const fileName = paramsReport.reportTitle + '.' + paramsReport.reportType;
                  const resumen = await this.reportService.getResumenByUsuario(paramsReport).toPromise();
                  const fileReport: File = this.blobToFile(resumen, paramsReport.reportTitle + paramsReport.reportType);

                  /* _#convocatoria, _numDocumentoId, _fechaInscripcion, ext */
                  // Guarda el soporte
                  const params = {
                    NombreSoporte: C.generateNameFile(fileName, this.user.numeroDocumento, modulesSoports.INSCRIPCION_CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
                    Modulo: modulesSoports.INSCRIPCION_CONVOCATORIA,
                    NombreAuxiliar: fileName,
                    idUsuarioModificacion: this.user.id
                  };

                  const documentFile: any = await this.fileService.postFile(fileReport, params).toPromise();

                  // Guarda el nuevo objeto con los datos de la inscripción del aspirante
                  const newInscription: InscripcionAspiranteModel = {
                    idConvocatoria: this.convocatoryCurrent.id,
                    idConvocatoriaPerfil: element.idConvocatoriaPerfil,
                    idUsuario: this.user.id,
                    resumenHV: JSON.stringify(this.data),
                    idSoporte: documentFile.id,
                    idUsuarioModificacion: this.user.id
                  };

                  this.commonService.saveInscripcionAspirante(newInscription).toPromise()
                    // tslint:disable-next-line: no-shadowed-variable
                    .then(ok => {
                      this.loadData().then(loaded => {
                        this.alertService.message(this.ct.MSG_SUCCESSFUL_ENROLLMENT, TYPES.SUCCES);
                        this.scrollTop();
                      });
                    }).catch(e => {
                      console.log('error', e);
                      this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
                    });

                } else if (ok2.dismiss === 'cancel') {
                  /* Redirecciona a resumen de hoja de vida */
                  const newRelativeUrl = this.router.createUrlTree(['cv', 'resumen-hoja-de-vida']);
                  const baseUrl = window.location.href.replace(this.router.url, '');
                  window.open(baseUrl + newRelativeUrl, '_blank');

                  /* const currentURL = window.location.origin;
                  this.router.navigate([]).then(result => { window.open(currentURL, '_blank'); }); */

                  // this.router.navigate(['cv', 'resumen-hoja-de-vida']);
                  // window.open(currentURL + '/#/cv/datos-personales');

                  /* const url = this.router.serializeUrl(this.router.createUrlTree(['/#/cv/datos-personales']));
                  window.open(url, '_blank'); */
                }
              }).catch((error: any) => {
                console.log('ERROR ', error);
                this.alertService.showError(error, this.ct.ERROR_MSG);
              });
          } else {
            return;
          }
        }).catch((err: any) => {
          console.log('ERROR ', err);
          this.alertService.showError(err, this.ct.ERROR_MSG);
        });
    } else {
      this.alertService.message(this.ct.MSG_NUM_MAX_INSCRIPTIONS, TYPES.WARNING);
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

  /**
   * Función que permite anular una inscripción
   * @param element - Cargo actual al que está inscrito y se va a anular.
   */
  public anularInscripcionConvocatoria(element: any) {
    this.alertService.comfirmation(this.ct.MSG_CANCEL_ENROLLMENT_CONFIRMATION + this.convocatoryCurrent.nombreConvocatoria + '\'?', TYPES.WARNING)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.commonService.anularInscripcionAspirante(element.idConvocatoria, this.user.id, element.idConvocatoriaPerfil).toPromise()
            // tslint:disable-next-line: no-shadowed-variable
            .then(ok => {
              this.loadData().then(loaded => {
                this.alertService.message(this.ct.MSG_SUCCESSFUL_CANCEL_ENROLLMENT, TYPES.SUCCES);
                this.scrollTop();
              });
            }).catch(e => {
              console.log('e', e);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      }).catch((err: any) => {
        console.log('ERROR ', err);
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  /**
   * Función que permite actualizar una inscripción, el resumen HV y soporte
   * @param element - Inscripción que se va a actualizar
   */
  public async actualizarInscripcionHv(element: any) {
    this.alertService.comfirmation(this.ct.UPDATE_INSCRIPTION_CONFIRMATION, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

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

          const newFileReport: any = await this.fileService.postFile(fileReport, params).toPromise();

          const newInscripcionHv = {
            idConvocatoria: element.idConvocatoria,
            idUsuario: this.user.id,
            idConvocatoriaPerfil: element.idConvocatoriaPerfil,
            resumenHV: JSON.stringify(this.data),
            idSoporte: newFileReport.id
          };
          this.commonService.actualizarInscripcionHV(newInscripcionHv).toPromise()
            // tslint:disable-next-line: no-shadowed-variable
            .then(ok => {
              this.loadData().then(() => {
                this.alertService.message(this.ct.MSG_SUCCESSFUL_UPDATE_INSCRIPTION, TYPES.SUCCES);
                // this.scrollTop();
              });
            }).catch(e => {
              console.log('error', e);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        } else {
          return;
        }
      }).catch((err: any) => {
        console.log('ERROR ', err);
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }

  /**
   * Función que permite devolverse al componente de convocatorias activas.
   */
  public goBack() {
    this.idConvocatoria = null;
    this.convocatoryCurrent = {};
    this.router.navigate(['convocatorias-aspirante', 'inscripcion-convocatoria']);
  }

  /**
   * Función que permite limpiar la vista actual y
   * cierra el dialogo.
   */
  public clean() {
    // this.profileCurrent = {};
    this.dialogRef1.close();
  }

  /**
   * Función que valida el estado para mostrar cada boton.
   * @param element - Cargo actual que se valida
   */
  public verifyActions(element: PerfilPorConvocatoriaModel) {
    const btnStates = {
      btnActive: true,
      btnInactive: true,
      btnInscrito: false,
      btnAnularInscripcion: false
    };

    /* Valida las fechas de inscripción de la convocatoria */
    /* const today = new Date().toISOString().split('T')[0];
    const fechaInicio = new Date(element.inicioInscripciones).toISOString().split('T')[0];
    const fechaFin = new Date(element.cierreInscripciones).toISOString().split('T')[0];


    if (today >= fechaInicio && today <= fechaFin) {
      btnStates.btnActive = true;
      btnStates.btnInactive = false;
      this.disableButton = false;

      if (element.tieneInscripciones) {
        btnStates.btnActive = false;
        btnStates.btnInscrito = true;
        btnStates.btnAnularInscripcion = true;
      } else {
        btnStates.btnActive = true;
        btnStates.btnInscrito = false;
        btnStates.btnAnularInscripcion = false;
      }
    } else {
      btnStates.btnActive = false;
      btnStates.btnInactive = true;
      this.disableButton = true;

      btnStates.btnInscrito = false;
      btnStates.btnAnularInscripcion = false;
    } */

    let activarInscripcion = false;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < this.lstFechasInscripcion.length && !activarInscripcion; i++) {
      const fi = this.lstFechasInscripcion[i];

      const fechaInicio = new Date(fi.fechaInicial).toISOString().split('T')[0];
      const fechaFin = new Date(fi.fechaFinal).toISOString().split('T')[0];
      
      if (today >= fechaInicio && today <= fechaFin) {
        btnStates.btnActive = true;
        btnStates.btnInactive = false;
        this.disableButton = false;
        activarInscripcion = true;
  
        if (element.tieneInscripciones) {
          btnStates.btnActive = false;
          btnStates.btnInscrito = true;
          btnStates.btnAnularInscripcion = true;
        } else {
          btnStates.btnActive = true;
          btnStates.btnInscrito = false;
          btnStates.btnAnularInscripcion = false;
        }
      } else {
        btnStates.btnActive = false;
        btnStates.btnInactive = true;
        this.disableButton = true;
        activarInscripcion = false;
  
        btnStates.btnInscrito = false;
        btnStates.btnAnularInscripcion = false;
      }
    }

    return btnStates;
  }

  /**
   * Función que carga el detalle del usuario actual.
   */
  public async loadUserData() {
    this.commonService.getDetailSummaryUser(this.user.id)
      .subscribe(
        (res: any) => {
          this.data = res.datos;
          this.loadUserDataDetails();
        }, err => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        },
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
      console.log(error);
    }
  }

  private getTime(date?: Date) {
    return date != null ? date.getTime() : 0;
  }
}
