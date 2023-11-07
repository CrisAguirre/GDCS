import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '../../../../../core/servicios/common.service';
import { Despachos } from '../../../../../compartido/modelos/despachos';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';

@Component({
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.scss']
})
export class DespachosComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['codigoDespacho', 'despacho', 'codigoMunicipio', 'sede', 'codigoSeccional', 'seccional', 'codigoEspecialidad', 'ordenDespacho', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;
  public submit = false;

  public accionEditar = false;

  public lstDespachos: Despachos[] = [];


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private cs: ConvocatoriaService,
    private ct: CustomTranslateService,
  ) {
    super();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.loadData().then(() => this.alertService.close());

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.lstDespachos = <Despachos[]>(<any>await this.cs.getTodosDespachos().toPromise()).datos;

    this.dataSource.data = this.lstDespachos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        codigoDespacho: new FormControl('', [Validators.required]),
        despacho: new FormControl('', [Validators.required]),
        codigoMunicipio: new FormControl('', [Validators.required]),
        sede: new FormControl('', [Validators.required]),
        codigoSeccional: new FormControl('', [Validators.required]),
        seccional: new FormControl('', [Validators.required]),
        codigoEspecialidad: new FormControl('', [Validators.required]),
        especialidad: new FormControl('', [Validators.required]),
        ordenDespacho: new FormControl('', [Validators.required]),
        codAlterno: new FormControl('')
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Despachos) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);

    this.f.codigoDespacho.disable();
    this.form.patchValue({
      codigoDespacho: element.codigoDespacho,
      despacho: element.despacho,
      codigoMunicipio: element.codigoMunicipio,
      sede: element.sede,
      codigoSeccional: element.codigoSeccional,
      seccional: element.seccional,
      codigoEspecialidad: element.codigoEspecialidad,
      especialidad: element.especialidad,
      ordenDespacho: element.ordenDespacho,
      codAlterno: element.codAlterno
    });
    this.accionEditar = true;
  }


  public addDespacho() {
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

    if (this.accionEditar === false) {
      const obj = this.dataSource.data.find((x: Despachos) => this.areEquals(x.codigoDespacho, this.f.codigoDespacho.value));
      if (obj) {
        if (this.areEquals(this.f.codigoDespacho.value, obj.codigoDespacho)) {
          this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
          this.submit = false;
          return;
        }
      }
    }

    const newDespacho: Despachos = {
      codigoDespacho: this.f.codigoDespacho.value,
      despacho: this.f.despacho.value,
      codigoMunicipio: this.f.codigoMunicipio.value,
      sede: this.f.sede.value,
      codigoSeccional: this.f.codigoSeccional.value,
      seccional: this.f.seccional.value,
      codigoEspecialidad: this.f.codigoEspecialidad.value,
      especialidad: this.f.especialidad.value,
      ordenDespacho: this.f.ordenDespacho.value,
      codAlterno: this.f.codAlterno.value
    };


    this.cs.saveDespachos(newDespacho, this.accionEditar).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
        this.accionEditar = false;
        this.f.codigoDespacho.enable();
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Despachos) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.codigoDespacho);
          this.cs.deleteDespachos(element)
            .subscribe(ok2 => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
      this.accionEditar = false;
      this.f.codigoDespacho.enable();
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.f.codigoDespacho.enable();
  }
}
