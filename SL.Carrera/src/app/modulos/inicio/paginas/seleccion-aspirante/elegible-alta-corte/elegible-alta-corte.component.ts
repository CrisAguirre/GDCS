import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, documentsType, modulesSoports, PermisosAcciones, PermisosEspeciales, stateConvocatoria } from '@app/compartido/helpers/enums';
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
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { AdmitidoAltasCortesModel } from '@app/compartido/modelos/admitido-altas-cortes-model';
import { User } from '@app/compartido/modelos/user';
import { FilesService } from '@app/core/servicios/files.service';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';
import { AspiranteAdmintidoModel } from '@app/compartido/modelos/aspirante-admitido-model';
import { SoporteModel } from '@app/compartido/modelos/soporte-model';
import { forkJoin, Observable } from 'rxjs';
import { Configuration } from '@app/compartido/modelos/configuration';


@Component({
  selector: 'app-elegible-alta-corte',
  templateUrl: './elegible-alta-corte.component.html',
  styleUrls: ['./elegible-alta-corte.component.scss']
})
export class ElegibleAltaCorteComponent extends BaseController implements OnInit, AfterViewChecked {

  private user: User = this.commonService.getVar(configMsg.USER);
  public displayedColumns: string[] = ['select', 'identificacion', 'nombreAspirante', 'cargoAspirante', 'gradoCargo', 'dependencia', 'estadoAspirante', 'options'];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];
  public lstCategoriaAdmintidoModel: CategoriaAdmintidoModel[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstAdmintidosAltasCortes: AdmitidoAltasCortesModel[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;
  public matcher: any;

  public form: FormGroup;
  public form2: FormGroup;
  public submit = false;
  public lstTable: InscripcionAspiranteModel[] = [];
  public dataSource = new MatTableDataSource<InscripcionAspiranteModel>([]);
  public sortedData: any;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public elementCurrent: any = {};
  public showBtnNotificar = false;
  public showBtnGuardar = false;
  public fileModel: SoporteModel = null;
  public varAltasCortes: Configuration;
  public idEstadoAspiranteElegido: Configuration;
  public idEstadoAspiranteRechazado: Configuration;
  public idEstadoAspirantePreseleccionado: Configuration;

  public identificacion: FormControl = new FormControl({ value: '', disabled: true });
  public nombreAspirante: FormControl = new FormControl({ value: '', disabled: true });
  public cargoAspirante: FormControl = new FormControl({ value: '', disabled: true });

  private canSendEmail = false;
  public existeElegido = false;

  /* Variables selección aspirantes admitidos */
  /* public lstInscripcionesAspiranteAll: InscripcionAspiranteModel[] = [];
  public lstInscripcionesAspiranteByConvocatoria: InscripcionAspiranteModel[] = []; */
  public lstInscripcionesAspiranteSelectedTemp: InscripcionAspiranteModel[] = [];
  public selection = new SelectionModel<InscripcionAspiranteModel>();
  @ViewChild('picker', { static: true }) picker: any;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
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
    private fileService: FilesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = Constants.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);

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

    this.dataSource.filterPredicate = (data: InscripcionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.commonService.getNumeroDocumento(data),
        this.commonService.getCargoAspirante(data),
        this.commonService.getGradoCargo(data),
        this.commonService.getTipoDependencia(data),
        this.commonService.getDependenciaLugar(data),
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

    this.form2 = this.fb.group({
      requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]]
    });

  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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
        case 'identificacion': return this.compare(this.commonService.getNumeroDocumento(a), this.commonService.getNumeroDocumento(b), isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a), this.commonService.getCargoAspirante(b), isAsc);
        case 'gradoCargo': return this.compare(this.commonService.getGradoCargo(a), this.commonService.getGradoCargo(b), isAsc);
        case 'dependencia': return this.compare(this.commonService.getTipoDependencia(a), this.commonService.getTipoDependencia(b), isAsc);
        case 'lugar': return this.compare(this.commonService.getDependenciaLugar(a), this.commonService.getDependenciaLugar(b), isAsc);
        case 'estadoAspirante': return this.compare(a.estadoAspiranteModel['nombreCategoria' + this.lang], a.estadoAspiranteModel['nombreCategoria' + this.lang], isAsc);
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

    // filtrar que las convocatorias solo esten en altas cortes
    this.filtrarConvocatoriasAltasCortes();

    //filtrar las convocatorias activas
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
      //consultar las inscripciones por convocatoria
      this.lstTable = (await this.commonService.getInscripcionesConvocatoria(pConvocatoria.value).toPromise() as any).datos as InscripcionAspiranteModel[];

      this.selection = new SelectionModel<InscripcionAspiranteModel>(true, this.lstInscripcionesAspiranteSelectedTemp);
      // filtramos si el proceso ya paso por este paso y existe al menos un aspirante elegido
      // const procesoFinalizo = this.lstTable.find(x => x.idEstadoAspirante.toUpperCase() === this.idEstadoAspiranteElegido.valor.toUpperCase());
      const encuentraElegido = this.lstTable.find(x => x.idEstadoAspirante.toUpperCase() === this.idEstadoAspiranteElegido.valor.toUpperCase());
      this.existeElegido = encuentraElegido ? true : false;

      // consultamos los convocatoria perfil
      const lstConvPerfil = (await this.convService.getConvocatoriaPerfilByConvocatoria(pConvocatoria.value).toPromise() as any).datos as ConvocatoriaPerfil[];

      // funcion para setear datos de la inscripcion
      let funcSetJsonPF = (lstInsc: InscripcionAspiranteModel[], lstPerfilConv: ConvocatoriaPerfil[]) => {
        lstInsc.forEach(x => {
          x.resumenHVModel = JSON.parse(x.resumenHV);
          x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
          const cPerfil = lstPerfilConv.find(cp => cp.id === x.idConvocatoriaPerfil);
          cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
          x.convocatoriaPerfilModel = cPerfil;
        });
        return lstInsc;
      }

      // usar la funcion para setear los datos necesarios
      this.lstTable = funcSetJsonPF(this.lstTable, lstConvPerfil);

      // Si el proceso ya pasó y existe por lo menos un aspirante elegido solo se muestra el boton de notificar 
      // de lo contrario se muestra el listado para poder seleccionar y guardar
      if (this.existeElegido) {
        // filtramos solo los aspirantes con estado elegido y preseleccionado
        this.lstTable = this.lstTable.filter(x => x.idEstadoAspirante.toUpperCase() === this.idEstadoAspiranteElegido.valor.toUpperCase() ||
          x.idEstadoAspirante.toUpperCase() === this.idEstadoAspirantePreseleccionado.valor.toUpperCase());

        // consulta los admitidos altas cortes
        this.lstAdmintidosAltasCortes = (await this.commonService.getAdmitidosAltasCortesConvocatoria(pConvocatoria.value).toPromise() as any).datos as AdmitidoAltasCortesModel[];

        // mostrar u ocultar botones
        this.showBtnNotificar = this.canSendEmail == true;
        this.showBtnGuardar = false;

        // desactivar el campo del archivo
        this.f2.requiredfile.disable();
        this.f2.requiredfile.updateValueAndValidity();
      } else {
        // filtramos solo los aspirantes con estado preseleccionado
        this.lstTable = this.lstTable.filter(x => x.idEstadoAspirante.toUpperCase() === this.idEstadoAspirantePreseleccionado.valor.toUpperCase());

        // mostrar boton de guardar
        this.showBtnNotificar = false;
        this.showBtnGuardar = true;

        // activar el campo del archivo
        this.f2.requiredfile.enable();
        this.f2.requiredfile.updateValueAndValidity();
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

    //verificar si tiene permiso para mostrar el boton de enviar correo
    this.canSendEmail = this.commonService.hasPermissionUserActionEspecial([PermisosEspeciales.EnviarCorreo]);

    // carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatories = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatories = ((await this.convService.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatories = ((await this.convService.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }

    //cargar la variable de altas cortes
    this.varAltasCortes = (await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES));
    this.setJson(this.varAltasCortes);

    // filtrar las convocatorias por solo altas cortes
    this.filtrarConvocatoriasAltasCortes();


    // filtrar las convocatorias activas
    this.lstConvocatories = this.lstConvocatories.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES
    );

    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
    this.lstCategoriaAdmintidoModel = ((await this.convService.getCategoriaAdmitidos().toPromise() as any).datos) as CategoriaAdmintidoModel[];

    // cargar las variables de configuracion
    this.idEstadoAspiranteElegido = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_ELEGIDO));
    this.idEstadoAspiranteRechazado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_RECHAZADO));
    this.idEstadoAspirantePreseleccionado = (await this.commonService.getVarConfig(configMsg.ESTADO_ASPIRANTE_PRESELECCIONADO));

    this.lstTable = [];
    this.dataSource.data = this.lstTable;
    this.lstInscripcionesAspiranteSelectedTemp = [];
    this.selection = new SelectionModel<InscripcionAspiranteModel>(true, this.lstInscripcionesAspiranteSelectedTemp);
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  private async filtrarConvocatoriasAltasCortes() {
    this.lstConvocatories = this.lstConvocatories.filter(conv => conv.idTipoLugar.toUpperCase().includes(String(this.varAltasCortes.valorObj.id_altas_cortes).toUpperCase()));
  }

  public cleanForm() {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();
    this.f.idEmpresa.setValue('');
    this.f.idEmpresa.updateValueAndValidity();
    this.lstTable = [];
    this.lstInscripcionesAspiranteSelectedTemp = [];
    this.dataSource.data = this.lstTable;
    this.identificacion.setValue('');
    this.nombreAspirante.setValue('');
    this.cargoAspirante.setValue('');
    this.f2.requiredfile.setValue('');
    this.f2.requiredfile.updateValueAndValidity();
    this.identificacion.updateValueAndValidity();
    this.nombreAspirante.updateValueAndValidity();
    this.cargoAspirante.updateValueAndValidity();
    this.selection.clear();
    this.fileModel = null;
    this.existeElegido = false;
  }

  /**
   * Valida si el aspirante de la inscripción que recibe como parámetro, tiene su estado en Elegido 
   * @param element - Inscripción aspirante
   * @returns - TRUE, si el aspirante está en estado elegido, de lo contrario FALSE
   */
  public validateElement(element: InscripcionAspiranteModel) {
    if (element && element.idEstadoAspirante === this.idEstadoAspiranteElegido.valor) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Carga la información del aspirante admitido altas cortes y luego carga el soporte guardado
   * @param element - Inscripción aspirante
   */
  public loadInfoElegido(element: InscripcionAspiranteModel) {
    if (this.lstAdmintidosAltasCortes.length > 0) {
      const admitidoAltasCortes = this.lstAdmintidosAltasCortes.find(aac => aac.idInscripcionAspirante === element.id);
      if (admitidoAltasCortes) {
        this.viewFile(admitidoAltasCortes.soporte);
      }
    }
  }

  public async save() {
    this.submit = true;

    // validar el formulario
    if (this.form2.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f2.requiredfile.markAsTouched();
      return;
    }

    if (!Constants.validateList(this.selection.selected)) {
      this.alertService.message(this.ct.MSG_LIST_APPLICANT_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }

    this.alertService.comfirmation(this.ct.MSG_ELEGIBLE_ALTAS_CORTES_CONFIRMACION, TYPES.WARNING)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

          //guardar el archivo
          let documentFile: any = {};
          if (this.f2.requiredfile.value) {
            const file = (<FileInput>this.f2.requiredfile.value).files[0];
            const params = {
              NombreSoporte: Constants.generateNameFile(file.name, 'elegible', modulesSoports.INSCRIPCION_VACANTES, documentsType.INSCRIPCION_VACANTES, this.commonService.getDateString()),
              Modulo: modulesSoports.INSCRIPCION_VACANTES,
              NombreAuxiliar: file.name,
              idUsuarioModificacion: this.user.id
            };
            documentFile = await this.fileService.postFile(file, params).toPromise();
          }

          const lstPost: Observable<any>[] = [];
          this.selection.selected.forEach(async insc => {
            // crear el registro para guardar en AdmitidoAltasCortes
            const newAdmitido: AdmitidoAltasCortesModel = {
              idUsuarioModificacion: this.user.id,
              idInscripcionAspirante: insc.id,
              idUsuario: insc.idUsuario,
              codigoAlterno: '',
              aspiranteAdmitido: 1,
              soporte: documentFile.id,
            };

            // Se agrega al listado de observables para insertar
            lstPost.push(this.commonService.saveAdmitidosAltasCortes(newAdmitido));
            insc.idEstadoAspirante = this.idEstadoAspiranteElegido.valor;
            lstPost.push(this.commonService.actualizarEstadoInscripcionAspirante(insc.id, this.user.id, insc.idEstadoAspirante))

          });

          // enviar las peticiones al servidor
          forkJoin(lstPost).subscribe({
            next: (res: any) => {
              this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                .finally(() => {
                  // this.selection.clear();
                  this.mostrarBotonNotificar();
                  this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
                  this.submit = false;
                });
            },
            error: (error) => {
              this.alertService.showError(error);
              this.submit = false;
            }
          });
        }
      });
  }

  public enviarNotificacion() {
    this.alertService.comfirmation(this.ct.MSG_COMUNICADO_ELEGIDOS_RECHAZADOS, TYPES.INFO)
      .then(async ok => {
        if (ok.value) {
          this.alertService.loading();

          this.submit = false;

          const lstPost: Observable<any>[] = [];

          this.lstTable.forEach(async (inscripcion: InscripcionAspiranteModel) => {

            let estadoAspirante = null;
            if (this.areEqualsIdGuid(inscripcion.estadoAspiranteModel.id, this.idEstadoAspiranteElegido.valor) ||
              this.areEqualsIdGuid(inscripcion.estadoAspiranteModel.id, this.idEstadoAspiranteRechazado.valor)) {

              // determinar si fue elegido o rechazado
              estadoAspirante = this.areEqualsIdGuid(inscripcion.estadoAspiranteModel.id, this.idEstadoAspiranteElegido.valor) ? 'Elegido' : 'Rechazado';

              // buscar las convocatorias
              const c = this.lstConvocatories.find(conv => conv.id === inscripcion.idConvocatoria);

              // armar la plantilla html
              const msg = `
                Estimado aspirante ${this.commonService.getNameAspirante(inscripcion)}
                <br /><br />
                A continuación, encontrará información del estado del proceso al cual aplicó en el CARJUD-APP.
                <br /><br />
                Nombre del cargo: ${this.commonService.getCargoAspirante(inscripcion)}<br />
                Grado cargo: ${this.commonService.getGradoCargo(inscripcion)}<br />
                Nombre de la convocatoria: ${c.nombreConvocatoria}<br />
                Número de la convocatoria: ${c.numeroConvocatoria}<br />
                Estado aspirante: ${estadoAspirante}<br />
                <br />
                Por favor conservar el correo.`;

              // consultar la empresa
              let idEmpresaString = this.f.idEmpresa.value;
              if (!this.f.idEmpresa.value || this.f.idEmpresa.value === '') {
                idEmpresaString = c.idEmpresa;
              }

              const newNotificacion: NotificacionModel = {
                asunto: 'Estado aspirante.',
                mensaje: msg,
                esLeido: 0,
                idUsuarioDestinatario: inscripcion.idUsuario,
                idUsuarioRemitente: this.user.id,
                idEmpresa: idEmpresaString,
                idConvocatoria: this.f.idConvocatoria.value,
                copiaACorreo: 1
              };
              lstPost.push(this.commonService.saveNotificacion(newNotificacion));
            }
          });

          // enviar las notificaciones
          forkJoin(lstPost).subscribe({
            next: (res: any) => {
              this.alertService.message(this.ct.NOTIFICACION_EXITOSA, TYPES.SUCCES);
              this.submit = false;

            },
            error: (error) => {
              this.alertService.showError(error);
              this.submit = false;
            }
          });

        }
      });
  }

  private mostrarBotonNotificar() {
    if (this.lstTable && this.lstTable.length > 0) {
      const find = this.lstTable.find(x => x.estadoAspiranteModel.nombreCategoria === 'Inscrito');
      this.showBtnNotificar = find === undefined && this.canSendEmail == true ? true : false;
    } else {
      this.showBtnNotificar = false;
    }

  }

  public viewFile(id: string) {
    if (!id) {
      return;
    }
    this.fileService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        Constants.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public deleteFileView() {
    this.fileModel = null;
    Constants.setValidatorFile(true, this.f2.requiredfile, this.configFile.sizeFile);
    this.f2.requiredfile.setValue(null);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}

