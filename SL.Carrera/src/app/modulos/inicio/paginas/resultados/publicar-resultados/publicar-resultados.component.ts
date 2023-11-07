import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';


@Component({
  selector: 'app-publicar-resultados',
  templateUrl: './publicar-resultados.component.html',
  styleUrls: ['./publicar-resultados.component.scss']
})
export class PublicarResultadosComponent extends BaseController implements OnInit, AfterViewChecked {


  public displayedColumns: string[] = ['discapacidad', 'discapacidad_En', 'description', 'esCampoOtro', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();

  constructor(
    private fb: FormBuilder,
    private ct: CustomTranslateService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
  }
  
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.dataSource.data = (<any>await this.commonService.getDiscapacidad().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idEmpresa: new FormControl('', [Validators.required]),
        idConvocatoria: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

}
