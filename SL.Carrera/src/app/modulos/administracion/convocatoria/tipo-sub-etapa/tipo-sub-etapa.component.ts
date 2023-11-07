import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TipoSubEtapa } from '@app/compartido/modelos/tipo-sub-etapa';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-tipo-sub-etapa',
  templateUrl: './tipo-sub-etapa.component.html',
  styleUrls: ['./tipo-sub-etapa.component.scss']
})
export class TipoSubEtapaComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'nombreSubEtapa', 'tipoSubEtapa_En', 'codigoAlterno', 'options'];
  public lstSubStages: TipoSubEtapa[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
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
    private convService: AdministracionConvocatoriaService,
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
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstSubStages = <TipoSubEtapa[]> (<any> await this.convService.getTipoSubEtapas().toPromise()).datos;
    this.dataSource.data = this.lstSubStages;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'nombreSubEtapa': return this.compare(a.tipoSubEtapa, b.tipoSubEtapa, isAsc);
        case 'tipoSubEtapa_En': return this.compare(a.tipoSubEtapa_En, b.tipoSubEtapa_En, isAsc);
        case 'codigoAlterno': return this.compare(a.codAlterno, b.codAlterno, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        tipoSubEtapa: new FormControl('', [Validators.required]),
        tipoSubEtapa_En: new FormControl('', [Validators.required]),
        codAlterno: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.tipoSubEtapa_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoSubEtapa) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      tipoSubEtapa: element.tipoSubEtapa,
      tipoSubEtapa_En: element.tipoSubEtapa_En,
      codAlterno: element.codAlterno
    });
  }

  public addSubStageType() {
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
    const obj = this.lstSubStages.find((x: TipoSubEtapa) => this.areEquals(x.tipoSubEtapa, this.f.tipoSubEtapa.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newTypePlace: TipoSubEtapa = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoSubEtapa: this.f.tipoSubEtapa.value,
      tipoSubEtapa_En: this.f.tipoSubEtapa_En.value,
      codAlterno: this.f.codAlterno.value
    };
    this.convService.saveTipoSubEtapa(newTypePlace).toPromise()
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

  public delete(element: TipoSubEtapa) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convService.deleteTipoSubEtapa(element)
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
