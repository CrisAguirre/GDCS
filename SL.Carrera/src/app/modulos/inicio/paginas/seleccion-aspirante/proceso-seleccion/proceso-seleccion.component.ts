import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialogRef, MatDialog } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, PermisosAcciones, stateConvocatoria } from '@app/compartido/helpers/enums';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { Empresa } from '@app/compartido/modelos/empresa';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Constants } from '@app/compartido/helpers/constants';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { CategoriaAdmintidoModel } from '@app/compartido/modelos/categoria-admitido-model';
import { SelectionModel } from '@angular/cdk/collections';
import { User } from '@app/compartido/modelos/user';
import { ResultadoPruebasModel } from '@app/compartido/modelos/resultado-pruebas-model';
import { Etapa } from '@app/compartido/modelos/etapa';
import { CombinacionEtapa } from '@app/compartido/modelos/combinacion-etapa';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { ProcesoSeleccionModel } from '@app/compartido/modelos/proceso-seleccion-model';
import { forkJoin, Observable } from 'rxjs';
import { Configuration } from '@app/compartido/modelos/configuration';
import { ReportesService } from '@app/core/servicios/reportes.service';

@Component({
  selector: 'app-proceso-seleccion',
  templateUrl: './proceso-seleccion.component.html',
  styleUrls: ['./proceso-seleccion.component.scss']
})
export class ProcesoSeleccionComponent extends BaseController implements OnInit, AfterViewChecked {

  private user: User = this.commonService.getVar(configMsg.USER);
  public displayedColumns: string[] = ['identificacion', 'nombresCompletos', 'cargoAspirante', 'gradoCargo', 'dependencia', 'detalle'];
  public displayedColumns2: string[] = ['tipoPrueba', 'resultadoFinal', 'estadoAspirante'];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstCategoriaAdmintidoModel: CategoriaAdmintidoModel[] = [];
  public lstTipoPrueba: TipoPrueba[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstInscripcionesConv: InscripcionAspiranteModel[] = [];
  public estadoConvocatoria: string;
  public dataConvocatory: Convocatoria;
  public matcher: any;

  public form: FormGroup;
  public submit = false;
  public lstTableAll: ResultadoPruebasModel[] = [];
  public lstTable: ResultadoPruebasModel[] = [];
  public lstTableDetails: ResultadoPruebasModel[] = [];
  public dataSource = new MatTableDataSource<ResultadoPruebasModel>([]);
  public dataSourceInfo = new MatTableDataSource<ResultadoPruebasModel>([]);
  public selection = new SelectionModel<ResultadoPruebasModel>(false, []);
  public lstEtapasConv: Etapa[] = [];
  public lstEtapasCombinacion: CombinacionEtapa[] = [];
  public sortedData: any;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public elementCurrent: any = {};
  public statesBtn = {
    hide: 0,
    btnCurso: 1,
    btnEtapa: 2,
    btnRteCurso: 3,
  }
  public showBtnCurso = this.statesBtn.hide;

  public tipoEtapas: any = null;
  private dialogRefInfo: MatDialogRef<any, any>;

  public idEstadoAspiranteAproboPruebas: Configuration;
  public idEstadoAspiranteNoAproboPruebas: Configuration;
  public idPruebaPsicotecnica: Configuration;

  public showTablaInscripcionAsp = false;

  public lstEstadosTablaInfo: string[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('sortInfo', { static: false }) set sortInfo(value: MatSort) {
    this.dataSourceInfo.sort = value;
  }
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
    private convService: ConvocatoriaService,
    private adminConvocatoria: AdministracionConvocatoriaService,
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

    this.dataSource.filterPredicate = (data: ResultadoPruebasModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.commonService.getNumeroDocumento(data.inscripcionAspiranteModel),
        this.commonService.getNameAspirante(data.inscripcionAspiranteModel),
        data.resultadoFinal,
        this.commonService.getEstadoAspirante(data.inscripcionAspiranteModel),
        this.commonService.getCargoAspirante(data.inscripcionAspiranteModel),
        this.commonService.getGradoCargo(data.inscripcionAspiranteModel),
        this.translateField(data.tipoPruebaModel, 'tipoPrueba', this.lang),
        data.apruebaPuntaje
      ];
      return Constants.filterTable(dataCompare, filter);
    };
  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      idEmpresa: new FormControl(''),
      idConvocatoria: new FormControl(''),
    });
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

  public sortDataInfo(sort: Sort) {
    const data = this.dataSourceInfo.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }
    this.dataSourceInfo.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nombresCompletos': return this.compare(this.commonService.getNameAspirante(a.inscripcionAspiranteModel), this.commonService.getNameAspirante(b.inscripcionAspiranteModel), isAsc);
        case 'resultadoFinal': return this.compare(a.resultadoFinal, b.resultadoFinal, isAsc);
        case 'estadoAspirante': return this.compare(a.apruebaPuntaje, b.apruebaPuntaje, isAsc);
        case 'tipoPrueba': return this.compare(this.translateField(a.tipoPruebaModel, 'tipoPrueba', this.lang), this.translateField(b.tipoPruebaModel, 'tipoPrueba', this.lang), isAsc);
        default: return 0;
      }
    });
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

  public async loadDataByConvocatoria(pConvocatoria: any, validateSize: boolean = false) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.alertService.loading();
    this.lstTable = [];
    this.lstTableAll = [];
    this.lstTableDetails = [];
    this.showBtnCurso = this.statesBtn.hide;
    this.showTablaInscripcionAsp = false;

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
      const idConvocatoria = pConvocatoria.value;
      this.lstTableAll = (await this.convService.getResultadoPruebasByConvocatoria(idConvocatoria).toPromise() as any).datos as ResultadoPruebasModel[];

      const lstProcesoSeleccion = (await this.convService.getProcesoSeleccionByConvocatoria(idConvocatoria).toPromise() as any).datos as ProcesoSeleccionModel[];

      if (this.lstTableAll && this.lstTableAll.length > 0) {

        // consulta de datos necesarios
        this.lstInscripcionesConv = (await this.commonService.getInscripcionesConvocatoria(idConvocatoria).toPromise() as any).datos as InscripcionAspiranteModel[];
        const lstConvocatoriaPerfil = (await this.convService.getConvocatoriaPerfilByConvocatoria(idConvocatoria).toPromise() as any).datos as ConvocatoriaPerfil[];
        this.lstEtapasConv = (await this.convService.getEtapaByConvocatory(idConvocatoria).toPromise() as any).datos as Etapa[];
        this.lstEtapasCombinacion = (await this.convService.getCombinacionEtapaByConvocatoria(idConvocatoria).toPromise() as any).datos as CombinacionEtapa[];

        //tamaño temporal de la lista
        const sizeList = this.lstTableAll.length;

        //variable para almacenar si la convocatoria tiene curso
        let esCurso = false;

        // validar si la convocatoria tiene curso formacion
        const idCursoFormacion = await this.commonService.getVarConfig(configMsg.CURSO_FORMACION_TIPO_PRUEBA);
        if (this.lstTableAll.length > 0 && idCursoFormacion) {
          if (this.lstEtapasConv && this.lstEtapasConv.length > 0) {
            const tpCursoForm = this.lstEtapasConv.find(et => et.idTipoPrueba && et.idTipoPrueba.toUpperCase() === idCursoFormacion.valor.toUpperCase());
            if (tpCursoForm) {
              this.showBtnCurso = this.statesBtn.btnCurso;
              esCurso = true;
            }
          }
          if (this.showBtnCurso !== 1 && this.lstEtapasCombinacion && this.lstEtapasCombinacion.length > 0) {
            const tpCursoForm = this.lstEtapasCombinacion.find(et => et.idTipoPrueba && et.idTipoPrueba.toUpperCase() === idCursoFormacion.valor.toUpperCase());
            if (tpCursoForm) {
              this.showBtnCurso = this.statesBtn.btnCurso;
              esCurso = true;
            }
          }
        }

        // filtrar que los registros no esten en procesoSeleccion
        this.lstTableAll = this.lstTableAll.filter(x => {
          const existe = lstProcesoSeleccion.find(ps =>
            ps.idConvocatoria === x.idConvocatoria &&
            ps.idInscripcionAspirante === x.idInscripcionAspirante &&
            ps.idTipoPrueba === x.idTipoPrueba &&
            ps.idConvocatoriaPerfil === x.idConvocatoriaPerfil);
          return existe ? false : true;
        });

        // mostrar mensaje si no tiene resultados de pruebas
        if ((this.lstTableAll.length === 0 || this.lstTableAll.length < sizeList)) {
          if (!validateSize) {
            this.alertService.message(this.ct.MSG_RESULTADOS_PRUEBAS_PROCESADAS, TYPES.WARNING);
          }
          this.showTablaInscripcionAsp = true;
          this.showBtnCurso = this.statesBtn.hide;
          if (esCurso) {
            this.showBtnCurso = this.statesBtn.btnRteCurso;
          }
        }

        // filtrar los registros y setear datos
        this.lstTableAll = this.lstTableAll.filter(x => {

          const insc = this.lstInscripcionesConv.find(i => i.id === x.idInscripcionAspirante);
          if (insc) {

            // se carga la inscripcion
            x.inscripcionAspiranteModel = insc;
            x.inscripcionAspiranteModel.resumenHVModel = JSON.parse(x.inscripcionAspiranteModel.resumenHV);

            // buscar el tipo prueba
            const tipoPrueba = this.lstTipoPrueba.find(tp => x.idTipoPrueba && tp.id === x.idTipoPrueba);
            if (tipoPrueba) {
              x.tipoPruebaModel = tipoPrueba;
            }

            // se carga convocatoria perfil
            if (lstConvocatoriaPerfil && lstConvocatoriaPerfil.length > 0) {
              const cPerfil = lstConvocatoriaPerfil.find(cp => cp.id === x.inscripcionAspiranteModel.idConvocatoriaPerfil);
              if (cPerfil) {
                cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
                x.inscripcionAspiranteModel.convocatoriaPerfilModel = cPerfil;
              }
            }


            this.setJson(this.tipoEtapas);
            const etapaSel = this.tipoEtapas.valorObj.seleccion;
            // se carga la etapa y tipo prueba
            const lstEtapasRegistro = this.lstEtapasConv.filter(et => et.idTipoPrueba === x.idTipoPrueba && et.idTipoEtapa.toUpperCase() === etapaSel.toUpperCase() && et.visibilidadRegistro === Constants.VISIBLE);

            if (lstEtapasRegistro && lstEtapasRegistro.length > 0) {
              // simple
              if (lstEtapasRegistro.length > 1) {
                console.error('No deberian haber mas de 1 etapa por convocatoria y tipo prueba');
              } else {
                x.apruebaPuntaje = x.resultadoFinal >= lstEtapasRegistro[0].puntajeMaximo && lstEtapasRegistro[0].puntajeMaximo > 0 ? this.ct.MSG_APRUEBA : this.ct.MSG_NO_APRUEBA;
              }
            } else if (this.lstEtapasCombinacion && this.lstEtapasCombinacion.length > 0) {
              // combinada
              const lstEtapasCombinacion = this.lstEtapasCombinacion.filter(et => et.idTipoPrueba === x.idTipoPrueba && et.visibilidadRegistro === Constants.VISIBLE);
              if (lstEtapasCombinacion.length > 1) {
                console.error('No deberian haber mas de 1 etapa combinacion por convocatoria y tipo prueba');
              } else if (lstEtapasCombinacion.length > 0) {
                const etapaRegistro = this.lstEtapasConv.find(er => er.id === lstEtapasCombinacion[0].idEtapa && lstEtapasCombinacion[0].visibilidadRegistro === Constants.VISIBLE);
                let sumaPuntaje = 0;
                this.lstEtapasCombinacion.forEach(ecombi => {
                  this.lstTableAll.forEach(element => {
                    if (ecombi.idTipoPrueba === element.idTipoPrueba && element.idUsuarioAspirante === x.idUsuarioAspirante && element.idInscripcionAspirante === insc.id) {
                      sumaPuntaje += element.resultadoFinal;
                    }
                  });
                });
                if (etapaRegistro) {
                  x.apruebaPuntaje = sumaPuntaje >= etapaRegistro.puntajeMaximo ? this.ct.MSG_APRUEBA : this.ct.MSG_NO_APRUEBA;
                }
              }
            }
            return true;
          }
          return false;
        });

        // mostrar boton curos formacion o boton cambiar etapa
        if (this.lstTableAll.length > 0) {
          if (!esCurso) {
            this.showBtnCurso = this.statesBtn.btnEtapa;
          }
        }
      }
    } else {
      this.lstTableAll = [];
    }

    //filtrar los aspirantes por inscripcion
    this.lstTableAll.forEach(t => {
      const encontro = this.lstTable.find(t2 =>
        t2.inscripcionAspiranteModel.idUsuario === t.inscripcionAspiranteModel.idUsuario &&
        this.commonService.getIdCargoAspirante(t2.inscripcionAspiranteModel) === this.commonService.getIdCargoAspirante(t.inscripcionAspiranteModel) &&
        this.commonService.getGradoCargo(t2.inscripcionAspiranteModel) === this.commonService.getGradoCargo(t.inscripcionAspiranteModel) &&
        t2.idInscripcionAspirante === t.idInscripcionAspirante);
      if (!encontro) {
        this.lstTable.push(t);
      }
    });

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

    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
    this.lstCategoriaAdmintidoModel = ((await this.convService.getCategoriaAdmitidos().toPromise() as any).datos) as CategoriaAdmintidoModel[];
    this.lstTipoPrueba = ((await this.adminConvocatoria.getTipoPruebas().toPromise() as any).datos) as TipoPrueba[];

    this.idEstadoAspiranteAproboPruebas = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_APROBO_PRUEBAS));
    this.idEstadoAspiranteNoAproboPruebas = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_NO_APROBO_PRUEBAS));
    this.idPruebaPsicotecnica = await this.commonService.getVarConfig(configMsg.ID_TIPO_PRUEBA_PSICOTECNICA);

    this.lstEstadosTablaInfo.push(...[
      this.idEstadoAspiranteAproboPruebas.valor,
    ]);

    this.lstTable = [];
    this.dataSource.data = this.lstTable;

    this.tipoEtapas = await this.commonService.getVarConfig(configMsg.TIPO_ETAPAS);
  }

  get f() {
    return this.form.controls;
  }

  public cursoFormacion() {

    this.alertService.comfirmation(this.ct.MSG_EXISTEN_RESULTADOS_PRUEBAS, TYPES.INFO)
      .then(ok1 => {
        if (ok1.value) {
          this.submit = true;
          this.alertService.loading();
          const lstInscripciones: Observable<any>[] = [];

          const lstPersist: Observable<any>[] = [];
          this.lstTableAll.forEach(x => {

            const newItem: ProcesoSeleccionModel = {
              idConvocatoria: x.idConvocatoria,
              idUsuario: x.idUsuarioAspirante,
              idUsuarioModificacion: this.user.id,
              idInscripcionAspirante: x.idInscripcionAspirante,
              idTipoPrueba: x.idTipoPrueba,
              idConvocatoriaPerfil: x.idConvocatoriaPerfil,
              resultadoFinal: x.resultadoFinal,
              aprobo: x.apruebaPuntaje === this.ct.MSG_APRUEBA ? 1 : 0,
              aplicaCursoFormacion: 1,
              apruebaCursoFormacion: null,
              pasaEtapaClasificacion: null,
              pasaListaElegibles: null,
              puntajeClasificacion: 0
            };

            // consultar si tiene pruebas no aprobadas y se valida que no se psicotecnica
            if (this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor)) {
              newItem.aprobo = 1;
              if (this.tienePruebasNoAprobadas(x)) {
                newItem.aprobo = 0;
              }
            } else {
              if (newItem.aprobo == 1) {
                if (this.tienePruebasNoAprobadas(x)) {
                  newItem.aprobo = 0;
                }
              }
            }

            newItem.aplicaCursoFormacion = newItem.aprobo;

            const inscripcionAspirante = this.lstInscripcionesConv.find(ia => ia.id === x.idInscripcionAspirante);

            //actualizar la inscripcion
            if (inscripcionAspirante) {
              if (newItem.aprobo == 1) {
                lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteAproboPruebas.valor));
              } else {
                lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteNoAproboPruebas.valor));
              }
            }

            lstPersist.push(this.convService.saveProcesoSeleccion(newItem));
          });

          //enviar las peticiones 
          forkJoin(lstPersist).subscribe({
            next: (res: any) => {

              forkJoin(lstInscripciones).subscribe({
                next: (res2: any) => {
                  this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value }, true)
                    .then(() => this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                      .finally(() => this.submit = false))
                    .then(() => this.generateRpteCourse())
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
      });
  }

  public async cambiarEtapa() {
    this.submit = true;
    this.alertService.loading();
    const varc = await this.commonService.getVarConfig(configMsg.FORMULA_PUNTAJES_ETAPA_CLASIFICATORIA);
    const tipoEtapas = await this.commonService.getVarConfig(configMsg.TIPO_ETAPAS);
    const valoresDefecto = await this.commonService.getVarConfig(configMsg.VALORES_FORMULA_CLASIFICACION);
    this.setJson(tipoEtapas);
    this.setJson(valoresDefecto);
    const lstInscripciones: Observable<any>[] = [];
    const lstPersist: Observable<any>[] = [];
    this.lstTableAll.forEach(async x => {
      // consultar valores para la formula
      let esPunMin = valoresDefecto.valorObj.esPunMin;
      let esPunMax = valoresDefecto.valorObj.esPunMax;
      let ecPunMin = valoresDefecto.valorObj.ecPunMin;
      let ecPunMax = valoresDefecto.valorObj.ecPunMax;
      let punPrueba = x.resultadoFinal;
      let lstEtapasSel = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.seleccion) && this.areEquals(et.idTipoPrueba, x.idTipoPrueba) && et.visibilidadRegistro === Constants.VISIBLE);
      const lstEtapasClas = this.lstEtapasConv.filter(et => this.areEquals(et.idTipoEtapa, tipoEtapas.valorObj.clasificacion) && et.visibilidadRegistro === Constants.VISIBLE);
      if (lstEtapasSel.length > 0) {
        esPunMin = lstEtapasSel[0].puntajeMaximo;
        esPunMax = lstEtapasSel[0].valorMaximo;
      } else {
        const lstEtapasCombinacion = this.lstEtapasCombinacion.filter(et => this.areEquals(et.idTipoPrueba, x.idTipoPrueba) && et.visibilidadRegistro === Constants.VISIBLE);
        if (lstEtapasCombinacion.length > 0) {
          lstEtapasSel = this.lstEtapasConv.filter(et => this.areEquals(lstEtapasCombinacion[0].idEtapa, et.id) && et.visibilidadRegistro === Constants.VISIBLE);
          esPunMin = lstEtapasSel[0].puntajeMaximo;
          esPunMax = lstEtapasSel[0].valorMaximo;

          if (lstEtapasClas.length > 0) {
            punPrueba = 0;
            //sumatoria
            this.lstEtapasCombinacion.forEach(et => {
              const lstResultadosPruebasTemp = this.lstTableAll.filter(rp => {
                const insAsp = this.lstInscripcionesConv.find(
                  insA => rp.idInscripcionAspirante === insA.id &&
                    x.idInscripcionAspirante === rp.idInscripcionAspirante);
                return insAsp;
              });

              const ps3 = lstResultadosPruebasTemp.find(rpt =>
                et.idTipoPrueba === rpt.idTipoPrueba &&
                et.visibilidadRegistro === Constants.VISIBLE);

              if (ps3) {
                punPrueba += ps3.resultadoFinal;
              }
            });


            const res2 = lstEtapasClas.filter(etc => etc.idTipoPrueba == x.idTipoPrueba)
            if (!res2 || res2.length == 0) {
              punPrueba = 0;
            }
          }

        }
      }
      if (lstEtapasClas.length > 0) {
        ecPunMin = lstEtapasClas[0].valorMinimo;
        ecPunMax = lstEtapasClas[0].valorMaximo;
      }

      // calcular resultado formula
      let resultadoFormula = punPrueba;
      //validar si es prueba diferente a psicotecnica
      if (!this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor)) {
        resultadoFormula = this.commonService.formulaPuntajesClasificatoria(esPunMin, esPunMax, ecPunMin, ecPunMax, punPrueba, varc)
      }
      resultadoFormula = resultadoFormula < 0 ? 0 : resultadoFormula;

      // crear el modelo para insertar
      const newItem: ProcesoSeleccionModel = {
        idConvocatoria: x.idConvocatoria,
        idUsuario: x.idUsuarioAspirante,
        idUsuarioModificacion: this.user.id,
        idInscripcionAspirante: x.idInscripcionAspirante,
        idTipoPrueba: x.idTipoPrueba,
        idConvocatoriaPerfil: x.idConvocatoriaPerfil,
        resultadoFinal: x.resultadoFinal,
        aprobo: x.apruebaPuntaje === this.ct.MSG_APRUEBA ? 1 : 0,
        aplicaCursoFormacion: 0,
        apruebaCursoFormacion: null,
        pasaEtapaClasificacion: 1,
        pasaListaElegibles: null,
        // puntajeClasificacion: resultadoFormula < ecPunMin ? 0 : resultadoFormula
        puntajeClasificacion: resultadoFormula
      };

      // consultar si tiene pruebas no aprobadas y se valida que no se psicotecnica
      if (this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor)) {
        newItem.aprobo = 1;
        if (this.tienePruebasNoAprobadas(x)) {
          newItem.aprobo = 0;
        }
      } else {
        if (newItem.aprobo == 1) {
          if (this.tienePruebasNoAprobadas(x)) {
            newItem.aprobo = 0;
          }
        }
      }

      //actualiza la inscripcin con el nuevo estado
      const inscripcionAspirante = this.lstInscripcionesConv.find(ia => ia.id === x.idInscripcionAspirante);
      if (inscripcionAspirante) {
        if (newItem.aprobo === 1) {
          lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteAproboPruebas.valor));
        } else {
          lstInscripciones.push(this.commonService.actualizarEstadoInscripcionAspirante(inscripcionAspirante.id, inscripcionAspirante.idUsuario, this.idEstadoAspiranteNoAproboPruebas.valor));
        }
      }

      lstPersist.push(this.convService.saveProcesoSeleccion(newItem));
    });
    let resOk = false;
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

  public tienePruebasNoAprobadas(x: ResultadoPruebasModel) {
    if (this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor)) {
      const ok = this.lstTableAll.find(r =>
        r.id !== x.id &&
        this.commonService.getNumeroDocumento(x.inscripcionAspiranteModel) === this.commonService.getNumeroDocumento(r.inscripcionAspiranteModel) &&
        this.commonService.getGradoCargo(x.inscripcionAspiranteModel) === this.commonService.getGradoCargo(r.inscripcionAspiranteModel) &&
        r.apruebaPuntaje === this.ct.MSG_NO_APRUEBA &&
        x.idConvocatoria === r.idConvocatoria &&
        r.idInscripcionAspirante === x.idInscripcionAspirante
      );
      return ok ? true : false;
    } else {
      const ok = this.lstTableAll.find(r =>
        r.id !== x.id &&
        !this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor) &&
        this.commonService.getNumeroDocumento(x.inscripcionAspiranteModel) === this.commonService.getNumeroDocumento(r.inscripcionAspiranteModel) &&
        this.commonService.getGradoCargo(x.inscripcionAspiranteModel) === this.commonService.getGradoCargo(r.inscripcionAspiranteModel) &&
        r.apruebaPuntaje === this.ct.MSG_NO_APRUEBA &&
        x.idConvocatoria === r.idConvocatoria &&
        r.idInscripcionAspirante === x.idInscripcionAspirante
      );
      return ok ? true : false;
    }
  }

  public clean() {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();
    this.f.idEmpresa.setValue('');
    this.f.idEmpresa.updateValueAndValidity();
    this.lstTable = [];
    this.lstTableAll = [];
    this.lstTableDetails = [];
    this.dataSource.data = this.lstTable;
    this.showBtnCurso = this.statesBtn.hide;
    this.showTablaInscripcionAsp = false;
  }

  public verDetalle(element: ResultadoPruebasModel) {
    this.lstTableDetails = this.groupAspirantes(element);

    //validar la prueba psicotecnica
    const tienePsicotecnica = this.lstTableDetails.find(x => this.areEqualsIdGuid(x.idTipoPrueba, this.idPruebaPsicotecnica.valor));
    if (tienePsicotecnica) {
      const noAprueba = this.lstTableDetails.find(x => x.apruebaPuntaje === this.ct.MSG_NO_APRUEBA && !this.areEqualsIdGuid(tienePsicotecnica.id, x.id));
      tienePsicotecnica.apruebaPuntaje = noAprueba ? this.ct.MSG_NO_APRUEBA : this.ct.MSG_APRUEBA;
    }

    this.dataSourceInfo.data = this.lstTableDetails;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public generateRpteCourse() {
    this.submit = true;
    this.alertService.loading();
    this.reporteServ.ObtenerAspiranteAprobadosCursoFormacion(this.f.idConvocatoria.value, this.lang)
      .toPromise()
      .then(async (resReporte: Blob) => {
        this.downloadBlob(resReporte, 'reporte');
        this.alertService.close();
        this.submit = false;
      })
      .catch(erro => this.alertService.showError(erro));

  }


  private groupAspirantes(element: ResultadoPruebasModel) {
    const lstTableDetails = this.lstTableAll.filter(x =>
      x.inscripcionAspiranteModel.idUsuario === element.inscripcionAspiranteModel.idUsuario &&
      this.commonService.getIdCargoAspirante(element.inscripcionAspiranteModel) === this.commonService.getIdCargoAspirante(x.inscripcionAspiranteModel) &&
      this.commonService.getGradoCargo(element.inscripcionAspiranteModel) === this.commonService.getGradoCargo(x.inscripcionAspiranteModel) &&
      x.idInscripcionAspirante === element.idInscripcionAspirante);
    return lstTableDetails;
  }
}
