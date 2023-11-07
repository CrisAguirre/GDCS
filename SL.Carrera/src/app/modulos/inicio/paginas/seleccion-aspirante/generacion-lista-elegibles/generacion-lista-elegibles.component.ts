import { ValidacionAdjuntoModel } from '@app/compartido/modelos/validacion-adjunto-model';
import { ConfigAdicional } from '@app/compartido/modelos/configuracion-adicional';
import { Adicional } from '@app/compartido/modelos/adicional';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MatDialog, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, PermisosAcciones, stateConvocatoria } from '@app/compartido/helpers/enums';
import { CategoriaAdmintidoModel } from '@app/compartido/modelos/categoria-admitido-model';
import { CombinacionEtapa } from '@app/compartido/modelos/combinacion-etapa';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { Etapa } from '@app/compartido/modelos/etapa';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { ProcesoSeleccionModel } from '@app/compartido/modelos/proceso-seleccion-model';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { User } from '@app/compartido/modelos/user';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { TipoAdicional } from '@app/compartido/modelos/tipo-adicional';
import { forkJoin, Observable } from 'rxjs';
import { Configuration } from '@app/compartido/modelos/configuration';
import { ReportesService } from '@app/core/servicios/reportes.service';

@Component({
  selector: 'app-generacion-lista-elegibles',
  templateUrl: './generacion-lista-elegibles.component.html',
  styleUrls: ['./generacion-lista-elegibles.component.scss']
})
export class GeneracionListaElegiblesComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstEtapasConv: Etapa[] = [];
  public lstEtapasCombinacion: CombinacionEtapa[] = [];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstCategoriaAdmintidoModel: CategoriaAdmintidoModel[] = [];
  public lstTipoPrueba: TipoPrueba[] = [];
  public lstAditionalConfig: ConfigAdicional[] = [];
  public lstSubAditionalType: TipoAdicional[] = [];
  public lstValidacionAdjuntosConvocatoria: ValidacionAdjuntoModel[] = [];
  public lstConfigAdicionalConvocatoria: ConfigAdicional[] = [];
  public lstAditional: Adicional[] = [];
  public lstAdicionalConvocatoria: Adicional[] = [];
  public lstTiposAdicionales: TipoAdicional[] = [];

  public lstTable: ProcesoSeleccionModel[] = [];
  private lstTableAll: ProcesoSeleccionModel[] = [];
  public lstTableDetails: ProcesoSeleccionModel[] = [];
  public lstProcesoSeleccion: ProcesoSeleccionModel[] = [];
  public lstInscripcionesConv: InscripcionAspiranteModel[] = [];

  public idTipoExperiencia: Configuration = null;
  public idTipoCapacitacion: Configuration = null;

  public puntajeMaximoAdicionalCap = 0;
  public puntajeMaximoAdicionalExp = 0;
  public valorRealAd: FormControl = new FormControl(0);
  public valorRealCapacitacion: FormControl = new FormControl(0);
  public showButtonEdit = true;
  public showInputEdit = false;
  public showButtonEdit2 = true;
  public showInputEdit2 = false;

  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public form: FormGroup;
  public submit = false;
  public showSelectCompany = false;
  public matcher: any;
  public sortedData: any;

  public dataSource = new MatTableDataSource<ProcesoSeleccionModel>([]);
  public dataSourceInfo = new MatTableDataSource<ConfigAdicional>([]);
  public dataSourceInfo2 = new MatTableDataSource<ProcesoSeleccionModel>([]);
  private dialogRefInfo: MatDialogRef<any, any>;
  private dialogRefInfo2: MatDialogRef<any, any>;
  public selection = new SelectionModel<any>(false, []);
  public displayedColumns: string[] = ['identificacion', 'nombresCompletos', 'cargoAspirante', 'gradoCargo', 'dependencia', 'detalleRecomendacion', 'detallePuntajes'];
  public displayedColumns2: string[] = ['cargoAspirante', 'gradoCargo', 'tipoPrueba', 'puntajeClasificacion', 'puntajeClasificacionCursoFormacion', 'puntajeRecomendadoCap', 'puntajeRecomendadoExp', 'valorRealAdicional', 'valorRealCapacitacion'];
  public displayedColumnsInfo: string[] = ['subTipo', 'subPuntajeMaximo'];
  public idEstadoAspiranteRegistroElegibles: Configuration;

  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;

  public total = 0;
  public msgListaElegibles;
  public showTablaInscripcionAsp = false;

  public lstEstadosTablaInfo: string[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('dialogInfo2', { static: true }) dialogInfo2: TemplateRef<any>;
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }
  @ViewChild('paginatorDialog2', { static: false }) set paginatorDialog2(value: MatPaginator) {
    this.dataSourceInfo2.paginator = value;
  }
  @ViewChild('sortInfo2', { static: false }) set sortInfo2(value: MatSort) {
    this.dataSourceInfo2.sort = value;
  }

  constructor(
    private adminConvocatoria: AdministracionConvocatoriaService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private convService: ConvocatoriaService,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private fb: FormBuilder,
    private dialogService: MatDialog,
    private reporteServ: ReportesService,
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

    this.dataSource.filterPredicate = (data: ProcesoSeleccionModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.commonService.getNumeroDocumento(data.inscripcionAspiranteModel),
        this.commonService.getNameAspirante(data.inscripcionAspiranteModel),
        this.commonService.getCargoAspirante(data.inscripcionAspiranteModel),
        this.commonService.getGradoCargo(data.inscripcionAspiranteModel),
      ];
      return Constants.filterTable(dataCompare, filter);
    };
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'identificacion': return this.compare(this.commonService.getNumeroDocumento(a.inscripcionAspiranteModel), this.commonService.getNumeroDocumento(b.inscripcionAspiranteModel), isAsc);
        case 'nombresCompletos': return this.compare(this.commonService.getNameAspirante(a.inscripcionAspiranteModel), this.commonService.getNameAspirante(b.inscripcionAspiranteModel), isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a.inscripcionAspiranteModel), this.commonService.getCargoAspirante(b.inscripcionAspiranteModel), isAsc);
        case 'gradoCargo': return this.compare(this.commonService.getGradoCargo(a.inscripcionAspiranteModel), this.commonService.getGradoCargo(b.inscripcionAspiranteModel), isAsc);
        default: return 0;
      }
    });
  }

  public sortDataInfo2(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceInfo2.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        //case 'identificacion': return this.compare(this.commonService.getNumeroDocumento(a.inscripcionAspiranteModel), this.commonService.getNumeroDocumento(b.inscripcionAspiranteModel), isAsc);
        //case 'nombresCompletos': return this.compare(this.commonService.getNameAspirante(a.inscripcionAspiranteModel), this.commonService.getNameAspirante(b.inscripcionAspiranteModel), isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a.inscripcionAspiranteModel), this.commonService.getCargoAspirante(b.inscripcionAspiranteModel), isAsc);
        case 'gradoCargo': return this.compare(this.commonService.getGradoCargo(a.inscripcionAspiranteModel), this.commonService.getGradoCargo(b.inscripcionAspiranteModel), isAsc);
        case 'tipoPrueba': return this.compare(this.translateField(a.tipoPruebaModel, 'tipoPrueba', this.lang), this.translateField(b.tipoPruebaModel, 'tipoPrueba', this.lang), isAsc);
        case 'tipoPrueba': return this.compare(a.puntajeClasificacion, b.puntajeClasificacion, isAsc);
        case 'tipoPrueba': return this.compare(a.puntajeClasificacionCursoFormacion, b.puntajeClasificacionCursoFormacion, isAsc);
        case 'tipoPrueba': return this.compare(a.puntajeRecomendadoCap, b.puntajeRecomendadoExp, isAsc);
        case 'tipoPrueba': return this.compare(a.valorRealAdicional, b.valorRealAdicional, isAsc);
        case 'tipoPrueba': return this.compare(a.valorRealAdicionalCapacitacion, b.valorRealAdicionalCapacitacion, isAsc);
        default: return 0;
      }
    });
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
    this.showTablaInscripcionAsp = false;
    this.lstTable = [];
    this.lstTableAll = [];
    this.lstTableDetails = [];
    this.msgListaElegibles = undefined;
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
      // this.lstTable = (await this.convService.getResultadoCursoFormacionByConvocatoria(idConvocatoria).toPromise() as any).datos as ResultadosCursoFormacionModel[];
      this.lstProcesoSeleccion = [];
      this.lstTableAll = (await this.convService.getProcesoSeleccionByConvocatoria(idConvocatoria).toPromise() as any).datos as ProcesoSeleccionModel[];
      if (this.lstTableAll && this.lstTableAll.length > 0) {

        const lstObs: Observable<any>[] = [];

        lstObs.push(this.commonService.getInscripcionesConvocatoria(idConvocatoria));
        lstObs.push(this.convService.getEtapaByConvocatory(idConvocatoria));
        lstObs.push(this.convService.getCombinacionEtapaByConvocatoria(idConvocatoria));
        lstObs.push(this.convService.getConvocatoriaPerfilByConvocatoria(idConvocatoria));
        lstObs.push(this.convService.getObtenerAdicionalesPorConvocatoria(idConvocatoria));
        lstObs.push(this.convService.getObtenerConfigAdicionalesPorConvocatoria(idConvocatoria));
        lstObs.push(this.convService.getValidacionAdjuntosByConvocatoria(idConvocatoria));
        lstObs.push(this.adminConvocatoria.getTipoAdicionales());

        // let lstConvocatoriaPerfil = [];
        forkJoin(lstObs).subscribe({
          next: (res: any) => {
            this.lstInscripcionesConv = res[0].datos;
            this.lstEtapasConv = res[1].datos;
            this.lstEtapasCombinacion = res[2].datos;
            const lstConvocatoriaPerfil = res[3].datos;
            this.lstAdicionalConvocatoria = res[4].datos;
            this.lstConfigAdicionalConvocatoria = res[5].datos;
            this.lstConfigAdicionalConvocatoria = this.lstConfigAdicionalConvocatoria.filter(ca => this.lstAdicionalConvocatoria.find(ad => ad.id === ca.idAdicional) != null)
            this.lstValidacionAdjuntosConvocatoria = res[6].datos;
            this.lstTiposAdicionales = res[7].datos;

            //setear los valores de tipo adicional en el modelo de config adicional
            this.lstConfigAdicionalConvocatoria.forEach(ca => ca.tipoAdicionalModel = this.lstTiposAdicionales.find(ta => ta.id === ca.idTipoAdicional));

            //sumar puntajes maximos segun el tipo de adicional
            this.puntajeMaximoAdicionalCap = 0;
            this.puntajeMaximoAdicionalExp = 0;
            this.lstAdicionalConvocatoria.forEach(ad => {
              if (this.areEqualsIdGuid(ad.idTipoAdicional, this.idTipoCapacitacion.valor)) {
                this.puntajeMaximoAdicionalCap += ad.puntajeMaximo
              } else if (this.areEqualsIdGuid(ad.idTipoAdicional, this.idTipoExperiencia.valor)) {
                this.puntajeMaximoAdicionalExp += ad.puntajeMaximo
              }
            });

            // Se filtra la lista de procesos selección que hayan pasado a etapa clasificación
            const lstTemp = this.lstTableAll.filter(ps => ps.pasaEtapaClasificacion === 1 && ps.aprobo == 1 && ps.pasaListaElegibles === 1);
            //se valida el mensaje si ya paso por este proceso
            if (lstTemp.length > 0) {
              this.msgListaElegibles = this.ct.MSG_CONVOCATORIA_LISTA_ELEGIBLES;
              // mostrar la tabla de informacion
              this.showTablaInscripcionAsp = true;
            }
            this.lstTableAll = this.lstTableAll.filter(ps => ps.pasaEtapaClasificacion === 1 && ps.aprobo == 1);

            this.lstTableAll.forEach(e => {
              const insc = this.lstInscripcionesConv.find(i => i.id === e.idInscripcionAspirante);
              if (insc) {

                // se carga la inscripcion
                e.inscripcionAspiranteModel = insc;
                e.inscripcionAspiranteModel.resumenHVModel = JSON.parse(e.inscripcionAspiranteModel.resumenHV);

                // buscar el tipo prueba
                const tipoPrueba = this.lstTipoPrueba.find(tp => e.idTipoPrueba && tp.id === e.idTipoPrueba);
                if (tipoPrueba) {
                  e.tipoPruebaModel = tipoPrueba;
                }

                // se carga convocatoria perfil
                if (lstConvocatoriaPerfil && lstConvocatoriaPerfil.length > 0) {
                  const cPerfil = lstConvocatoriaPerfil.find(cp => cp.id === e.inscripcionAspiranteModel.idConvocatoriaPerfil);
                  if (cPerfil) {
                    cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                    e.inscripcionAspiranteModel.convocatoriaPerfilModel = cPerfil;
                  }
                }

                //e.adicional = this.lstAdicionalConvocatoria[0];

                let sumConfigAdicionalExp = 0;
                let sumConfigAdicionalCap = 0;

                //crear lista de configAdicional
                const lstConfigAdiTemp: ConfigAdicional[] = [];
                const lstValidacionAdjuntosConvocatoriaTemp = this.lstValidacionAdjuntosConvocatoria.filter(va => va.idInscripcionAspirante === e.idInscripcionAspirante);

                if (lstValidacionAdjuntosConvocatoriaTemp.length > 0) {
                  lstValidacionAdjuntosConvocatoriaTemp.forEach(vac => {
                    if (vac.aplicaAdicional === 1) {
                      const configAdicional = this.lstConfigAdicionalConvocatoria.find(cac => cac.id === vac.idConfigAdicional);
                      if (configAdicional) {
                        //guardarlo en una lista
                        if (this.areEqualsIdGuid(configAdicional.tipoAdicionalModel.idReferencia, this.idTipoCapacitacion.valor)) {
                          sumConfigAdicionalCap += configAdicional.puntajeMaximo;
                        } else if (this.areEqualsIdGuid(configAdicional.tipoAdicionalModel.idReferencia, this.idTipoExperiencia.valor)) {
                          sumConfigAdicionalExp += configAdicional.puntajeMaximo;
                        }
                        lstConfigAdiTemp.push(configAdicional);
                      } else {
                        sumConfigAdicionalCap += 0;
                        sumConfigAdicionalExp += 0;
                      }
                    }
                  });

                  //setear el puntaje recomendado para capacitacion
                  if (sumConfigAdicionalCap > this.puntajeMaximoAdicionalCap) {
                    e.puntajeRecomendadoCap = this.puntajeMaximoAdicionalCap;
                  } else {
                    e.puntajeRecomendadoCap = sumConfigAdicionalCap;
                  }

                  //setear el puntaje recomendado para experiencia
                  if (sumConfigAdicionalExp > this.puntajeMaximoAdicionalExp) {
                    e.puntajeRecomendadoExp = this.puntajeMaximoAdicionalExp;
                  } else {
                    e.puntajeRecomendadoExp = sumConfigAdicionalExp;
                  }

                } else {
                  e.puntajeRecomendadoCap = 0;
                  e.puntajeRecomendadoExp = 0;
                }

                /* e.valorRealAdicional = 0;
                e.valorRealAdicionalCapacitacion = 0; */
                //e.totalPuntos = e.puntajeClasificacion + e.puntajeClasificacionCursoFormacion + e.puntajeRecomendado + e.valorRealAdicional + e.valorRealAdicionalCapacitacion;
              }
            });

            //filtrar los aspirantes por inscripcion
            this.lstTableAll.forEach(t => {
              const encontro = this.lstTable.find(t2 => t2.inscripcionAspiranteModel.idUsuario === t.inscripcionAspiranteModel.idUsuario && t2.idInscripcionAspirante === t.idInscripcionAspirante);
              if (!encontro) {
                this.lstTable.push(t);
              }
            });
            this.dataSource.data = this.lstTable;
            this.alertService.close();
          },
          error: (err: any) => {
            this.alertService.showError(err);
            this.submit = false;
          }
        });

      } else {
        this.lstTable = [];
        this.dataSource.data = this.lstTable;
        this.alertService.close();
      }

    } else {
      this.lstTable = [];
      this.dataSource.data = this.lstTable;
      this.alertService.close();
    }

    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA){
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

    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
    this.lstCategoriaAdmintidoModel = ((await this.convService.getCategoriaAdmitidos().toPromise() as any).datos) as CategoriaAdmintidoModel[];
    this.lstTipoPrueba = ((await this.adminConvocatoria.getTipoPruebas().toPromise() as any).datos) as TipoPrueba[];
    this.lstAditional = (await this.convService.getAdicionales().toPromise() as any).datos as Adicional[];

    // variables de configuracion tipo adicional capacitacion y experiencia
    this.idTipoExperiencia = await this.commonService.getVarConfig(configMsg.ID_PARAMETRO_ADICIONAL_EXPERIENCIA);
    this.idTipoCapacitacion = await this.commonService.getVarConfig(configMsg.ID_PARAMETRO_ADICIONAL_CAPACITACION);

    this.idEstadoAspiranteRegistroElegibles = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_REGISTRO_ELEGIBLES));

    const idEARegistroElegibles = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_REGISTRO_ELEGIBLES));
    this.lstEstadosTablaInfo.push(...[
      idEARegistroElegibles.valor,
    ]);


    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public generarListaElegibles() {
    if (this.lstTableAll.length === 0) {
      this.submit = false;
      return;
    }

    this.alertService.loading();
    const lstInscripciones: Observable<any>[] = [];
    const lstPersist: Observable<any>[] = [];
    this.lstTableAll.forEach(x => {
      const newItem: ProcesoSeleccionModel = {
        id: x.id,
        idConvocatoria: x.idConvocatoria,
        idUsuario: x.idUsuario,
        idUsuarioModificacion: this.user.id,
        idInscripcionAspirante: x.idInscripcionAspirante,
        idTipoPrueba: x.idTipoPrueba,
        idConvocatoriaPerfil: x.idConvocatoriaPerfil,
        resultadoFinal: x.resultadoFinal,
        aprobo: x.aprobo,
        aplicaCursoFormacion: x.aplicaCursoFormacion,
        apruebaCursoFormacion: x.apruebaCursoFormacion,
        pasaEtapaClasificacion: x.pasaEtapaClasificacion,
        pasaListaElegibles: 1,
        puntajeClasificacion: x.puntajeClasificacion,
        puntajeClasificacionCursoFormacion: x.puntajeClasificacionCursoFormacion,
        puntajeCursoFormacion: x.puntajeCursoFormacion,
        valorRealAdicional: x.valorRealAdicional,
        valorRealAdicionalCapacitacion: x.valorRealAdicionalCapacitacion
      };
      lstPersist.push(this.convService.saveProcesoSeleccion(newItem));


      //actualizar los registros de inscripcion por el nuevo estado
      const inscripcionAspirante = this.lstInscripcionesConv.find(ia => ia.id === x.idInscripcionAspirante);
      if (inscripcionAspirante) {
        if (newItem.aprobo === 1) {
          lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteRegistroElegibles.valor));
        }
      }
    });


    forkJoin(lstPersist).subscribe({
      next: (res: any) => {

        forkJoin(lstInscripciones).subscribe({
          next: (res2: any) => {
            this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, false)
              .then(() => this.alertService.message(this.ct.MSG_LISTA_ELEGIBLES_EXITOSA, TYPES.SUCCES)
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

  public async seeCombinationsStages(element: ProcesoSeleccionModel) {
    const lstValidacionAdjuntosConvocatoriaTemp = this.lstValidacionAdjuntosConvocatoria
      .filter(va => va.idInscripcionAspirante === element.idInscripcionAspirante && va.aplicaAdicional == 1);

    const lstConfigAdicional = this.lstConfigAdicionalConvocatoria.filter(ca => {
      const find = lstValidacionAdjuntosConvocatoriaTemp.find(vc => vc.idConfigAdicional === ca.id);
      return find;
    });

    lstConfigAdicional.forEach(ca => {
      const ta = this.lstTiposAdicionales.find(ta => ca.idTipoAdicional === ta.id);
      ca.tipoAdicionalModel = ta;
    })
    this.dataSourceInfo.data = lstConfigAdicional;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public verDetallePuntajes(element: ProcesoSeleccionModel) {
    this.lstTableDetails = this.lstTableAll.filter(x => x.inscripcionAspiranteModel.idUsuario === element.inscripcionAspiranteModel.idUsuario && x.idInscripcionAspirante === element.idInscripcionAspirante);
    this.sumarTotal();
    this.dataSourceInfo2.data = this.lstTableDetails;
    this.dialogRefInfo2 = this.dialogService.open(this.dialogInfo2, {
      maxWidth: '90%',
      height: '90%',
    });
    this.dialogRefInfo2.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  private sumarTotal() {
    //sumar total
    this.total = 0;
    this.lstTableDetails.forEach(td => this.total += td.puntajeClasificacion);
    if (this.lstTableDetails[0]) {
      this.total += this.lstTableDetails[0].puntajeClasificacionCursoFormacion;
      this.total += this.lstTableDetails[0].valorRealAdicional;
      this.total += this.lstTableDetails[0].valorRealAdicionalCapacitacion;
    }
  }

  public setValorRealAdicional(element: ProcesoSeleccionModel) {
    this.lstTableAll.forEach(x => {
      if (element.inscripcionAspiranteModel.idUsuario === x.inscripcionAspiranteModel.idUsuario) {
        if (element.valorRealAdicional > this.puntajeMaximoAdicionalExp) {
          this.alertService.message(this.ct.MSG_VALOR_SUPERA_MAXIMO_PERMITIDO, TYPES.WARNING);
          x.valorRealAdicional = 0;
          return;
        } else {
          x.valorRealAdicional = element.valorRealAdicional;
          //x.totalPuntos = x.puntajeClasificacion + x.puntajeClasificacionCursoFormacion + x.puntajeRecomendadoExp + x.valorRealAdicional + x.valorRealAdicionalCapacitacion;
        }
      }
    });

    this.lstTableDetails = this.lstTableAll.filter(x => x.inscripcionAspiranteModel.idUsuario === element.inscripcionAspiranteModel.idUsuario);
    this.sumarTotal();
    this.dataSourceInfo2.data = this.lstTableDetails;
  }

  public setValorRealCapacitacion(element: ProcesoSeleccionModel) {
    this.lstTableAll.forEach(x => {
      if (element.inscripcionAspiranteModel.idUsuario === x.inscripcionAspiranteModel.idUsuario) {
        if (element.valorRealAdicionalCapacitacion > this.puntajeMaximoAdicionalCap) {
          this.alertService.message(this.ct.MSG_VALOR_SUPERA_MAXIMO_PERMITIDO, TYPES.WARNING);
          x.valorRealAdicionalCapacitacion = 0;
          return;
        } else {
          x.valorRealAdicionalCapacitacion = element.valorRealAdicionalCapacitacion;
          //x.totalPuntos = x.puntajeClasificacion + x.puntajeClasificacionCursoFormacion + x.puntajeRecomendadoCap + x.valorRealAdicional + x.valorRealAdicionalCapacitacion;
        }
      }
    });

    this.lstTableDetails = this.lstTableAll.filter(x => x.inscripcionAspiranteModel.idUsuario === element.inscripcionAspiranteModel.idUsuario);
    this.sumarTotal();
    this.dataSourceInfo2.data = this.lstTableDetails;
  }

  public getReporteElegiblesByCargo() {
    this.submit = true;

    this.alertService.loading();
    this.reporteServ.getAspirantesElegiblesCargos(this.f.idConvocatoria.value, this.lang)
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

  public validateNumber(e: any) {
    const input = String.fromCharCode(e.charCode);
    const regExpString = /^[0-9]*\.?[0-9]*$/g;
    if (!regExpString.test(input)) {
      e.preventDefault();
    }
  }

  public verifyActions(element: any) {
    let btnStates = {
      showEdit: false,
      showInput: false,
    }
    if (element.valorRealAdicional === 0) {
      btnStates.showEdit = false;
      btnStates.showInput = true;

      this.showInputEdit = true;
      this.showButtonEdit = false;
    } else {
      btnStates.showEdit = true;
      btnStates.showInput = false;

      this.showInputEdit = false;
      this.showButtonEdit = true;
    }
    return btnStates;
  }

  public activarInputValorReal(element: any) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    this.showInputEdit = true;
    this.showButtonEdit = false;
  }

  public activarInputValorCapacitacion(element: any) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    
    this.showInputEdit2 = true;
    this.showButtonEdit2 = false;
  }

  public clean() {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();
    this.f.idEmpresa.setValue('');
    this.f.idEmpresa.updateValueAndValidity();
    this.lstTable = [];
    this.lstTableAll = [];
    this.lstTableDetails = [];
    this.valorRealAd.setValue(0);
    this.valorRealAd.updateValueAndValidity();
    this.valorRealCapacitacion.setValue(0);
    this.valorRealCapacitacion.updateValueAndValidity();
    this.showButtonEdit = true;
    this.showButtonEdit2 = true;
    this.showInputEdit = false;
    this.showInputEdit2 = false;
    // this.lstProcesoSeleccion = [];
    this.dataSource.data = this.lstTable;
    this.showTablaInscripcionAsp = false;
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public closeDialogInfo2() {
    this.valorRealAd.setValue(0);
    this.valorRealAd.updateValueAndValidity();
    this.valorRealCapacitacion.setValue(0);
    this.valorRealCapacitacion.updateValueAndValidity();
    this.dialogRefInfo2.close();
  }

  public getInfoAspirante() {
    if (this.lstTableDetails.length > 0) {
      return this.commonService.getNumeroDocumento(this.lstTableDetails[0].inscripcionAspiranteModel) + ' ' +
        this.commonService.getNameAspirante(this.lstTableDetails[0].inscripcionAspiranteModel)
    }
  }
}
