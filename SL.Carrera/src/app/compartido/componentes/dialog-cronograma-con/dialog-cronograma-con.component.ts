import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';

@Component({
  selector: 'app-dialog-cronograma-con',
  templateUrl: './dialog-cronograma-con.component.html',
  styleUrls: ['./dialog-cronograma-con.component.scss']
})
export class DialogCronogramaConComponent extends BaseController implements OnInit {

  public displayedColumns: string[] = ['actividadConvocatoria', 'fechaInicial', 'fechaFinal', 'esProrroga'];
  public dataSource = new MatTableDataSource<any>();
  public data: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<DialogCronogramaConComponent>,
    @Inject(MAT_DIALOG_DATA) public dataReceiv: any) {

    super();
    this.data = dataReceiv;
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.data = this.data;
  }

  public clean() {
    this.dataSource.data = [];
    this.dialogRef.close();
  }

}
