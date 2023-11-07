import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { ResultadosCursoFormacionModel } from '@app/compartido/modelos/resultados-curso-formacion-model';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { configMsg, PermisosAcciones, stateConvocatoria } from '@app/compartido/helpers/enums';
import { User } from '@app/compartido/modelos/user';
import { Empresa } from '@app/compartido/modelos/empresa';
import { Constants } from '@app/compartido/helpers/constants';
import { ProcesoSeleccionModel } from '@app/compartido/modelos/proceso-seleccion-model';
import { Etapa } from '@app/compartido/modelos/etapa';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin, Observable } from 'rxjs';
import { CombinacionEtapa } from '@app/compartido/modelos/combinacion-etapa';
import { Configuration } from '@app/compartido/modelos/configuration';
import { ResultadoPruebasModel } from '@app/compartido/modelos/resultado-pruebas-model';

@Component({
  selector: 'app-validar-curso-formacion',
  templateUrl: './validar-curso-formacion.component.html',
  styleUrls: ['./validar-curso-formacion.component.scss']
})
export class ValidarCursoFormacionComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;

  public lstTable: ResultadosCursoFormacionModel[] = [];
  public lstProcesoSeleccion: ProcesoSeleccionModel[] = [];
  public lstEtapasConv: Etapa[] = [];
  public lstEtapasCombinacion: CombinacionEtapa[] = [];
  public lstInscripcionesConv: InscripcionAspiranteModel[] = [];
  public lstResultadosPruebas: ResultadoPruebasModel[] = [];

  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public form: FormGroup;
  public submit = false;
  public showSelectCompany = false;
  public matcher: any;
  public sortedData: any;
  public showBtnEtapa = false;

  public idEstadoAspiranteAproboCF: Configuration;
  public idEstadoAspiranteNoAproboCF: Configuration;

  public dataSource = new MatTableDataSource<ResultadosCursoFormacionModel>([]);
  public selection = new SelectionModel<ResultadosCursoFormacionModel>(false, []);
  public displayedColumns: string[] = ['identificacion', 'nombresCompletos', 'resultado'];

  public showTablaInscripcionAsp = false;

  public lstEstadosTablaInfo: string[] = [];

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
    private convService: ConvocatoriaService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
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
      g.estadoConvocatoria === stateConvocatoria.CERRADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES
    );

    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.alertService.loading();
    this.showTablaInscripcionAsp = false;
    this.showBtnEtapa = false;

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
      this.lstTable = (await this.convService.getResultadoCursoFormacionByConvocatoria(idConvocatoria).toPromise() as any).datos as ResultadosCursoFormacionModel[];
      this.lstProcesoSeleccion = [];
      this.lstEtapasConv = [];
      this.lstEtapasCombinacion = [];
      this.lstInscripcionesConv = [];

      if (this.lstTable && this.lstTable.length > 0) {

        this.lstProcesoSeleccion = (await this.convService.getProcesoSeleccionByConvocatoria(idConvocatoria).toPromise() as any).datos as ProcesoSeleccionModel[];
        this.lstInscripcionesConv = (await this.commonService.getInscripcionesConvocatoria(idConvocatoria).toPromise() as any).datos as InscripcionAspiranteModel[];
        this.lstEtapasConv = (await this.convService.getEtapaByConvocatory(idConvocatoria).toPromise() as any).datos as Etapa[];
        this.lstEtapasCombinacion = (await this.convService.getCombinacionEtapaByConvocatoria(idConvocatoria).toPromise() as any).datos as CombinacionEtapa[];
        this.lstResultadosPruebas = (await this.convService.getResultadoPruebasByConvocatoria(idConvocatoria).toPromise() as any).datos as ResultadoPruebasModel[];

        this.lstTable.forEach(e => {
          if (this.lstProcesoSeleccion.length > 0) {
            this.lstProcesoSeleccion.forEach(ps => {
              // const inscripcionAspirante = (await this.commonService.getInscripcionAspiranteById(ps.idInscripcionAspirante).toPromise() as any).datos[0] as InscripcionAspiranteModel;
              const inscripcionAspirante = this.lstInscripcionesConv.find(ins => this.areEqualsIdGuid(ins.id, ps.idInscripcionAspirante));
              if (inscripcionAspirante) {
                if (e.idUsuarioAspirante === inscripcionAspirante.idUsuario) {
                  e.inscripcionAspiranteModel = inscripcionAspirante;
                  e.idInscripcionAspirante = inscripcionAspirante.id;
                  e.inscripcionAspiranteModel.resumenHVModel = JSON.parse(e.inscripcionAspiranteModel.resumenHV);
                  e.idProcesoSeleccion = ps.id;
                  e.procesoSeleccionModel = ps;
                  return;
                }
              }
            });
          }
        });

        // Se filtra los registros que ya fueron procesados
        this.lstTable = this.lstTable.filter(cf => {
          const procesoSel = this.lstProcesoSeleccion.find(ps => ps.idUsuario === cf.idUsuarioAspirante);

          if (procesoSel && procesoSel.aplicaCursoFormacion == 1 && procesoSel.apruebaCursoFormacion == null) {
            return true;
          }
          return false;
        });

        // mostrar mensaje si no tiene resultados de pruebas
        if (this.lstTable.length == 0) {
          this.alertService.message(this.ct.MSG_RESULTADOS_PRUEBAS_PROCESADAS, TYPES.WARNING);
          this.showTablaInscripcionAsp = true;
          this.showBtnEtapa = false;
        } else {
          this.showBtnEtapa = true;
        }
      }
    } else {
      this.lstTable = [];
    }

    this.dataSource.data = this.lstTable;
    if (!this.showTablaInscripcionAsp) {
      this.alertService.close();
    }

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

    this.idEstadoAspiranteAproboCF = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_CURSO_FORMACION));
    this.idEstadoAspiranteNoAproboCF = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_APROBO_CURSO_FORMACION));


    const idEAAproboCF = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_CURSO_FORMACION));
    this.lstEstadosTablaInfo.push(...[
      idEAAproboCF.valor,
    ]);


    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public async etapaClasificacion() {

    this.alertService.comfirmation(this.ct.UPDATE_CONFIRMATION, TYPES.INFO)
      .then(async ok1 => {
        if (ok1.value) {
          this.submit = true;

          if (this.lstTable.length === 0) {
            this.submit = false;
            return;
          }

          this.alertService.loading();

          const varc = await this.commonService.getVarConfig(configMsg.FORMULA_PUNTAJES_ETAPA_CLASIFICATORIA);
          const idPruebaPsicotecnica = await this.commonService.getVarConfig(configMsg.ID_TIPO_PRUEBA_PSICOTECNICA);
          const idPruebaCursoFormacion = await this.commonService.getVarConfig(configMsg.CURSO_FORMACION_TIPO_PRUEBA);

          const tipoEtapas = await this.commonService.getVarConfig(configMsg.TIPO_ETAPAS);
          const valoresDefecto = await this.commonService.getVarConfig(configMsg.VALORES_FORMULA_CLASIFICACION);
          this.setJson(tipoEtapas);
          this.setJson(valoresDefecto);

          const lstInscripciones: Observable<any>[] = [];
          const lstPersist: Observable<any>[] = [];

          this.lstResultadosPruebas.forEach(r => {

            //setear variables por defecto
            let esPunMin = valoresDefecto.valorObj.esPunMin;
            let esPunMax = valoresDefecto.valorObj.esPunMax;
            let ecPunMin = valoresDefecto.valorObj.ecPunMin;
            let ecPunMax = valoresDefecto.valorObj.ecPunMax;

            //se filtra el proceso seleccion con tabla resultado prueba
            const lstProcesoSeleccionAsp = this.lstProcesoSeleccion.filter(ps => {
              const insAsp = this.lstInscripcionesConv.find(
                insA => ps.idInscripcionAspirante === insA.id &&
                  this.areEqualsIdGuid(r.idTipoPrueba, ps.idTipoPrueba) &&
                  r.idInscripcionAspirante === ps.idInscripcionAspirante);

              if (insAsp) {
                if (r.idUsuarioAspirante === insAsp.idUsuario) {
                  return true;
                }
              }
              return false;
            });

            lstProcesoSeleccionAsp.forEach(pse => {
              //variable para cada tipo de prueba
              let punPrueba2 = pse.resultadoFinal;

              // const punPrueba = x.resultadoFinal;
              let lstEtapasSel = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.seleccion) && this.areEquals(et.idTipoPrueba, pse.idTipoPrueba) && et.visibilidadRegistro === Constants.VISIBLE);
              const lstEtapasClas = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.clasificacion) && et.visibilidadRegistro === Constants.VISIBLE && this.areEquals(et.idTipoPrueba, pse.idTipoPrueba));
              if (lstEtapasSel.length > 0) {
                esPunMin = lstEtapasSel[0].puntajeMaximo;
                esPunMax = lstEtapasSel[0].valorMaximo;
              } else {
                const lstEtapasCombinacion = this.lstEtapasCombinacion.filter(et => et.idTipoPrueba === pse.idTipoPrueba && et.visibilidadRegistro === Constants.VISIBLE);
                if (lstEtapasCombinacion.length > 0) {
                  lstEtapasSel = this.lstEtapasConv.filter(et => lstEtapasCombinacion[0].idEtapa === et.id && et.visibilidadRegistro === Constants.VISIBLE);
                  esPunMin = lstEtapasSel[0].puntajeMaximo;
                  esPunMax = lstEtapasSel[0].valorMaximo;
                  if (lstEtapasClas.length > 0) {
                    punPrueba2 = 0;
                    this.lstEtapasCombinacion.forEach(et => {
                      const lstProcesoSeleccionAsp2 = this.lstProcesoSeleccion.filter(ps => {
                        const insAsp = this.lstInscripcionesConv.find(
                          insA => ps.idInscripcionAspirante === insA.id &&
                            r.idInscripcionAspirante === ps.idInscripcionAspirante);
                        return insAsp;
                      });

                      const ps3 = lstProcesoSeleccionAsp2.find(ps2 => et.idTipoPrueba === ps2.idTipoPrueba && et.visibilidadRegistro === Constants.VISIBLE);

                      if (ps3) {
                        punPrueba2 += ps3.resultadoFinal;
                      }
                    });
                  }
                }
              }

              if (lstEtapasClas.length > 0) {
                ecPunMin = lstEtapasClas[0].valorMinimo;
                ecPunMax = lstEtapasClas[0].valorMaximo;
              }

              //validar si es prueba psicotecnica
              let resultadoFormula2 = 0;
              if (this.areEqualsIdGuid(pse.idTipoPrueba, idPruebaPsicotecnica.valor)) {
                resultadoFormula2 = punPrueba2;
              } else {
                resultadoFormula2 = this.commonService.formulaPuntajesClasificatoria(esPunMin, esPunMax, ecPunMin, ecPunMax, punPrueba2, varc);
              }
              resultadoFormula2 = resultadoFormula2 < 0 ? 0 : resultadoFormula2;

              let apruebaCF = 0;
              let resultApruebaCF = 0;
              let resultadoFormula1 = 0;

              //buscar el valor si aprueba CF
              const x = this.lstTable.find(rCF => rCF.idInscripcionAspirante === r.idInscripcionAspirante);
              if (x) {
                if (x.pierdeXNota === 1 || x.pierdeXInasistencia === 1 || x.retiroVoluntario === 1) {
                  apruebaCF = 0;
                  resultApruebaCF = 0;
                } else {
                  apruebaCF = 1;
                  if (x.esHomologado === 1) {
                    resultApruebaCF = x.notaConsolidadaHomologacion;
                  } else {
                    resultApruebaCF = x.totalCFJI_100;
                  }
                }

                // consultar valores para la formula
                let esPunMinCF = valoresDefecto.valorObj.esPunMin;
                let esPunMaxCF = valoresDefecto.valorObj.esPunMax;
                let ecPunMinCF = valoresDefecto.valorObj.ecPunMin;
                let ecPunMaxCF = valoresDefecto.valorObj.ecPunMax;
                //variable para curso formacion
                const punPrueba1 = resultApruebaCF;
                // const punPrueba = x.resultadoFinal;
                let lstEtapasSelCF = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.seleccion) && this.areEquals(et.idTipoPrueba, idPruebaCursoFormacion.valor) && et.visibilidadRegistro === Constants.VISIBLE);
                const lstEtapasClasCF = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.clasificacion) && et.visibilidadRegistro === Constants.VISIBLE && this.areEquals(et.idTipoPrueba, idPruebaCursoFormacion.valor));
                if (lstEtapasSelCF.length > 0) {
                  esPunMinCF = lstEtapasSelCF[0].puntajeMaximo;
                  esPunMaxCF = lstEtapasSelCF[0].valorMaximo;
                }

                if (lstEtapasClasCF.length > 0) {
                  ecPunMinCF = lstEtapasClasCF[0].valorMinimo;
                  ecPunMaxCF = lstEtapasClasCF[0].valorMaximo;
                }
                // calcular resultado formula
                resultadoFormula1 = this.commonService.formulaPuntajesClasificatoria(esPunMin, esPunMax, ecPunMinCF, ecPunMaxCF, punPrueba1, varc);
                resultadoFormula1 = resultadoFormula1 < 0 ? 0 : resultadoFormula1;
              }

              //actualizar proceso seleccion
              const newItem: ProcesoSeleccionModel = {
                id: pse.id,
                idConvocatoria: pse.idConvocatoria,
                idUsuario: pse.idUsuario,
                idUsuarioModificacion: this.user.id,
                idInscripcionAspirante: pse.idInscripcionAspirante,
                idTipoPrueba: pse.idTipoPrueba,
                idConvocatoriaPerfil: pse.idConvocatoriaPerfil,
                resultadoFinal: pse.resultadoFinal,
                aprobo: pse.aprobo,
                aplicaCursoFormacion: pse.aplicaCursoFormacion,
                apruebaCursoFormacion: apruebaCF,
                pasaEtapaClasificacion: apruebaCF,
                pasaListaElegibles: null,
                // puntajeClasificacion: resultadoFormula2 < ecPunMin ? 0 : resultadoFormula2,
                puntajeClasificacion: resultadoFormula2,
                puntajeClasificacionCursoFormacion: resultadoFormula1,
                puntajeCursoFormacion: resultApruebaCF
              };

              //actualizar las inscripciones
              const inscripcionAspirante = this.lstInscripcionesConv.find(ia => ia.id === pse.idInscripcionAspirante);
              if (inscripcionAspirante) {
                if (newItem.apruebaCursoFormacion === 1) {
                  lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteAproboCF.valor));
                } else {
                  if (newItem.aprobo == 1) {
                    lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteNoAproboCF.valor));
                  }
                }
              }
              lstPersist.push(this.convService.saveProcesoSeleccion(newItem));
            });
          });


          // enviar las peticiones
          forkJoin(lstPersist).subscribe({
            next: (res: any) => {
              forkJoin(lstInscripciones).subscribe({
                next: (res2: any) => {
                  this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value })
                    .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                      .finally(() => this.submit = false));
                },
                error: (err2: any) => {
                  this.alertService.showError(err2);
                  this.submit = false;
                }
              });
            },
            error: (err: any) => {
              this.alertService.showError(err);
              this.submit = false;
            }
          });
        }
        // this.alertService.close();
      });
  }

  // public filterList() {
  //   if (this.lstTable.length > 0) {
  //     // filtrar que los registros no esten en procesoSeleccion
  //     this.lstTable = this.lstTable.filter(x => {
  //       const existe = this.lstProcesoSeleccion.find(ps =>
  //         ps.idConvocatoria === x.idConvocatoria &&
  //         ps.idInscripcionAspirante === x.idInscripcionAspirante &&
  //         ps.apruebaCursoFormacion !== null);
  //       return existe ? false : true;
  //     });

  //     // mostrar mensaje si no tiene resultados de pruebas
  //     if (this.lstTable.length === 0) {
  //       this.alertService.message(this.ct.MSG_RESULTADOS_PRUEBAS_PROCESADAS, TYPES.WARNING);
  //     }
  //   }
  // }

  public getResultadoCursoFormacionAspirante(element: any) {
    let resultadoFinal = '';
    if (element.pierdeXNota === 1) {
      resultadoFinal = 'Pierde por nota';
    } else if (element.pierdeXInasistencia === 1) {
      resultadoFinal = 'Pierde por inasistencia';
    } else if (element.esHomologado === 1) {
      resultadoFinal = 'Es homologado';
    } else if (element.retiroVoluntario === 1) {
      resultadoFinal = 'Retiro voluntario';
    } else {
      resultadoFinal = 'Aprueba';
    }
    return resultadoFinal;
  }

  public clean() {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();
    this.f.idEmpresa.setValue('');
    this.f.idEmpresa.updateValueAndValidity();
    this.lstTable = [];
    this.lstProcesoSeleccion = [];
    this.dataSource.data = this.lstTable;
    this.showBtnEtapa = false;
    this.showTablaInscripcionAsp = false;
  }
}
