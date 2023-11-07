import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TypeSede } from '@app/compartido/modelos/type-sede';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-tipo-sede-admin',
  templateUrl: './tipo-sede-admin.component.html',
  styleUrls: ['./tipo-sede-admin.component.scss']
})
export class TipoSedeAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'idTipoConvocatoria', 'sede', 'sede_En', 'idEmpresa', 'codAlterno', 'options'];
  public lstTypeConvocatory: TypeConvocatory [] = [];
  public lstTypeSede: TypeSede [] = [];
  public lstCompanies: Empresa[] = [];
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
    private cs: CommonService,
    private empresaService: EmpresaService,
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
    this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    this.lstTypeConvocatory = <TypeConvocatory[]> (<any> await this.convoService.getTipoConvocatoria().toPromise()).datos;
    this.lstTypeSede = <TypeSede[]> (<any> await this.convoService.getTipoSede().toPromise()).datos;
    if (this.lstTypeSede.length > 0) {
      this.lstTypeSede.forEach(e => {
        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria === Number(g.id)) {
            e.tipoConvocatoria = g.tipoConvocatoria;
            return;
          }
        });

        this.lstCompanies.forEach(x => {
          if (e.idEmpresa !== null) {
            if (e.idEmpresa === x.id) {
              e.nombreEmpresa = x.nombreEmpresa;
              return;
            }
          }
        });
        e.tipoConvocatoria = e.tipoConvocatoria === undefined ? '' : e.tipoConvocatoria;
      });
    }
    this.dataSource.data = this.lstTypeSede;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idTypeConvocatory: new FormControl('', [Validators.required]),
        sede: new FormControl('', [Validators.required]),
        sede_En: new FormControl('', [Validators.required]),
        codAlterne: new FormControl(''),
        idEmpresa: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.sede_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TypeSede) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idTypeConvocatory: element.idTipoConvocatoria,
      sede: element.sede,
      sede_En: element.sede_En,
      codAlterne: element.codAlterno,
      idEmpresa: element.idEmpresa
    });
  }

  public addTypeSede() {

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

    this.alertService.loading();
    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length no-trailing-whitespace
    const obj = this.dataSource.data.find((x: TypeSede) => x.idTipoConvocatoria == Number(this.f.idTypeConvocatory.value) && this.areEquals(x.sede, this.f.sede.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTypeSede: TypeSede = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idTipoConvocatoria: Number(this.f.idTypeConvocatory.value),
      sede: this.f.sede.value,
      sede_En: this.f.sede_En.value,
      codAlterno: this.f.codAlterne.value,
      idEmpresa: this.f.idEmpresa.value ? this.f.idEmpresa.value : null
    };
    this.convoService.saveTipoSede(newTypeSede).toPromise()
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

  public delete(element: TypeSede) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convoService.deleteTipoSede(element)
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
