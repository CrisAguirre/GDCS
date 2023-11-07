import { Component, OnInit, Output, ViewChild, ChangeDetectorRef, AfterViewChecked, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { EstadoAspirante } from '@app/compartido/modelos/estado-aspirante';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-estado-aspirante',
  templateUrl: './estado-aspirante.component.html',
  styleUrls: ['./estado-aspirante.component.scss']
})
export class EstadoAspiranteComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'estadoAspirante', 'estadoAspirante_En', 'descripcion', 'options'];
  public lstStates: EstadoAspirante[] = [];
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

  ngOnInit() {
    C.sendMessage(true, this.messageEvent); // aqui le envia al padre que muestre la barra de carga
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent); // aqui cuando ya termina le dice que no la uestre con false
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstStates = <EstadoAspirante[]> (<any> await this.convService.getTipoEstadoAspirante().toPromise()).datos;
    this.dataSource.data = this.lstStates;
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
        case 'estadoAspirante': return this.compare(a.estadoAspirante, b.estadoAspirante, isAsc);
        case 'estadoAspirante_En': return this.compare(a.estadoAspirante_En, b.estadoAspirante_En, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        estadoAspirante: new FormControl('', [Validators.required]),
        estadoAspirante_En: new FormControl('', [Validators.required]),
        descripcion: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.estadoAspirante_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: EstadoAspirante) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      estadoAspirante: element.estadoAspirante,
      estadoAspirante_En: element.estadoAspirante_En,
      descripcion: element.descripcion
    });
  }

  public addApplicantState() {

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
    const obj = this.lstStates.find((x: EstadoAspirante) => this.areEquals(x.estadoAspirante, this.f.estadoAspirante.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newApplicantState: EstadoAspirante = {
      id: this.f.id.value ? this.f.id.value : undefined,
      estadoAspirante: this.f.estadoAspirante.value,
      estadoAspirante_En: this.f.estadoAspirante_En.value,
      descripcion: this.f.descripcion.value
    };

    this.convService.saveTipoEstadoAspirante(newApplicantState).toPromise()
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

  public delete(element: EstadoAspirante) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.convService.deleteTipoEstadoAspirante(element)
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
    this.f.name.enable();
  }
}
