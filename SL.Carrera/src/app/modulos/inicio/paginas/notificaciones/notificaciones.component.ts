import { element } from 'protractor';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, PermisosAcciones } from '@app/compartido/helpers/enums';
import { AspiranteAdmintidoModel } from '@app/compartido/modelos/aspirante-admitido-model';
import { CategoriaAdmintidoModel } from '@app/compartido/modelos/categoria-admitido-model';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTable: NotificacionModel[] = [];
  public lstNotificacionesAll: NotificacionModel[] = [];
  public lstNotificacionesByConvocatoria: NotificacionModel[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstCompanies: Empresa[] = [];

  private dataTemp = {
    idConvocatoria: null,
    convocatoriaSeleccionada: null
  };
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public convocatoryCurrent: any = {};
  public idEmpresaT = null;
  public showSelectCompany = false;
  public submit = false;
  public showField = false;

  public form: FormGroup;
  public form2: FormGroup;
  public displayedColumns: string[] = ['asunto', 'usuarioDestinatario', 'fecha', 'hora', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
  private dialogRefInfo: MatDialogRef<any, any>;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('matPaginator1', { static: true }) paginator1: MatPaginator;
  @ViewChild('matSort1', { static: true }) sort1: MatSort;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;


  /* Variables selección aspirantes admitidos */
  public lstAspirantesAll: AspiranteAdmintidoModel[] = [];
  public lstAspirantesByConvocatoria: AspiranteAdmintidoModel[] = [];
  public lstAspirantesTemp: AspiranteAdmintidoModel[] = [];
  public lstAspirantesSelectedTemp: AspiranteAdmintidoModel[] = [];
  public selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>();

  public dataSourceAspirantes = new MatTableDataSource<any>();
  public displayedColumnsAspirantes: string[] = ['select', 'numeroDocumento', 'usuario', 'aspiranteAdmitido', 'observacion'];
  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('matSort2', { static: true }) sort2: MatSort;

  constructor(
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private cs: ConvocatoriaService,
    private ct: CustomTranslateService,
    private dialogService: MatDialog,
    private empresaService: EmpresaService,
    private fb: FormBuilder,

  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
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
    this.dataSource.paginator = this.paginator1;
    this.dataSource.sort = this.sort1;

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
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstConvocatories = this.lstConvocatoriesAll;
    this.lstTable = this.filterNotificacionesByEmpresa();
    this.dataSource.data = this.lstTable;
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {

    this.dataTemp.idConvocatoria = pConvocatoria.value;
    /* Carga la convocatoria seleccionada */
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.convocatoryCurrent = <Convocatoria[]>(<any>await this.cs.getConvocatoriaById(pConvocatoria.value).toPromise()).datos;

    if (!this.f.idEmpresa.value) {
      this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
      this.f.idEmpresa.updateValueAndValidity();
    }

    /* Carga los aspirantes por convocatoria */
    // this.lstAspirantesAdmitidos = (await this.cs.getAspiranteAdmitidoByIdConvocatoria(pConvocatoria.value).toPromise() as any).datos;
    this.lstAspirantesByConvocatoria = this.lstAspirantesAll.filter(a => a.idConvocatoria === pConvocatoria.value);

    /* Cargar los aspirantes seleccionadas para una citación */
    this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);

    this.dataSourceAspirantes.data = this.lstAspirantesByConvocatoria;
    this.lstTable = this.filterNotificacionesByConvocatoria();

    this.dataSource.data = this.lstTable;
  }

  public async loadFields(event) {
    this.dataTemp.idConvocatoria = event.value;

    // limpiamos el formulario y seteamos el valor de la convocatoria seleccionada y el id de la empresa
    this.form.reset();
    this.f.idConvocatoria.setValue(this.dataTemp.idConvocatoria);
    /* Carga la convocatoria seleccionada */
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.convocatoryCurrent = <Convocatoria[]>(<any>await this.cs.getConvocatoriaById(event.value).toPromise()).datos;
    this.dataTemp.convocatoriaSeleccionada = this.convocatoryCurrent;
    if (!this.f.idEmpresa.value) {
      this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
      this.f.idEmpresa.updateValueAndValidity();
    }

    /* Carga los aspirantes por convocatoria */
    // this.lstAspirantesAdmitidos = (await this.cs.getAspiranteAdmitidoByIdConvocatoria(pConvocatoria.value).toPromise() as any).datos;
    this.lstAspirantesByConvocatoria = this.lstAspirantesAll.filter(a => a.idConvocatoria === event.value);

    /* Cargar los aspirantes seleccionadas para una citación */
    this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);

    this.loadData();
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idEmpresa: new FormControl(''),
        idConvocatoria: new FormControl(''),
        asunto: new FormControl('', [Validators.required]),
        mensaje: new FormControl('', [Validators.required]),
        copiaACorreo: new FormControl(false)
        /* idUsuarioDestinatario: new FormControl(null, [Validators.required]),
        idUsuarioRemitente: new FormControl('', [Validators.required]), */
      }
    );
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        idEmpresa: new FormControl({ value: '', disabled: true }),
        idConvocatoria: new FormControl({ value: '', disabled: true }),
        asunto: new FormControl({ value: '', disabled: true }),
        mensaje: new FormControl({ value: '', disabled: true }),
        idUsuarioDestinatario: new FormControl({ value: '', disabled: true }),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  public async loadData() {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstNotificacionesAll = (await this.commonService.getTodosNotificaciones().toPromise() as any).datos;
    if (this.lstNotificacionesAll.length > 0) {
      this.lstNotificacionesAll.forEach(async n => {
        const user = (await this.commonService.getDetailSummaryUser(n.idUsuarioDestinatario).toPromise() as any).datos;
        const detailUser = user.datosPersonales;
        n.aspirante = detailUser ? detailUser : '';
        n.nombreAspirante = detailUser ? detailUser.primerNombre + ' ' + detailUser.primerApellido : '';
      });
    }
    // this.dataSource.data = this.lstNotificacionesAll;
    this.lstTable = this.filterNotificacionesByEmpresa();
    this.dataSource.data = this.lstTable;

    this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);
    const lstCategoriasAdmitidos: CategoriaAdmintidoModel[] = (await this.cs.getCategoriaAdmitidos().toPromise() as any).datos;

    // carga las convocatorias
    this.lstConvocatoriesAll = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }
    this.lstConvocatories = this.lstConvocatoriesAll;

    this.lstAspirantesAll = (await this.cs.getAspiranteAdmitidos().toPromise() as any).datos;

    if (this.lstAspirantesAll.length > 0) {
      // this.lstAspirantesAll = this.lstAspirantesAll.filter(x => x.aspiranteAdmitido === 1);
      this.lstAspirantesAll.forEach(async a => {
        const user = (await this.commonService.getDetailSummaryUser(a.idUsuario).toPromise() as any).datos;
        const detailUser = user.datosPersonales;
        a.usuario = detailUser ? detailUser : '';
        a.nombreCompletoUsuario = detailUser ? detailUser.primerNombre + ' ' + detailUser.primerApellido : '';
      });
    }

  }

  public filterNotificacionesByEmpresa = () => {
    const lst = this.lstNotificacionesAll.filter(x => x.idEmpresa === this.f.idEmpresa.value);
    return lst;
  }

  public filterNotificacionesByConvocatoria = () => {
    const lst = this.lstNotificacionesAll.filter(x => x.idConvocatoria === this.f.idConvocatoria.value);
    return lst;
  }

  public edit(element: any) {
    this.scrollTop();

    this.form.patchValue({
      id: element.id,
      idEmpresa: element.idEmpresa,
      idConvocatoria: element.idConvocatoria,
      asunto: element.asunto,
      mensaje: element.mensaje,
      copiaACorreo: element.copiaACorreo
    });
    this.lstAspirantesSelectedTemp = this.lstAspirantesAll.filter(x => x.idUsuario === element.idUsuarioDestinatario);
    this.dataSourceAspirantes.data = this.lstAspirantesSelectedTemp;

    this.selectionAspirante = new SelectionModel<AspiranteAdmintidoModel>(true, this.lstAspirantesSelectedTemp);
  }

  public saveNotificacion() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (!Constants.validateList(this.selectionAspirante.selected)) {
      this.alertService.message(this.ct.MSG_LIST_APPLICANT_EMPTY, TYPES.WARNING);
      this.submit = false;
      return;
    }

    this.alertService.loading();

    this.selectionAspirante.selected.forEach(async a => {
      const newNotificacion: NotificacionModel = {
        asunto: this.f.asunto.value,
        mensaje: this.f.mensaje.value,
        esLeido: 0,
        idUsuarioDestinatario: a.idUsuario, // lista de ID
        idUsuarioRemitente: this.user.id,
        idEmpresa: this.f.idEmpresa.value,
        idConvocatoria: this.f.idConvocatoria.value,
        copiaACorreo: this.f.copiaACorreo.value ? 1 : 0
      };

      await this.commonService.saveNotificacion(newNotificacion).toPromise()
        .then(() => { })
        .catch(error => {
          console.log('err', error);
          this.alertService.showError(error);
        });

      /* this.commonService.saveNotificacion(newNotificacion).toPromise()
        .then(record => {
          this.loadData().then(() => {
            this.cleanForm();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
        }).catch(error => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        }); */
    });
    this.loadFields({ value: this.dataTemp.idConvocatoria })
      .then(() => {
        this.alertService.message(this.ct.MSG_SUCCESSFUL_NOTIFICATION, TYPES.SUCCES)
          .finally(() => this.submit = false);
      });
  }

  sortData(sort: Sort, value?: any) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: NotificacionModel, b: NotificacionModel) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'asunto': return this.compare(a.asunto, b.asunto, isAsc);
        case 'usuarioDestinatario': return this.compare(a.nombreAspirante, b.nombreAspirante, isAsc);
        case 'fecha': return this.compare(a.fechaRegistro, b.fechaRegistro, isAsc);
        default: return 0;
      }
    });
  }

  public async showDetailNotification(element: any) {

    this.form2.patchValue({
      // id: element.id,
      idEmpresa: element.idEmpresa,
      idConvocatoria: element.idConvocatoria,
      asunto: element.asunto,
      mensaje: element.mensaje,
      idUsuarioDestinatario: element.nombreAspirante
    });
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public cleanForm() {
    this.formV.resetForm();
    this.convocatoryCurrent = [];
    this.lstAspirantesByConvocatoria = [];
    this.lstAspirantesTemp = [];
    this.lstAspirantesSelectedTemp = [];
    this.dataSource.data = [];
    this.dataSourceAspirantes.data = [];
    this.selectionAspirante.clear();
    this.submit = false;
  }

  isAllSelected2() {
    const numSelected = this.selectionAspirante.selected.length;
    const numRows = this.dataSourceAspirantes.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle2() {
    this.isAllSelected2() ?
      this.selectionAspirante.clear() :
      this.dataSourceAspirantes.data.forEach(row => this.selectionAspirante.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel2(row?: any): string {
    if (!row) {
      return `${this.isAllSelected2() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAspirante.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}
