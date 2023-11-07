import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CommonService } from '@app/core/servicios/common.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CategoriaFaq } from '@app/compartido/modelos/categoria-faq';
import { Faq } from '@app/compartido/modelos/faq';

@Component({
  selector: 'app-preguntas-frecuentes-admin',
  templateUrl: './preguntas-frecuentes-admin.component.html',
  styleUrls: ['./preguntas-frecuentes-admin.component.scss']
})
export class PreguntasFrecuentesAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'categoria', 'categoria_En', 'descripcion', 'descripcion_En', 'options'];
  public displayedColumns2: string[] = ['id', 'categoria', 'descripcion', 'descripcion_En', 'options'];
  public displayedColumns3: string[] = ['id', 'categoria', 'pregunta', 'descripcion', 'descripcion_En', 'options'];

  public dataSource = new MatTableDataSource<any>([]);
  public dataSource2 = new MatTableDataSource<any>([]);
  public dataSource3 = new MatTableDataSource<any>([]);

  public lstCategoriaFaq: CategoriaFaq[] = [];
  public lstPreguntaFaq: Faq[] = [];
  public lstRespuestaFaq: Faq[] = [];

  public lstPreguntaFaqAux: Faq[] = [];
  


  public form: FormGroup;
  public form2: FormGroup;
  public form3: FormGroup;

  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {}
  public reqCampoIngles: boolean;


  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('formV3', { static: false }) formV3: NgForm;

  @ViewChild( 'matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild( 'uno' , { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('dos', { static: true }) sort2: MatSort;

  @ViewChild('matPaginator3', { static: true }) paginator3: MatPaginator;
  @ViewChild('tres', { static: true }) sort3: MatSort;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private configurationService: AdministracionConfiguracionService,
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
    this.loadForm3();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    
    this.dataSource.sort = this.sort;
    this.dataSource2.sort = this.sort2;
    this.dataSource3.sort = this.sort3;

    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource3.paginator = this.paginator3;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: CategoriaFaq, b: CategoriaFaq) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {      
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'categoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'categoria_En': return this.compare(a.nombreCategoria_En, b.nombreCategoria_En, isAsc);
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);
        case 'descripcion_En': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
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

    this.dataSource2.data.sort((a: Faq, b: Faq) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {          
        case 'id': return this.compare(a.id, b.id, isAsc);    
        case 'categoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);    
        case 'descripcion_En': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
        default: return 0;
      }
    });
  }

  sortData3(sort: Sort) {
    const data = this.dataSource3.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource3.data.sort((a: Faq, b: Faq) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {         
        case 'id': return this.compare(a.id, b.id, isAsc);           
        case 'categoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'pregunta': return this.compare(a.nombrePregunta, b.nombrePregunta, isAsc);    
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);
        case 'descripcion_En': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstCategoriaFaq = <CategoriaFaq[]> (<any> await this.commonService.getCategoriasFaq().toPromise()).datos;
    this.lstPreguntaFaq = <Faq[]> (<any> await this.commonService.getPreguntasFaq().toPromise()).datos;
    if (this.lstPreguntaFaq.length > 0) {
      this.lstPreguntaFaq.forEach(e => {
        this.lstCategoriaFaq.forEach(g => {
          if (e.idCategoria === g.id) {
            e.nombreCategoria = this.translateField(g, 'nombreCategoria', this.lang)
            return;
          }
        });
      });
    }
    this.lstRespuestaFaq = <Faq[]> (<any> await this.commonService.getRespuestaFaq().toPromise()).datos;
    if (this.lstRespuestaFaq.length > 0) {
      this.lstRespuestaFaq.forEach(e => {
        this.lstCategoriaFaq.forEach(g => {
          if (e.idCategoria === g.id) {
            e.nombreCategoria = this.translateField(g, 'nombreCategoria', this.lang)
            return;
          }
        });

        this.lstPreguntaFaq.forEach(g => {
          if (e.idReferencia === g.id) {
            e.nombrePregunta = this.translateField(g, 'descripcion', this.lang)
            return;
          }
        });
      });
    }
    


    this.dataSource.data = this.lstCategoriaFaq;
    this.dataSource2.data = this.lstPreguntaFaq;
    this.dataSource3.data = this.lstRespuestaFaq;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        //Categorias 
        id: new FormControl(''),
        nombreCategoria: new FormControl('', [Validators.required]),
        nombreCategoria_En: new FormControl('', [Validators.required]),    
        descripcion: new FormControl(''),
        descripcion_En: new FormControl(''),
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.nombreCategoria_En);
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {       
        //pregunta     
        id: new FormControl(''), 
        descripcion: new FormControl(''),
        descripcion_En: new FormControl(''),
        idCategoria: new FormControl(''),                         
      }
    );
  }

  public loadForm3() {
    this.form3 = this.fb.group(
      {       
        //respuesta  
        id: new FormControl(''),     
        idCategoria: new FormControl(''),
        idReferencia: new FormControl(''),
        descripcion: new FormControl(''),
        descripcion_En: new FormControl(''),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  get f3() {
    return this.form3.controls;
  }


  public edit(element: CategoriaFaq) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      nombreCategoria: element.nombreCategoria,
      nombreCategoria_En: element.nombreCategoria_En,
      descripcion: element.descripcion,
      descripcion_En: element.descripcion_En
    });
  }

  public edit2(element: Faq) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form2.patchValue({
      id: element.id,
      idCategoria: element.idCategoria,
      descripcion: element.descripcion,
      descripcion_En: element.descripcion_En
      
    });
  }

  public edit3(element: Faq) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    //this.changePreguntaFaq(element.idCategoria);


    this.changePreguntaFaq({ value: element.idCategoria });
    //const preguntaTemp = this.lstPreguntaFaqAux.find(x=>x.idReferencia === element.idReferencia);
    //this.f.idReferencia.setValue(preguntaTemp.id);

    // let lstPreguntaFaqTemp : Faq = null;
    this.lstPreguntaFaq.forEach(e => {
      if (e.id == element.idCategoria && e.idReferencia === element.idReferencia) {
        //this.changePreguntaFaq({ value: element.idCategoria });
        //this.f.idReferencia.setValue(e.id);
        // lstPreguntaFaqTemp = e;
        return;
      }
    });
    

    this.form3.patchValue({
      id: element.id,
      idCategoria: element.idCategoria,
      idReferencia: element.idReferencia,
      descripcion: element.descripcion,
      descripcion_En: element.descripcion_En
    });
  }

  public addCategoriaFaq() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.dataSource.data.find((x: CategoriaFaq) => this.areEquals(x.nombreCategoria, this.f.nombreCategoria.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newCategoriaFaq: CategoriaFaq = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreCategoria: this.f.nombreCategoria.value,
      nombreCategoria_En: this.f.nombreCategoria_En.value,
      descripcion: this.f.descripcion.value,
      descripcion_En: this.f.descripcion_En.value,
    };
    
    this.configurationService.saveCategoriaFaq(newCategoriaFaq).toPromise()
    
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

  public addPregunta() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form2.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.dataSource2.data.find((x: Faq) => this.areEquals(x.descripcion, this.f2.descripcion.value));
    if (obj) {
      if (this.areEqualsID(this.f2.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newPregunta: Faq = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      idCategoria:  this.f2.idCategoria.value,
      idReferencia: null,
      descripcion: this.f2.descripcion.value,
      descripcion_En: this.f2.descripcion_En.value
      
    };
    
    this.configurationService.savePreguntaFaq(newPregunta).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV2.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public addRespuesta() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form3.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.dataSource3.data.find((x: Faq) => this.areEquals(x.descripcion, this.f3.descripcion.value));
    if (obj) {
      if (this.areEqualsID(this.f3.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newRespuesta: Faq = {
      id: this.f3.id.value ? this.f3.id.value : undefined,
      idCategoria:  this.f3.idCategoria.value,
      idReferencia: this.f3.idReferencia.value,
      descripcion: this.f3.descripcion.value,
      descripcion_En: this.f3.descripcion_En.value
      
    };

    this.configurationService.saveRespuestaFaq(newRespuesta).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV3.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: CategoriaFaq) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
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
          this.configurationService.deleteCategoriaFaq(element)
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

  public delete2(element: Faq) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
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
          this.configurationService.deletePreguntaFaq(element)
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

  public delete3(element: Faq) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected3(element.id);
          if (this.elementCurrent.id === element.id) {
            this.formV3.resetForm();
            this.elementCurrent = {};
          }
          this.configurationService.deleteRespuestaFaq(element)
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
      this.cleanForm();
    }
  }
  
  public cleanForm2() {
    this.formV2.resetForm();
    this.elementCurrent = {};
  }


  private deleteIsSelected3(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }
  
  public cleanForm3() {
    this.formV3.resetForm();
    this.elementCurrent = {};
  }

  public changePreguntaFaq(event) {
    this.lstPreguntaFaqAux.splice(0);
    if (this.lstPreguntaFaq.length > 0) { 
      
      this.lstPreguntaFaq.forEach(e => {
          if (e.idCategoria == event.value) {  
            this.lstPreguntaFaqAux.push(e);
          }
      });
    } 
  }
}
