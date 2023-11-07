import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Configuration } from '@app/compartido/modelos/configuration';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-configuracion-admin',
  templateUrl: './configuracion-admin.component.html',
  styleUrls: ['./configuracion-admin.component.scss']
})
export class ConfiguracionAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public name: any[] = [];
  public modalidad: any[] = [];
  public displayedColumns: string[] = ['id', 'name', 'value', 'description', 'options'];
  //public selection = new SelectionModel<any>(false, []);
  public elementCurrent: any = {};

  public form: FormGroup;
  public submit = false;
  public dataSource = new MatTableDataSource<any>([]);

  // tslint:disable-next-line: no-output-rename
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private configservis: AdministracionConfiguracionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private cs: CommonService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: Configuration, b: Configuration) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'name': return this.compare(a.nombre, b.nombre, isAsc);
        case 'value': return this.compare(a.valor, b.valor, isAsc);
        case 'description': return this.compare(a.descripcion, b.descripcion, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {

    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any>await this.commonService.getAllMessage().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        valueConfig: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Configuration) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    //this.selection.toggle(element);
    this.f.name.disable();
    this.form.patchValue({
      id: element.id,
      name: element.nombre,
      valueConfig: element.valor,
      description: element.descripcion
    });
  }

  public addconfiguration() {

    if (this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length no-trailing-whitespace
    const obj = this.dataSource.data.find((x: Configuration) => this.areEquals(x.nombre, this.f.name.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newConfiguration: Configuration = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombre: this.f.name.value,
      valor: this.f.valueConfig.value,
      descripcion: this.f.description.value,
    };
    this.configservis.saveConfigInformation(newConfiguration).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public cleanForm() {
    this.formV.resetForm();
    this.f.name.enable();
    this.elementCurrent = {};
  }
}
