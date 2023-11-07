import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';
import { TypePlace } from '@app/compartido/modelos/type-place';

@Component({
  selector: 'app-tipo-dependencia-lugar',
  templateUrl: './tipo-dependencia-lugar.component.html',
  styleUrls: ['./tipo-dependencia-lugar.component.scss']
})
export class TipoDependenciaLugarComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstDependeciaLugar: TipoDependenciaHija[] = [];
  public lstTypePlace: TypePlace[] = [];

  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['id', 'tipoLugar', 'nombre', 'nombre_En', 'options'];

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private ct: CustomTranslateService,
    private cs: CommonService,
    private convoService: AdministracionConvocatoriaService,
  ) {
    super();
   }
   ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    this.lstTypePlace = <TypePlace[]> (<any> await this.convoService.getTipoLugar().toPromise()).datos;
    this.lstDependeciaLugar = <TipoDependenciaHija[]> (<any> await this.convoService.getTipoDependenciaHija().toPromise()).datos;
    if (this.lstDependeciaLugar.length > 0) {
      this.lstDependeciaLugar.forEach(e => {
        this.lstTypePlace.forEach(g => {
          if (e.idLugar === g.id) {
            e.tipoLugar = g.tipo;
            return;
          }
        });
      });
    }

    this.dataSource.data = this.lstDependeciaLugar;
  }


  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idLugar: new FormControl('', [Validators.required]),
        nombre: new FormControl('', [Validators.required]),
        nombre_En: new FormControl('', [Validators.required]),
        codAlterne: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.nombre_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoDependenciaHija) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idLugar: element.idLugar,
      nombre: element.nombre,
      nombre_En: element.nombre_En,
      codAlterne: element.codAlterno
    });
  }


  public addDependeciaLugar() {

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

    const obj = this.dataSource.data.find((x: TipoDependenciaHija) => this.areEquals(x.idLugar, this.f.idLugar.value) && this.areEquals(x.nombre, this.f.nombre.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newLugar: TipoDependenciaHija = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idLugar: this.f.idLugar.value,
      nombre: this.f.nombre.value,
      nombre_En: this.f.nombre_En.value,
      codAlterno: this.f.codAlterne.value,
    };
    this.convoService.saveTipoDependenciaHija(newLugar).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: TipoDependenciaHija) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convoService.deleteTipoDependenciaHija(element.id)
            .subscribe(o => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
                this.alertService.showError(err);
            });
        }
      });
  }
  
  private deleteIsSelected(id){
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }
  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}

