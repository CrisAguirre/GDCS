import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { VideoTutorial } from '@app/compartido/modelos/video-tutorial';
import { CategoriaVideoTutorial } from '@app/compartido/modelos/categoria-video-tutorial';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';


@Component({
  selector: 'app-tutorial-admin',
  templateUrl: './tutorial-admin.component.html',
  styleUrls: ['./tutorial-admin.component.scss']
})
export class TutorialAdminComponent extends BaseController implements OnInit, AfterViewChecked  {

  public displayedColumns: string[] = ['id', 'categoria', 'categoria_En', 'descripcion', 'descripcion_En', 'options'];
  public displayedColumns2: string[] = ['id', 'categoria', 'video', 'video_En', 'url', 'visible', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public dataSource2 = new MatTableDataSource<any>([]);

  public form: FormGroup;
  public form2: FormGroup;
  
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  public lstVideo: VideoTutorial[] = [];
  public lstCategoria: CategoriaVideoTutorial[] = [];
  public reqCampoIngles: boolean;
  

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;


  @ViewChild( 'MatPaginatorOne', { static: true }) paginator: MatPaginator;
  @ViewChild( 'MatSortOne' , { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;

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
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    
    this.dataSource.sort = this.sort;
    this.dataSource2.sort = this.sort2;

    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;
    

    this.dataSource.filterPredicate = (data: CategoriaVideoTutorial, filter: string): boolean => {
      const dataCompare = [data.nombreCategoria, data.nombreCategoria_En, data.descripcion, data.descripcion_En];
      return C.filterTable(dataCompare , filter);
    }

    this.dataSource2.filterPredicate = (data: VideoTutorial, filter: string): boolean => {
      const dataCompare = [data.nombreCategoria, data.nombreVideo, data.nombreVideo_En, data.url, (data.visible == 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare , filter);
    }

  }
  
  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: CategoriaVideoTutorial, b: CategoriaVideoTutorial) => {
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

    this.dataSource2.data.sort((a: VideoTutorial, b: VideoTutorial) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {  
        case 'id': return this.compare(a.id, b.id, isAsc);            
        case 'categoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'video': return this.compare(a.nombreVideo, b.nombreVideo, isAsc);
        case 'video_En': return this.compare(a.nombreVideo_En, b.nombreVideo_En, isAsc);
        case 'url': return this.compare(a.url, b.url, isAsc);
        case 'visible': return this.compare(a.visible, b.visible, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstCategoria = <CategoriaVideoTutorial[]> (<any> await this.commonService.getCategoriasVideoTutorial().toPromise()).datos;
    this.lstVideo = <VideoTutorial[]> (<any> await this.commonService.getVideoTutorial().toPromise()).datos;
    if (this.lstVideo.length > 0) {
      this.lstVideo.forEach(e => {
        this.lstCategoria.forEach(g => {
          if (e.idCategoria === g.id) {
            e.nombreCategoria = this.translateField(g, 'nombreCategoria', this.lang)
            return;
          }
        });
      });
    }

    this.dataSource.data = this.lstCategoria
    this.dataSource2.data = this.lstVideo
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
        //videos   
        id: new FormControl(''),     
        idCategoria: new FormControl(''),
        nombreVideo: new FormControl('', [Validators.required]),
        nombreVideo_En: new FormControl('', [Validators.required]),            
        url: new FormControl('', [Validators.required]),
        visible: new FormControl(false),    
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f2.nombreVideo_En);
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  public edit(element: CategoriaVideoTutorial) {
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

  public edit2(element: VideoTutorial) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form2.patchValue({
      id: element.id,
      idCategoria: element.idCategoria,
      nombreVideo: element.nombreVideo,
      nombreVideo_En: element.nombreVideo_En,
      url: element.url,
      visible: element.visible == 1 ? true : false,
    });
  }

  public addCategoria() {

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

    const obj = this.dataSource.data.find((x: CategoriaVideoTutorial) => this.areEquals(x.nombreCategoria, this.f.nombreCategoria.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newCategoria: CategoriaVideoTutorial = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreCategoria: this.f.nombreCategoria.value,
      nombreCategoria_En: this.f.nombreCategoria_En.value,
      descripcion: this.f.descripcion.value,
      descripcion_En: this.f.descripcion_En.value,
    };
    
    this.configurationService.saveCategoriaVideoTutorial(newCategoria).toPromise()
    
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

  public addVideo() {

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

    const obj = this.dataSource.data.find((x: VideoTutorial) => this.areEquals(x.nombreVideo, this.f2.nombreVideo.value) && this.areEquals(x.nombreVideo_En, this.f2.nombreVideo_En.value));
    if (obj) {
      if (this.areEqualsID(this.f2.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newVideo: VideoTutorial = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      idCategoria:  this.f2.idCategoria.value,
      nombreVideo: this.f2.nombreVideo.value,
      nombreVideo_En: this.f2.nombreVideo_En.value,
      url: this.f2.url.value,
      visible: this.f2.visible.value ? 1 : 0,
      
    };
    
    this.configurationService.saveVideoTutorial(newVideo).toPromise()
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


  public delete(element: CategoriaVideoTutorial) {

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
          this.configurationService.deleteCategoriaVideoTutorial(element)
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


  public delete2(element: VideoTutorial) {

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
          this.configurationService.deleteVideoTutorial(element)
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
      this.cleanForm2();
    }
  }
  
  public cleanForm2() {
    this.formV2.resetForm();
    this.elementCurrent = {};
  }

}

