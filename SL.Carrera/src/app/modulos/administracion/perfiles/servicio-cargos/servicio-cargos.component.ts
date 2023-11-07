import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm } from '@angular/forms';
import { Constants } from '@app/compartido/helpers/constants';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { AlertService } from '@app/core/servicios/alert.service';
import { CargoHumano } from '@app/compartido/modelos/cargo-humano';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { PerfilService } from '@app/core/servicios/perfil.service';

@Component({
  selector: 'app-servicio-cargos',
  templateUrl: './servicio-cargos.component.html',
  styleUrls: ['./servicio-cargos.component.scss']
})
export class ServicioCargosComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['codigoCargo', 'cargo', 'nivelJerarquico'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private perfilService: PerfilService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private cs: CommonService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: CargoHumano, filter: string): boolean => {
      const dataCompare = [data.codCargoGlobal, data.cargoGlobal, data.cargoNivel];
      return Constants.filterTable(dataCompare, filter);
    };
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
        case 'codigoCargo': return this.compare(a.codCargoGlobal, b.codCargoGlobal, isAsc);
        case 'cargo': return this.compare(a.cargoGlobal, b.cargoGlobal, isAsc);
        case 'nivelJerarquico': return this.compare(a.cargoNivel, b.cargoNivel, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    const lstCargosHum: CargoHumano[] = ((await this.perfilService.getCargosHumano().toPromise() as any).datos) as CargoHumano[];
    lstCargosHum.forEach(z => {
      if (z.codCargoEmpresa !== '') {
        z.codCargoGlobal = z.codCargoEmpresa;
        z.cargoGlobal = z.cargoEmpresa;
      } else if (z.codCargo !== '') {
        z.codCargoGlobal = z.codCargo;
        z.cargoGlobal = z.cargo;
      }
    });
    this.dataSource.data = lstCargosHum;
  }

  public syncCargos() {
    this.alertService.loading();
    this.perfilService.syncCargosHumano()
      .toPromise()
      .then(() => this.loadData())
      .catch(err => this.alertService.showError(err))
      .finally(() => this.alertService.close());
  }
}
