import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '../../../../../compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { NgForm, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { AdministracionConvocatoriaService } from '../../../../../core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { DetallesCalendario } from '../../../../../compartido/modelos/detalles-calendario';
import { Calendario } from '@app/compartido/modelos/calendario';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent extends BaseController implements OnInit, AfterViewChecked {


  public displayedColumns: string[] = ['calendario', 'options'];
  public displayedColumns2: string[] = ['idCalendario', 'fechaNoHabil', 'options'];

  public dataSource = new MatTableDataSource<any>([]);
  public dataSource2 = new MatTableDataSource<any>([]);

  public form: FormGroup;
  public form2: FormGroup;

  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};

  public lstCalendario: Calendario[] = [];
  public lstDetallesCalendario: DetallesCalendario[] = [];

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;


  @ViewChild( 'MatPaginatorOne', { static: true }) paginator: MatPaginator;
  @ViewChild( 'MatSortOne' , { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;


  constructor(
    private alertService: AlertService,
    private convoService: AdministracionConvocatoriaService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private cs: CommonService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
   }

   ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {

    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadForm2();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });

    this.dataSource.sort = this.sort;
    this.dataSource2.sort = this.sort2;

    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;

    this.dataSource.filterPredicate = (data: Calendario, filter: string): boolean => {
      const dataCompare = [data.calendario];
      return C.filterTable(dataCompare , filter);
    }

    this.dataSource2.filterPredicate = (data: DetallesCalendario, filter: string): boolean => {
      const dataCompare = [data.idCalendario, data.fechaNoHabil];
      return C.filterTable(dataCompare , filter);
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: Calendario, b: Calendario) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'calendario': return this.compare(a.calendario, b.calendario, isAsc);
        default: return 0;
      }
    });
  }

  sortData2(sort: Sort) {
    const data = this.dataSource2.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: DetallesCalendario, b: DetallesCalendario) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'idCalendario': return this.compare(a.idCalendario, b.idCalendario, isAsc);
        case 'fechaNoHabil': return this.compare(a.fechaNoHabil, b.fechaNoHabil, isAsc);

        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstCalendario = <Calendario[]> (<any> await this.cs.getCalendario().toPromise()).datos;
    this.lstDetallesCalendario = <DetallesCalendario[]> (<any> await this.cs.getCalendarioDet().toPromise()).datos;

    if (this.lstCalendario.length > 0) {
      this.lstCalendario.forEach(e => {
        this.lstDetallesCalendario.forEach(g => {
          if (e.id === g.idCalendario) {
            g.nombreCalendario = e.calendario;
            return;
          }
        });
      });
    }

    this.dataSource.data = this.lstCalendario
    this.dataSource2.data = this.lstDetallesCalendario
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        //Categorias
        id: new FormControl(''),
        calendario: new FormControl('', [Validators.required]),
      }
    );
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        //videos
        id: new FormControl(''),
        idCalendario: new FormControl('', [Validators.required]),
        fechaNoHabil: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  public edit(element: Calendario) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      calendario: element.calendario,
    });
  }

  public edit2(element: DetallesCalendario) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form2.patchValue({
      id: element.id,
      idCalendario: element.idCalendario,
      fechaNoHabil: element.fechaNoHabil,
    });
  }

  public addCalendario() {

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

    const obj = this.dataSource.data.find((x: Calendario) => this.areEquals(x.calendario, this.f.calendario.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newCalendario: Calendario = {
      id: this.f.id.value ? this.f.id.value : undefined,
      calendario: this.f.calendario.value,
    };

    this.cs.saveCalendario(newCalendario).toPromise()

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

  public addCalendarioDet() {

    if (this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form2.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    let Temp= false;      
    this.dataSource2.data.forEach(e => {
      const endDateString = this.cs.getFormatDate(e.fechaNoHabil);
      const initDateString = this.cs.getFormatDate(this.f2.fechaNoHabil.value);
      if(endDateString == initDateString){    
        Temp = true;
        return;
      }
    });

      if(Temp){
      this.alertService.message(this.ct.MSG_FECHA_NO_HABIL, TYPES.ERROR);
      this.submit = false;
      return;
    }

    const newCalendarioDet: DetallesCalendario = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      idCalendario: this.f2.idCalendario.value,
      fechaNoHabil: this.f2.fechaNoHabil.value,
    };
    this.cs.saveCalendarioDet(newCalendarioDet).toPromise()

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

  public delete(element: Calendario) {

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
          this.cs.deleteCalendario(element)
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

  public delete2(element: DetallesCalendario) {

    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected2(element.id);
          if (this.elementCurrent.id === element.id) {
            this.formV2.resetForm();
            this.elementCurrent = {};
          }
          this.cs.deleteCalendarioDet(element)
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

  private deleteIsSelected2(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm2();
    }
  }

  public cleanForm2() {
    this.formV2.resetForm();
    this.elementCurrent = {};
  }

}
