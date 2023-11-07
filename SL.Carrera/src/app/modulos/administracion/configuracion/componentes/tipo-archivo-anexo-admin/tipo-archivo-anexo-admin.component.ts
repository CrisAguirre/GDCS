import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '../../../../../compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-tipo-archivo-anexo-admin',
  templateUrl: './tipo-archivo-anexo-admin.component.html',
  styleUrls: ['./tipo-archivo-anexo-admin.component.scss']
})
export class TipoArchivoAnexoAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'tipoArchivo', 'tipoArchivo_En', 'codAlterno', 'options'];
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
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private configurationService: AdministracionConfiguracionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService
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
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any> await this.commonService.getTypeFileAnnexed().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        typeFile: new FormControl('', [Validators.required]),
        tipoArchivo_En: new FormControl('', [Validators.required]),
        alternateCode: new FormControl('')
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.tipoArchivo_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TypeFileAnnexed) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      typeFile: element.tipoArchivo,
      tipoArchivo_En: element.tipoArchivo_En,
      alternateCode: element.codAlterno
    });
  }

  public addTipoArchivoAnexo() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return ;
    }

    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length no-trailing-whitespace
    const obj = this.dataSource.data.find((x: TypeFileAnnexed) => this.areEquals(x.tipoArchivo, this.f.typeFile.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTypeFileAnnex: TypeFileAnnexed = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoArchivo: this.f.typeFile.value,
      tipoArchivo_En: this.f.tipoArchivo_En.value,
      codAlterno: this.f.alternateCode.value
    };

    this.configurationService.saveTipoArchivoAnexo(newTypeFileAnnex).toPromise()
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

   public delete(element: TypeFileAnnexed) {
    
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id === element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.configurationService.deleteTipoArchivoAnexo(element)
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
