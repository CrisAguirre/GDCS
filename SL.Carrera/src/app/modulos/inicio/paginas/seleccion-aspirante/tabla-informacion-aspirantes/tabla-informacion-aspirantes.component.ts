import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { NgForm } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Constants } from '@app/compartido/helpers/constants';

@Component({
  selector: 'app-tabla-informacion-aspirantes',
  templateUrl: './tabla-informacion-aspirantes.component.html',
  styleUrls: ['./tabla-informacion-aspirantes.component.scss']
})
export class TablaInformacionAspirantesComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['identificacion', 'nombreCompleto', 'cargoAspirante', 'gradoCargo', 'estadoAspirante'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;

  public lstTable: InscripcionAspiranteModel[] = [];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];

  @Input('idConvocatoria') set idConvocatoria(id: string) {
    this.loadDataByConvocatoria(id);
  }

  private lstEstados: string[];
  @Input('estadosMostrar') set lstEstadosMostrar(estados: string[]) {
    this.lstEstados = estados;
    this.filterEstados();
  }

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.loadData();
    this.dataSource.filterPredicate = (data: InscripcionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        data.id,
        this.commonService.getNumeroDocumento(data),
        this.commonService.getNameAspirante(data),
        this.commonService.getCargoAspirante(data),
        this.commonService.getGradoCargo(data),
        this.commonService.getEstadoAspirante(data),
      ];
      return Constants.filterTable(dataCompare, filter);
    };

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'identificacion': return this.compare(this.commonService.getNumeroDocumento(a), this.commonService.getNumeroDocumento(b), isAsc);
        case 'nombreCompleto': return this.compare(this.commonService.getNameAspirante(a), this.commonService.getNameAspirante(b), isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a), this.commonService.getCargoAspirante(b), isAsc);
        case 'gradoCargo': return this.compare(this.commonService.getGradoCargo(a), this.commonService.getGradoCargo(b), isAsc);
        case 'estadoAspirante': return this.compare(this.commonService.getEstadoAspirante(a), this.commonService.getEstadoAspirante(b), isAsc);
        default: return 0;
      }
    });
  }


  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public async loadDataByConvocatoria(idConvocatoriaSeleccionada: string) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstTable = [];
    if (idConvocatoriaSeleccionada && idConvocatoriaSeleccionada !== '') {

      this.lstTable = (await this.commonService.getInscripcionesConvocatoriaSR(idConvocatoriaSeleccionada).toPromise() as any).datos as InscripcionAspiranteModel[];
      if (this.lstTable.length > 0) {
        this.lstTable.forEach(x => {
          x.resumenHVModel = JSON.parse(x.resumenHV);
          if (x.resumenRecalificacionHV) {
            x.resumenRecalificacionHVModel = JSON.parse(x.resumenRecalificacionHV);
          }
          x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
          const cPerfil: ConvocatoriaPerfil = x.convocatoriaPerfilModel;
          if (cPerfil) {
            cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
          }
        });
        this.filterEstados();
      }
    }
    setTimeout(() => {
      this.dataSource.data = this.lstTable;
    }, 1000);

  }

  private filterEstados() {
    if (this.lstEstados && this.lstEstados.length > 0 && this.lstTable && this.lstTable.length > 0) {
      this.lstTable = this.lstTable.filter(x => {
        const tieneEstado = this.lstEstados.find(idEstado => this.areEqualsIdGuid(x.estadoAspiranteModel.id, idEstado))
        return tieneEstado ? true : false;
      });
    }
  }
}
