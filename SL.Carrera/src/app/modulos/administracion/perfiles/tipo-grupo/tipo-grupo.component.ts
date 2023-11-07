import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Constants as C } from '@app/compartido/helpers/constants';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { administracionPerfilService } from '../../../../core/servicios/administracion-perfil-service';
import { TipoGrupo } from '@app/compartido/modelos/tipo-grupo';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-tipo-grupo',
  templateUrl: './tipo-grupo.component.html',
  styleUrls: ['./tipo-grupo.component.scss']
})
export class TipoGrupoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'grupo', 'grupo_En', 'esGrupo', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private perfilService: administracionPerfilService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private cs: CommonService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadData()
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: TipoGrupo, filter: string): boolean => {
      const dataCompare = [data.grupo, data.grupo_En, (data.esGrupo == 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare , filter);
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'grupo': return this.compare(a.grupo, b.grupo, isAsc);
        case 'grupo_En': return this.compare(a.grupo_En, b.grupo_En, isAsc);
        case 'esGrupo': return this.compare(a.esGrupo, b.esGrupo, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.dataSource.data = (<any>await this.perfilService.getTipoGrupo().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        grupo: new FormControl('', [Validators.required]),
        grupo_En: new FormControl('', [Validators.required]),
        esGrupo: new FormControl(false)
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.grupo_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoGrupo) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      grupo: element.grupo,
      grupo_En: element.grupo_En,
      esGrupo: element.esGrupo == 1 ? true : false,
    });
  }

  public addGrupo() {
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

    const obj = this.dataSource.data.find((x: TipoGrupo) => this.areEquals(x.grupo, this.f.grupo.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    /*const vObj = this.dataSource.data.find(
      (x: any) =>
      x.grupo.replace(/\s/g, '').toUpperCase() === this.f.grupo.value.replace(/\s/g, '').toUpperCase()
    );
    if (vObj) {
      if ((this.f.id && vObj.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }*/

    const newGrupo: TipoGrupo = {
      id: this.f.id.value ? this.f.id.value : undefined,
      grupo: this.f.grupo.value,
      grupo_En: this.f.grupo_En.value,
      esGrupo: this.f.esGrupo.value ? 1 : 0,
    };

    this.perfilService.saveTipoGrupo(newGrupo).toPromise()
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

  public delete(element: TipoGrupo) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
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
          this.perfilService.deleteTipoGrupo(element)
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
