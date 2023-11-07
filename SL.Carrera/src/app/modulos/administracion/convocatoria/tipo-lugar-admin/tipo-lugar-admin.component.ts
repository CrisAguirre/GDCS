import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-tipo-lugar-admin',
  templateUrl: './tipo-lugar-admin.component.html',
  styleUrls: ['./tipo-lugar-admin.component.scss']
})
export class TipoLugarAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'tipo', 'tipo_En', 'lugar', 'codAlterno', 'options'];
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
    this.dataSource.data = (<any>await this.convoService.getTipoLugar().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        type: new FormControl('', [Validators.required]),
        tipo_En: new FormControl('', [Validators.required]),
        place: new FormControl('', [Validators.required]),
        codAlterne: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.tipo_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TypePlace) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      type: element.tipo,
      tipo_En: element.tipo_En,
      place: element.lugar,
      codAlterne: element.codAlterno
    });
  }

  public addTypePlace() {

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
    const obj = this.dataSource.data.find((x: TypePlace) => this.areEquals(x.tipo, this.f.type.value) && this.areEquals(x.lugar, this.f.place.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTypePlace: TypePlace = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipo: this.f.type.value,
      tipo_En: this.f.tipo_En.value,
      lugar: this.f.place.value,
      codAlterno: this.f.codAlterne.value
    };
    this.convoService.saveTipoLugar(newTypePlace).toPromise()
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

  public delete(element: TypePlace) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          //validar si el lugar se encuentra presente en las convocatorias registradas
          this.convoService.existeTipoLugarEnConvocatoria(element.id).subscribe(
            (r: any) => {
              if (r.existe){
                this.alertService.message(this.ct.MSG_DELETE_RECORD_CONSTRAINT, TYPES.WARNING);
                return;
              }
              this.deleteIsSelected(element.id);
              this.convoService.deleteTipoLugar(element)
                .subscribe(o => {
                  this.loadData()
                    .then(r => {
                      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                    });
                }, err => {
                  this.alertService.showError(err);
                });
            }, error => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            }
          );

        }
      });
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }

}
