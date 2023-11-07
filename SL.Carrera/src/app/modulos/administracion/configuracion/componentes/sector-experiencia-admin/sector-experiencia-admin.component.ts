import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { SectorExperience } from '@app/compartido/modelos/sector-experience';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { PermisosAcciones } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-sector-experiencia-admin',
  templateUrl: './sector-experiencia-admin.component.html',
  styleUrls: ['./sector-experiencia-admin.component.scss']
})
export class SectorExperienciaAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'codSectorExperiencia', 'sectorExperiencia', 'options'];
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
    this.dataSource.data = (<any> await this.commonService.getSectorExperience().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        codSectorExperience: new FormControl('', [Validators.required]),
        sectorExperience: new FormControl('', [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: SectorExperience) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      codSectorExperience: element.codSectorExperiencia,
      sectorExperience: element.sectorExperiencia
    });
  }

  public addSectorExperience() {

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
    const obj = this.dataSource.data.find((x: SectorExperience) => this.areEquals(x.codSectorExperiencia, this.f.codSectorExperience.value) && this.areEquals(x.sectorExperiencia, this.f.sectorExperience.value) );
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newSectorEx: SectorExperience = {
      id: this.f.id.value ? this.f.id.value : undefined,
      codSectorExperiencia: this.f.codSectorExperience.value,
      sectorExperiencia: this.f.sectorExperience.value
    };
    this.configurationService.saveSectorExperience(newSectorEx).toPromise()
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

  public delete(element: SectorExperience) {

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
          this.configurationService.deleteSectorExperience(element)
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
