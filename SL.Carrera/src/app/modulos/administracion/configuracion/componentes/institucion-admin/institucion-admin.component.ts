import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { Institution } from '@app/compartido/modelos/institution';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { PermisosAcciones } from '@app/compartido/helpers/enums';


@Component({
  selector: 'app-institucion-admin',
  templateUrl: './institucion-admin.component.html',
  styleUrls: ['./institucion-admin.component.scss']
})
export class InstitucionAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'institucion', 'nitInstitucion', 'institucionDVNit', 'institucionTelefono', 'institucionDireccion', 'esAdscrita', 'esEducativa', 'codCiudad', 'codIcfes', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  
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
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any> await this.commonService.getInstitutions().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idClass: new FormControl(''),
        institution: new FormControl('', [Validators.required]),
        nitInstitution: new FormControl('', [Validators.required]),
        institutionDVNit: new FormControl('', [Validators.required]),
        institutionTelephone: new FormControl('', [Validators.required]),
        institutionAddress: new FormControl('', [Validators.required]),
        sAscribed: new FormControl('', [Validators.required]),
        sEducational: new FormControl('', [Validators.required]),
        codCity: new FormControl('', [Validators.required]),
        codIcfes: new FormControl('', [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Institution) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      idClass: element.idClase,
      institution: element.institucion,
      nitInstitution: element.nitInstitucion,
      institutionDVNit: element.institucionDVNit,
      institutionTelephone: element.institucionTelefono,
      institutionAddress: element.institucionDireccion,
      sAscribed: element.esAdscrita,
      sEducational: element.esEducativa,
      codCity: element.codCiudad,
      codIcfes: element.codIcfes
    });
  }

  public addInstitution() {

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
      return;
    }

    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length no-trailing-whitespace
    const obj = this.dataSource.data.find((x: Institution) => this.areEquals(x.institucion, this.f.institution.value) && this.areEquals(x.nitInstitucion, this.f.nitInstitution.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newInstitution: Institution = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idClase: this.f.idClass.value ? this.f.id.value : undefined,
      institucion: this.f.institution.value,
      nitInstitucion: this.f.nitInstitution.value,
      institucionDVNit: this.f.institutionDVNit.value,
      institucionTelefono: this.f.institutionTelephone.value,
      institucionDireccion: this.f.institutionAddress.value,
      esAdscrita: this.f.sAscribed.value,
      esEducativa: this.f.sEducational.value,
      codCiudad: this.f.codCity.value,
      codIcfes: this.f.codIcfes.value,
    };
    this.configurationService.saveInstitution(newInstitution).toPromise()
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

  public delete(element: Institution) {

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
          this.configurationService.deleteInstitution(element)
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
