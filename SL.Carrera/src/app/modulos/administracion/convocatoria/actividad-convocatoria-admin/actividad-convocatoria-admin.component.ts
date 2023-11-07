import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ConvocatoryActivity } from '@app/compartido/modelos/convocatory-activity';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-actividad-convocatoria-admin',
  templateUrl: './actividad-convocatoria-admin.component.html',
  styleUrls: ['./actividad-convocatoria-admin.component.scss']
})
export class ActividadConvocatoriaAdminComponent extends BaseController implements OnInit, AfterViewChecked {
  public displayedColumns: string[] = ['id','actividadConvocatoria', 'actividadConvocatoria_En', 'codAlterno', 'ordenLista', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  // tslint:disable-next-line: no-output-rename
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private convoService: AdministracionConvocatoriaService,
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

  public async loadData() {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any> await this.convoService.getActividadConvocatoria().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        activityConv: new FormControl('', [Validators.required]),
        actividadConvocatoria_En: new FormControl('', [Validators.required]),
        codAlterne: new FormControl(''),
        orderList: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.min(1)])
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.actividadConvocatoria_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: ConvocatoryActivity) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      activityConv: element.actividadConvocatoria,
      actividadConvocatoria_En: element.actividadConvocatoria_En,
      codAlterne: element.codAlterno,
      orderList: element.ordenLista
    });
  }

  public addConvocatoryActivity() {

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
    const obj = this.dataSource.data.find((x: ConvocatoryActivity) => this.areEquals(x.actividadConvocatoria, this.f.activityConv.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newConvocatoryAc: ConvocatoryActivity = {
      id: this.f.id.value ? this.f.id.value : undefined,
      actividadConvocatoria: this.f.activityConv.value,
      actividadConvocatoria_En: this.f.actividadConvocatoria_En.value,
      codAlterno: this.f.codAlterne.value,
      ordenLista: Number(this.f.orderList.value)
    };
    this.convoService.saveActividadConvocatoria(newConvocatoryAc).toPromise()
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

  public delete(element: ConvocatoryActivity) {
    
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convoService.deleteActividadConvocatoria(element)
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
