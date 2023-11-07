import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { Vista } from '@app/compartido/modelos/vista';
import { RolModel } from '@app/compartido/modelos/rol-model';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { Empresa } from '@app/compartido/modelos/empresa';
import { configMsg } from '@app/compartido/helpers/enums';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-table-rol-vista',
  templateUrl: './table-rol-vista.component.html',
  styleUrls: ['./table-rol-vista.component.scss']
})
export class TableRolVistaComponent extends BaseController implements OnInit {

  public displayedColumns: string[] = ['idRolUsuario', 'idEmpresa', 'idVista', 'permisosEspeciales', 'permiteCrear', 'permiteLectura', 'permiteActualizar', 'permiteEliminar'];
  public dataSource = new MatTableDataSource<RolVista>([]);
  public sortedData: any;
  public lstRolVista: RolVista[] = [];
  public lstVista: Vista[] = [];
  public lstAllRolUsuario: RolModel[] = [];
  public lstRolUsuario: RolModel[] = [];
  public lstEmpresas: Empresa[] = [];
  public elementCurrent: any;

  private user = this.commonService.getVar(configMsg.USER);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
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
        case 'idEmpresa': return this.compare(a.nombreEmpresa, b.nombreEmpresa, isAsc);
        case 'idRolUsuario': return this.compare(a.idRol, b.idRol, isAsc);
        case 'idVista': return this.compare(a.idVista, b.idVista, isAsc);
        case 'permiteCrear': return this.compare(a.permiteCrear, b.permiteCrear, isAsc);
        case 'permiteLectura': return this.compare(a.permiteLectura, b.permiteLectura, isAsc);
        case 'permiteActualizar': return this.compare(a.permiteActualizar, b.permiteActualizar, isAsc);
        case 'permiteEliminar': return this.compare(a.permiteEliminar, b.permiteEliminar, isAsc);
        case 'permisosEspeciales': return this.compare(a.persmisosEspeciales, b.persmisosEspeciales, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    this.lstAllRolUsuario = (await this.commonService.getRolUsuario().toPromise() as any).datos;
    this.lstEmpresas = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    /* Valida el Rol de usuario */
    if (this.user.idRol === 1) {
      this.lstRolVista = (await this.commonService.getVistasRolUsuario().toPromise() as any).datos;
      this.lstVista = (await this.commonService.getVistas().toPromise() as any).datos;
    } else {
      this.lstRolUsuario = (await this.commonService.getRolesPorEmpresa(this.user.idEmpresa).toPromise() as any).datos;
      this.lstRolVista = (await this.commonService.getVistasRolByRolUsuario(this.user.idRol).toPromise() as any).datos;
      const lstTemp = <Vista[]>(<any>await this.commonService.getVistas().toPromise()).datos;
      const lstVistaTemp: Vista[] = [];
      this.lstRolVista.forEach(async x => {
        const obj = lstTemp.find(e => e.id === x.idVista);
        if (obj) {
          lstVistaTemp.push(obj);
        }
      });
      this.lstVista = lstVistaTemp;
    }

    this.lstRolVista.forEach(e => {
      this.lstAllRolUsuario.forEach(g => {
        if (e.idRol === Number(g.id)) {
          e.nombreRol = g.rol;
          e.idEmpresa = g.idEmpresa;
          return;
        }
      });

      this.lstVista.forEach(g => {
        if (e.idVista === g.id) {
          e.nombreVista = g.nombreVista;
          return;
        }
      });

      this.lstEmpresas.forEach(g => {
        if (e.idEmpresa === g.id) {
          e.nombreEmpresa = g.nombreEmpresa;
          return;
        }
      });
    });
    this.dataSource.data = this.lstRolVista;
  }
}
