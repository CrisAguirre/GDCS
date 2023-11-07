import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, Injectable, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { of as observableOf } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Vista } from '@app/compartido/modelos/vista';

@Component({
  selector: 'app-vista',
  templateUrl: './vista.component.html',
  styleUrls: ['./vista.component.scss']
})
export class VistaComponent extends BaseController implements OnInit, AfterViewChecked {

  public title = 'ttl.agregarVista';
  public lstVistas: Vista[] = [];
  public form: FormGroup;
  public esPadre = false;
  public submit = false;
  public parentNodeCurrent: Vista;

  nestedTreeControl: NestedTreeControl<Vista>;
  nestedDataSource: MatTreeNestedDataSource<Vista>;
  treeControl = new NestedTreeControl<Vista>(node => node.hijosVista);
  dataSource = new MatTreeNestedDataSource<Vista>();

  private addNodeDialogRef: MatDialogRef<any, any>;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('addNodeDialog', { static: true }) addNodeDialog: TemplateRef<any>;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private configurationService: AdministracionConfiguracionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private nodeDialog: MatDialog,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<Vista>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.loadForm();
    this.loadData();
  }

  public async loadData() {
   /*  this.nestedTreeControl = new NestedTreeControl<Vista>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource(); */

    this.commonService.getVistas().subscribe((result: any) => {
      this.lstVistas = result.datos as Vista[];
      this.nestedDataSource.data = this.commonService.buildTreeVistas(this.lstVistas);
    });
  }

  hasChild = (_: number, node: Vista) => !!node.hijosVista && node.hijosVista.length > 0;


  // tslint:disable-next-line: variable-name
  private _getChildren = (node: Vista) => observableOf(node.hijosVista);
  hasNestedChild = (_: number, nodeData: Vista) => nodeData.hijosVista && nodeData.hijosVista.length > 0;

  refreshTreeData() {
    const data = this.nestedDataSource.data;
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = data;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        nombreRuta: new FormControl('', [Validators.required]),
        nombreVista: new FormControl('', [Validators.required]),
        idReferencia: new FormControl(''),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  /* Guarda una nueva vista en base de datos. */
  public saveVista(newVista: Vista) {
    this.alertService.loading();
    this.configurationService.saveVista(newVista).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.addNodeDialogRef.close();
          this.submit = false;
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  /* Se encarga de abrir el dialogo y verifica si es para crear o editar un registro. */
  public openDialog(method: number, node?: Vista) {
    this.parentNodeCurrent = node;
    this.treeControl.expand(node);

    if (method === 1) {
      this.title = 'ttl.agregarVista';
      this.addNodeDialogRef = this.nodeDialog.open(this.addNodeDialog, {
        data: this.parentNodeCurrent,
        disableClose: true,
        maxWidth: '80%',
        maxHeight: '80%',
        panelClass: 'col-md-6',
      });
      this.addNodeDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveVista(result);
        }
      });
    } else if (method === 2) {
      this.title = 'ttl.editarVista';
      this.addNodeDialogRef = this.nodeDialog.open(this.addNodeDialog, {
        disableClose: true,
        maxWidth: '80%',
        maxHeight: '80%',
        panelClass: 'col-md-6',
      });
      this.addNodeDialogRef.addPanelClass(['col-sm-12', 'col-md-8']);

      this.form.patchValue({
        id: this.parentNodeCurrent.id,
        nombreRuta: this.parentNodeCurrent.nombreRuta,
        nombreVista: this.parentNodeCurrent.nombreVista,
        idReferencia: this.parentNodeCurrent.idReferencia,
      });

      this.addNodeDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveVista(result);
        }
      });
    } else if (method === 3) {
      this.esPadre = true;
      this.title = 'ttl.agregarVista';
      this.addNodeDialogRef = this.nodeDialog.open(this.addNodeDialog, {
        disableClose: true,
        maxWidth: '80%',
        maxHeight: '80%',
        panelClass: 'col-md-6',
      });
      this.addNodeDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveVista(result);
        }
      });
    }
  }

  /* Guarda los valores que se ingresan en el formulario del Dialogo */
  public saveDialog() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }
    if (!this.esPadre) {
      if (this.parentNodeCurrent.hijosVista) {
        const existeNode = this.parentNodeCurrent.hijosVista.find(e => e.nombreRuta === this.f.nombreRuta.value);
        if (existeNode) {
          this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
          this.submit = false;
          return;
        }
      }
    }

    const newNode: Vista = {
      id: undefined,
      nombreVista: this.f.nombreVista.value,
      nombreRuta: this.f.nombreRuta.value,
      idReferencia: ''
    };

    if (this.f.id.value) {
      newNode.id = this.f.id.value;
      newNode.idReferencia = this.f.idReferencia.value;
    } else {
      newNode.id = undefined;
      if (this.esPadre) {
        newNode.idReferencia = undefined;
      } else {
        newNode.idReferencia = this.parentNodeCurrent.id;
      }
    }

    this.cleanForm(newNode);
  }

  /* Elimina una vista pasado por parámetro */
  public deleteVista(node: Vista) {
    if (node.hijosVista.length === 0) {
      this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
        .then(ok => {
          if (ok.value) {
            this.alertService.loading();
            this.configurationService.deleteVista(node)
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
    } else {
      this.alertService.message(this.ct.ERROR_DELETE_VIEW, TYPES.SUCCES);
      return;
    }
  }

  public cleanForm(data?: any): void {
    this.submit = false;
    this.esPadre = false;
    this.formV.resetForm();
    this.parentNodeCurrent = null;
    this.addNodeDialogRef.close(data);
  }

}
