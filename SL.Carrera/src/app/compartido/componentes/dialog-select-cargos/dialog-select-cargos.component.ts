import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort, Sort } from '@angular/material';
import { DataDialogCargos } from '@app/compartido/modelos/data-dialog-cargos';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Perfil } from '@app/compartido/modelos/perfil';
import { Constants } from '@app/compartido/helpers/constants';

@Component({
  selector: 'app-dialog-select-cargos',
  templateUrl: './dialog-select-cargos.component.html',
  styleUrls: ['./dialog-select-cargos.component.scss']
})
export class DialogSelectCargosComponent extends BaseController implements OnInit {

  public displayedColumns: string[] = ['select', 'codigoCargo', 'codigoCargoCarrera', 'grado', 'nivelJerarquico', 'cargo', 'lugar', 'dependenciaLugar'];
  public dataSource = new MatTableDataSource<Perfil>();
  public selection = new SelectionModel<Perfil>();
  public data: DataDialogCargos;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<DialogSelectCargosComponent>,
    @Inject(MAT_DIALOG_DATA) public dataReceiv: DataDialogCargos) {
    super();
    this.data = dataReceiv;

    this.dataSource.data = this.data.lstPerfiles;
    this.selection = new SelectionModel<Perfil>(true, this.data.lstPerfilesSelected);
    this.dataSource.filterPredicate = (data: Perfil, filter: string): boolean => {
      const cargo = data.cargoModel !== null ? data.cargoModel : null;
      const cargoHum = data.cargoHumanoModel !== null ? data.cargoHumanoModel : null;
      const dataCompare = [data.idGradoCargo];
      if (cargo) {
        dataCompare.push(cargo.codAlterno);
        dataCompare.push(cargo.cargo);
        dataCompare.push(cargo.nivelJerarquico);
      } else {
        // dataCompare.push(cargoHum.codCargoEmpresa !== '' ? cargoHum.codCargoEmpresa : cargoHum.codCargo);
        dataCompare.push(cargoHum.codCargoGlobal);
        // dataCompare.push(cargoHum.cargoEmpresa !== '' ? cargoHum.cargoEmpresa : cargoHum.cargo);
        dataCompare.push(cargoHum.cargoGlobal);
        dataCompare.push(cargoHum.cargoNivel);
      }

      if (data.tipoLugar) {
        dataCompare.push(this.translateField(data.tipoLugar, 'lugar', this.lang));
      }

      if (data.dependenciaHija) {
        dataCompare.push(this.translateField(data.dependenciaHija, 'nombre', this.lang));
      }

      return Constants.filterTable(dataCompare, filter);
    };

  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      return;
    }

    data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const cargoA = a.cargoModel !== null ? a.cargoModel : null;
      const cargoB = b.cargoModel !== null ? b.cargoModel : null;
      const cargoHumA = a.cargoHumanoModel !== null ? a.cargoHumanoModel : null;
      const cargoHumB = b.cargoHumanoModel !== null ? b.cargoHumanoModel : null;

      // const codCargoTempA = cargoHumA.codCargoEmpresa !== '' ? cargoHumA.codCargoEmpresa : cargoHumA.codCargo;
      // const codCargoTempB = cargoHumB.codCargoEmpresa !== '' ? cargoHumB.codCargoEmpresa : cargoHumB.codCargo;
      // const codCargoNombreTempA = cargoHumB.cargoEmpresa !== '' ? cargoHumB.cargoEmpresa : cargoHumB.cargo;
      // const codCargoNombreTempB = cargoHumB.cargoEmpresa !== '' ? cargoHumB.cargoEmpresa : cargoHumB.cargo;

      if (cargoA) {
        switch (sort.active) {
          case 'codigoCargo': return this.compare(cargoA.codAlterno, cargoB.codAlterno, isAsc);
          case 'cargo': return this.compare(cargoA.cargo, cargoB.cargo, isAsc);
          case 'grado': return this.compare(a.idGradoCargo, b.idGradoCargo, isAsc);
          case 'nivelJerarquico': return this.compare(cargoA.nivelJerarquico, cargoB.nivelJerarquico, isAsc);
          case 'lugar': return this.compare(a.tipoLugar ? a.tipoLugar.lugar : '', b.tipoLugar ? b.tipoLugar.lugar : '', isAsc);
          case 'dependenciaLugar': return this.compare(a.dependenciaHija ? a.dependenciaHija.nombre : '', b.dependenciaHija ? b.dependenciaHija.nombre : '', isAsc);
          default: return 0;
        }
      } else {
        switch (sort.active) {
          case 'codigoCargo': return this.compare(cargoHumA.codCargoGlobal, cargoHumB.codCargoGlobal, isAsc);
          case 'cargo': return this.compare(cargoHumA.cargoGlobal, cargoHumB.cargoGlobal, isAsc);
          case 'grado': return this.compare(a.idGradoCargo, b.idGradoCargo, isAsc);
          case 'nivelJerarquico': return this.compare(cargoHumA.cargoNivel, cargoHumB.cargoNivel, isAsc);
          case 'lugar': return this.compare(a.tipoLugar ? a.tipoLugar.lugar : '', b.tipoLugar ? b.tipoLugar.lugar : '', isAsc);
          case 'dependenciaLugar': return this.compare(a.dependenciaHija ? a.dependenciaHija.nombre : '', b.dependenciaHija ? b.dependenciaHija.nombre : '', isAsc);
          default: return 0;
        }
      }

    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Perfil): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public sendResult() {
    this.data.resultDataSelected = this.selection.selected;
    return this.data;
  }
}


