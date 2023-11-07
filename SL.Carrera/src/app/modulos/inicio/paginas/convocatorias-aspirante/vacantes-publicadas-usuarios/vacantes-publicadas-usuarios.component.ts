import { InscripcionAspiranteVacanteModel } from '@app/compartido/modelos/inscripcion-aspirante-vacante-model';
import { VacanteModel } from '@app/compartido/modelos/vacante-model';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Constants as C } from '@app/compartido/helpers/constants';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DataService } from '@app/core/servicios/data.service';
import { VacantesService } from '@app/core/servicios/vacantes.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';
import { Configuration } from '@app/compartido/modelos/configuration';

@Component({
  selector: 'app-vacantes-publicadas-usuarios',
  templateUrl: './vacantes-publicadas-usuarios.component.html',
  styleUrls: ['./vacantes-publicadas-usuarios.component.scss']
})
export class VacantesPublicadasUsuariosComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstConvocatory: Convocatoria[] = [];
  public lstVacantesPublicadas: VacanteModel[] = [];
  public lstInscripcionesVacantesByAspirante: InscripcionAspiranteVacanteModel[] = [];
  public lstInscripcionVacanteByAspiranteConvocatoria: InscripcionAspiranteVacanteModel[] = [];

  public elementCurrent: any = {};
  public convocatoryCurrent: Convocatoria = null;
  public vacanteCurrent: any = {};
  public idConvocatoriaPerfilCurrent = '';
  public disableButton = false;
  public disableAllButtonsXDecline = false;
  public submit = false;

  private user = this.commonService.getVar(configMsg.USER);
  public maxSeleccionVacantesMismaConvocatoria: Configuration;
  public maxSeleccionVacantesDifConvocatorias: Configuration;

  public displayedColumns: string[] = ['codigoDespacho', 'despacho', 'distrito', 'municipio', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private convocatoriaService: ConvocatoriaService,
    private ct: CustomTranslateService,
    private dataService: DataService,
    private router: Router,
    private vacantesService: VacantesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }


  ngOnInit() {
    this.alertService.loading();
    if (this.dataService.vacantesData === undefined) {
      this.router.navigate(['convocatorias-aspirante', 'mis-convocatorias']);
      return;
    } else {
      this.idConvocatoriaPerfilCurrent = this.dataService.vacantesData.idConvocatoriaPerfil;
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

  public async loadData() {
    this.maxSeleccionVacantesMismaConvocatoria = await this.commonService.getVarConfig(configMsg.MAX_SELECCION_VACANTES_MISMA_CONVOCATORIA);
    this.maxSeleccionVacantesDifConvocatorias = await this.commonService.getVarConfig(configMsg.MAX_SELECCION_VACANTES_DIFERENTES_CONVOCATORIAS);
    this.convocatoryCurrent = (await this.convocatoriaService.getConvocatoriaById(this.dataService.vacantesData.idConvocatoria).toPromise() as any).datos as Convocatoria;

    this.lstConvocatory = ((await this.convocatoriaService.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    this.lstInscripcionesVacantesByAspirante = (await this.vacantesService.getObtenerInscripcionesUsuario(this.user.id).toPromise() as any).datos;
    this.lstVacantesPublicadas = (await this.vacantesService.getVacantesPublicadasUsuarios(this.idConvocatoriaPerfilCurrent).toPromise() as any).datos;

    if (this.lstVacantesPublicadas.length > 0) {
      this.lstVacantesPublicadas.forEach(async e => {

        this.lstConvocatory.forEach(x => {
          if (x.id === e.idConvocatoria) {
            e.convocatoria = x.nombreConvocatoria;
            e.numeroConvocatoria = x.numeroConvocatoria;
            e.idEmpresa = x.idEmpresa;
            return;
          }
        });

        const conPerfil = (await this.convocatoriaService.getConvocatoriaPerfilById(e.idConvocatoriaPerfil).toPromise() as any).datos;
        if (conPerfil.id) {
          e.convocatoriaPerfil = conPerfil;
          e.detallePerfilModel = JSON.parse(e.convocatoriaPerfil.detallePerfil);
          if (e.detallePerfilModel.cargoHumanoModel) {
            // e.cargoHumano = this.translateField(e.detallePerfilModel.cargoHumanoModel, 'cargo', this.lang);
            e.cargoHumano = e.detallePerfilModel.cargoHumanoModel.cargo;
          } else {
            e.cargo = e.detallePerfilModel.cargoModel.cargo;
          }
          e.gradoCargo = e.detallePerfilModel.idGradoCargo;
        }

        const municipio = (await this.commonService.getCityById(e.idMunicipio).toPromise() as any).datos;
        e.municipio = municipio ? municipio.ciudad : '';
        if (this.lstInscripcionesVacantesByAspirante.length > 0) {
          this.lstInscripcionesVacantesByAspirante.forEach(i => {

            if (i.idVacante === e.id) {
              e.tieneInscripciones = 1;
              return;
            }
          });
        }
      });
    }

    this.dataSource.data = this.lstVacantesPublicadas;
  }

  public inscripcionAspiranteVacante(element: VacanteModel) {
    let numInscripcionesMismaConvocatoria = 0;
    if (this.lstInscripcionesVacantesByAspirante.length > 0) {
      this.lstInscripcionesVacantesByAspirante.forEach(e => {
        if (e.estadoConvocatoria !== stateConvocatoria.CERRADA && e.idConvocatoria === this.convocatoryCurrent.id) {
          numInscripcionesMismaConvocatoria++;
        }
      });
    }

    if (numInscripcionesMismaConvocatoria >= Number(this.maxSeleccionVacantesMismaConvocatoria.valor)) {
      this.alertService.message(this.ct.MSG_NUM_MAX_INSCRIPTIONS, TYPES.WARNING);
      return;
    }

    if (this.lstInscripcionesVacantesByAspirante.length >= Number(this.maxSeleccionVacantesDifConvocatorias.valor)) {
      this.alertService.message(this.ct.MSG_NUM_MAX_INSCRIPTIONS_DIF_CONVOCATORIAS, TYPES.WARNING);
      return;
    }

    // if (numInscripcionesMismaConvocatoria < Number(this.maxSeleccionVacantesMismaConvocatoria.valor) && this.lstInscripcionesVacantesByAspirante.length < Number(this.maxSeleccionVacantesDifConvocatorias.valor)) {
    this.alertService.comfirmation(this.ct.MSG_VACANCY_SELECTION_CONFIRMATION, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

          const inscripcionAspiranteVacante = {
            id: undefined,
            idConvocatoria: element.idConvocatoria,
            idUsuarioInscrito: this.user.id,
            idVacante: element.id,
            idUsuarioModificacion: this.user.id
          };

          this.vacantesService.saveInscripcionAspiranteVacante(inscripcionAspiranteVacante).toPromise()
            .then(ok => {
              this.loadData().then(async () => {

                const msg = `
                  Estimado aspirante
                  <br /><br />
                  A continuación encontrará información pertinente a la selección de la vacante:
                  <br /><br />
                  Nombre del cargo: ${element.cargoHumano ? element.cargoHumano : element.cargo}<br />
                  Grado cargo: ${element.gradoCargo}<br />
                  Nombre de la convocatoria: ${element.convocatoria}<br />
                  Número de la convocatoria: ${element.numeroConvocatoria}<br />
                  Códido despacho: ${element.codigoDespacho}<br />
                  Despacho: ${element.despacho}<br />
                  Distrito: ${element.distrito}<br />
                  Municipio: ${element.municipio}<br />
                  <br /><br />
                  Por favor conservar el correo 
                  <br /><br />
                  ¡Gracias por utilizar CARJUD-APP!
                  <br />`;

                const newNotificacion: NotificacionModel = {
                  asunto: 'Selección aspirante a vacante.',
                  mensaje: msg,
                  esLeido: 0,
                  idUsuarioDestinatario: this.user.id,
                  idUsuarioRemitente: this.user.id,
                  idEmpresa: element.idEmpresa,
                  idConvocatoria: element.idConvocatoria,
                  copiaACorreo: 1
                };
                await this.commonService.saveNotificacion(newNotificacion).toPromise();
                this.alertService.message(this.ct.MSG_SECCIONAL_VACANTE, TYPES.SUCCES);
                this.scrollTop();
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
    /* } else {
      this.alertService.message(this.ct.MSG_NUM_MAX_INSCRIPTIONS, TYPES.WARNING);
    } */
  }

  public anularInscripcionVacante(element: VacanteModel) {
    const cargo = element.cargo ? element.cargo : element.cargoHumano;
    this.alertService.comfirmation(this.ct.MSG_CANCEL_REGISTRATION_VACANCY_CONFIRMATION, TYPES.WARNING)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          const inscripcionVA = this.lstInscripcionesVacantesByAspirante.find(i => i.idVacante === element.id);
          if (inscripcionVA) {
            this.vacantesService.deleteInscripcionAspiranteVacante(inscripcionVA).toPromise()
              // tslint:disable-next-line: no-shadowed-variable
              .then(ok => {
                this.loadData().then(async () => {
                  const msg = `
                  Estimado aspirante
                  <br /><br />
                  Usted realizó el proceso de anulación a la vacante: ${cargo}, grado: ${element.gradoCargo} <br />
                  de la convocatoria ${element.convocatoria}. Se informa que este proceso fue exitoso.
                  <br /><br />
                  Recuerde que puede volver a seleccionar una vacante, siempre y cuando <br />
                  las fechas de inscripción esten activas.<br />
                  <br /><br />
                  ¡Gracias por utilizar CARJUD-APP!`;

                  const newNotificacion: NotificacionModel = {
                    asunto: 'Anulación de selección a vacante.',
                    mensaje: msg,
                    esLeido: 0,
                    idUsuarioDestinatario: this.user.id,
                    idUsuarioRemitente: this.user.id,
                    idEmpresa: element.idEmpresa,
                    idConvocatoria: element.idConvocatoria,
                    copiaACorreo: 1
                  };
                  await this.commonService.saveNotificacion(newNotificacion).toPromise();
                  this.alertService.message(this.ct.MSG_SECCIONAL_ANULACION, TYPES.SUCCES);
                  this.scrollTop();
                });
              }).catch(e => {
                console.log('e', e);
                this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
              });
          }
        }
      }).catch((err: any) => {
        console.log('ERROR ', err);
        this.alertService.showError(err, this.ct.ERROR_MSG);
      });
  }


  /**
   * Función que valida el estado para mostrar cada boton.
   * @param element - Cargo actual que se valida
   */
  public verifyActions(element: VacanteModel) {
    const btnStates = {
      btnInactive: true,
      btnActive: false,
      btnAnularVacante: false,
    };

    if (element.tieneInscripciones) {
      btnStates.btnInactive = true;
      btnStates.btnActive = false;
      btnStates.btnAnularVacante = true;
      this.disableButton = true;
    } else {
      btnStates.btnInactive = false;
      btnStates.btnActive = true;
      this.disableButton = false;
      btnStates.btnAnularVacante = false;
    }

    return btnStates;
  }

  /**
   * Función que permite devolverse al componente de convocatorias activas.
   */
  public goBack() {
    // this.idConvocatoria = null;
    // this.convocatoryCurrent = {};
    this.convocatoryCurrent = null;
    this.router.navigate(['convocatorias-aspirante', 'mis-convocatorias']);
  }
}
