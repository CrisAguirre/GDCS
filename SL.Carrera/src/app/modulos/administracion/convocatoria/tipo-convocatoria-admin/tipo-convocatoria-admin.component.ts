import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';



@Component({
  selector: 'app-tipo-convocatoria-admin',
  templateUrl: './tipo-convocatoria-admin.component.html',
  styleUrls: ['./tipo-convocatoria-admin.component.scss']
})
export class TipoConvocatoriaAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'tipoConvocatoria', 'tipoConvocatoria_En', 'codAlterno', 'options'];
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
    this.dataSource.data = (<any> await this.convoService.getTipoConvocatoria().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        typeConvocatory: new FormControl('', [Validators.required]),
        tipoConvocatoria_En: new FormControl('', [Validators.required]),
        codAlterne: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.tipoConvocatoria_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TypeConvocatory) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      typeConvocatory: element.tipoConvocatoria,
      tipoConvocatoria_En: element.tipoConvocatoria_En,
      codAlterne: element.codAlterno
    });
  }

  public addTypeConvocatory() {

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
    const obj = this.dataSource.data.find((x: TypeConvocatory) => this.areEquals(x.tipoConvocatoria, this.f.typeConvocatory.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTypeConvocatory: TypeConvocatory = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoConvocatoria: this.f.typeConvocatory.value,
      tipoConvocatoria_En: this.f.tipoConvocatoria_En.value,
      codAlterno: this.f.codAlterne.value
    };
    this.convoService.saveTipoConvocatoria(newTypeConvocatory).toPromise()
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

  public delete(element: TypeConvocatory) {

    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convoService.deleteTipoConvocatoria(element)
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
