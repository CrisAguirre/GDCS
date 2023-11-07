import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, PermisosAcciones } from '@app/compartido/helpers/enums';
import { ReporteGeneracion } from '@app/compartido/modelos/reportes/reporte-generacion';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';

@Component({
  selector: 'app-gestionar-reportes',
  templateUrl: './gestionar-reportes.component.html',
  styleUrls: ['./gestionar-reportes.component.scss']
})
export class GestionarReportesComponent extends BaseController implements OnInit, AfterViewChecked {

  private user = this.cs.getVar(configMsg.USER);
  public displayedColumns: string[] = ['nombreReporte', 'nombreArchivo', 'nombreDescarga', 'nombreServicio', 'options'];
  public lstTable: ReporteGeneracion[] = [];
  public dataSource = new MatTableDataSource<ReporteGeneracion>([]);
  public sortedData: any;
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private cs: CommonService,
    private fileService: FilesService,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {

    this.loadForm();
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.lstTable = (await this.fileService.getReporteGeneracion().toPromise() as any).datos as ReporteGeneracion[];
    this.dataSource.data = this.lstTable;
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
        case 'nombreReporte': return this.compare(a.nombreReporte, b.nombreReporte, isAsc);
        case 'nombresArchivo': return this.compare(a.nombreArchivo, b.nombreArchivo, isAsc);
        case 'nombreDescarga': return this.compare(a.nombreDescarga, b.nombreDescarga, isAsc);
        case 'nombreServicio': return this.compare(a.nombreServicio, b.nombreServicio, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        nombreReporte: new FormControl('', [Validators.required]),
        nombreArchivo: new FormControl('', [Validators.required]),
        nombreDescarga: new FormControl('', [Validators.required]),
        nombreServicio: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: ReporteGeneracion) {
    this.scrollTop();
    this.elementCurrent = Constants.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      nombreReporte: element.nombreReporte,
      nombreArchivo: element.nombreArchivo,
      nombreDescarga: element.nombreDescarga,
      nombreServicio: element.nombreServicio,
    });
  }

  public add() {

    if (this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }


    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.lstTable.find((x: ReporteGeneracion) =>
      this.areEquals(x.nombreReporte, this.f.nombreReporte.value) ||
      this.areEquals(x.nombreArchivo, this.f.nombreArchivo.value) //||
      //this.areEquals(x.nombreServicio, this.f.nombreServicio.value)
      );
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    const newTypePlace: ReporteGeneracion = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreReporte: this.f.nombreReporte.value,
      nombreArchivo: this.f.nombreArchivo.value,
      nombreDescarga: this.f.nombreDescarga.value,
      nombreServicio: this.f.nombreServicio.value,
      idUsuarioModificacion: this.user.id
    };

    this.fileService.saveReporteGeneracion(newTypePlace).toPromise()
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

  public delete(element: ReporteGeneracion) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.fileService.deleteReporteGeneracion(element.id)
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
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }

}

