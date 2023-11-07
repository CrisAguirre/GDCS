import { element } from 'protractor';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialogRef, MatDialog } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg } from '@app/compartido/helpers/enums';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { TrasladoCSJModel } from '@app/compartido/modelos/trasladoCSJ-model';
import { User } from '@app/compartido/modelos/user';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { TrasladosService } from '@app/core/servicios/traslados.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { SoporteTrasladoUsuarioModel } from '@app/compartido/modelos/soporte-traslado-usuario-model';
import { FilesService } from '@app/core/servicios/files.service';

@Component({
  selector: 'app-traslados-info',
  templateUrl: './traslados-info.component.html',
  styleUrls: ['./traslados-info.component.scss']
})
export class TrasladosInfoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTipoTraslado: TipoTrasladoModel[] = [];
  public lstTable: TrasladoCSJModel[] = [];

  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public matcher: any;
  public sortedData: any;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['numeroDocumento', 'tipoTraslado', 'motivo', 'fechaSolicitud', 'options'];
  public displayedColumns2: string[] = ['tipoTraslado', 'tipoSoporte', 'soporte', 'verSoporte'];
  
  public dataSourceInfo = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('paginatorDialog2', { static: false }) set paginatorDialog2(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }
  @ViewChild('sortInfo2', { static: false }) set sortInfo2(value: MatSort) {
    this.dataSourceInfo.sort = value;
  }

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fileService: FilesService,
    private dialogService: MatDialog,
    private trasladoService: TrasladosService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const dataCompare = [
        data.id,
        data.numeroDocumentoServidor,
        data.tipoTraslado,
        data.motivoTraslado,
        data.fechaSolicitud
      ];
      return Constants.filterTable(dataCompare, filter);
    };
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
        case 'numeroDocumento': return this.compare(a.numeroDocumentoServidor, b.numeroDocumentoServidor, isAsc);
        case 'tipoTraslado': return this.compare(a.tipoTraslado, b.tipoTraslado, isAsc);
        case 'motivo': return this.compare(a.motivoTraslado, b.motivoTraslado, isAsc);
        case 'fechaSolicitud': return this.compare(a.fechaSolicitud, b.fechaSolicitud, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    // carga las solicitudes de traslado que ha realizado el usuario actual
    this.lstTable = (await this.trasladoService.getTodosByUsuario(this.user.id).toPromise() as any).datos as TrasladoCSJModel[];
    this.lstTable.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime());
    this.dataSource.data = this.lstTable;
  }

  public seeSupports(element: TrasladoCSJModel) {
    this.elementCurrent = C.cloneObject(element);
    let lstSoportes: SoporteTrasladoUsuarioModel[] = [];
    if (element.soportes && element.soportes.length > 0) {
      lstSoportes = element.soportes;
      lstSoportes.forEach(s => {
        const nombreSoporte = s.soporte.nombreSoporte.split('_');
        const nombreTipoDocumento = nombreSoporte[0];
        s.nombreTipoDocumentoTraslado = nombreTipoDocumento;
      });
    } else {
      lstSoportes = [];
    }
    this.dataSourceInfo.data = lstSoportes;

    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fileService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public closeDialogInfo() {
    this.elementCurrent = {};
    this.dialogRefInfo.close();
  }

}
