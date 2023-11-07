import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input, LOCALE_ID } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants as C } from '@app/compartido/helpers/constants';
import { LevelStudy } from '@app/compartido/modelos/level-study';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { EventEmitter } from '@angular/core';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { ModalidadEstudio } from '@app/compartido/modelos/modalidad-estudio';
import { configMsg } from '../../../../../compartido/helpers/enums';
import { TipoFormulario } from '@app/compartido/modelos/tipo-formulario';




@Component({
  selector: 'app-nivel-estudio-admin',
  templateUrl: './nivel-estudio-admin.component.html',
  styleUrls: ['./nivel-estudio-admin.component.scss']
})
export class NivelEstudioAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'modalidad', 'nivelEstudio', 'nivelEstudio_En', 'tipoEstudio', 'orden', 'cardProfesional', 'options'];
  public displayedColumns2: string[] = ['id', 'descripcion', 'descripcion_En', 'options'];
  public displayedColumns3: string[] = ['id', 'descripcion', 'descripcion_En', 'referencia', 'options'];

  public form: FormGroup;
  public form2: FormGroup;
  public form3: FormGroup;

  public submit = false;
  public submit2 = false;
  public submit3 = false;
  public lstYesNot = [];

  public lstTipoEstudio: ModalidadEstudio[] = [];
  public lstTipoModalidad: ModalidadEstudio[] = [];
  public lstFormulario: TipoFormulario[] = [];

  public elementCurrent: any = {};
  public elementCurrent2: any = {};
  public elementCurrent3: any = {};

  public updateData: ModalidadEstudio[] = [];
  public updateData2: ModalidadEstudio[] = [];

  public dataSource = new MatTableDataSource<LevelStudy>([]);
  public dataSource2 = new MatTableDataSource<any>([]);
  public dataSource3 = new MatTableDataSource<any>([]);

  private user = this.commonService.getVar(configMsg.USER);
  public reqCampoIngles: boolean;


  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('formV3', { static: false }) formV3: NgForm;
  

  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;

  @ViewChild('matPaginator3', { static: true }) paginator3: MatPaginator;
  @ViewChild('TableTres', { static: true }) sort3: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private configurationService: AdministracionConfiguracionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  
  ngOnInit(): void {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadForm2();
    this.loadForm3();
    this.lstYesNot = this.ct.lstYesOrNot();
    this.loadData2();
    this.loadData3();
    this.loadData()
    .finally(() => {
      C.sendMessage(false, this.messageEvent);
    });
      this.dataSource.paginator = this.paginator;
      this.dataSource2.paginator = this.paginator2;
      this.dataSource3.paginator = this.paginator3;
    
      this.dataSource.sort = this.sort;
      this.dataSource2.sort = this.sort2;
      this.dataSource3.sort = this.sort3;

      this.lstFormulario.push( new TipoFormulario('B', 'Formulario 1', 'Form 1'));
      this.lstFormulario.push( new TipoFormulario('T', 'Formulario 2', 'Form 2'));
      this.lstFormulario.push( new TipoFormulario('S', 'Formulario 3', 'Form 3'));
      this.lstFormulario.push( new TipoFormulario('I', 'Formulario 4', 'Form 4'));    
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: LevelStudy, b: LevelStudy) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'modalidad': return this.compare(a.modalidad, b.modalidad, isAsc);
        case 'nivelEstudio': return this.compare(a.nivelEstudio, b.nivelEstudio, isAsc);
        case 'nivelEstudio_En': return this.compare(a.nivelEstudio_En, b.nivelEstudio_En, isAsc);
        case 'tipoEstudio': return this.compare(a.tipoEstudio, b.tipoEstudio, isAsc);
        case 'orden': return this.compare(a.orden, b.orden, isAsc);
        case 'cardProfesional': return this.compare(a.aplicaTarjetaProfesional, b.aplicaTarjetaProfesional, isAsc);
        default: return 0;
      }
    });
  }

  sortData2(sort: Sort) {
    const data = this.dataSource2.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: ModalidadEstudio, b: ModalidadEstudio) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);
        case 'descripcion_EN': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
        default: return 0;
      }
    });
  }

  sortData3(sort: Sort) {
    const data = this.dataSource2.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: ModalidadEstudio, b: ModalidadEstudio) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);
        case 'descripcion_EN': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
        case 'referencia': return this.compare(a.idReferencia, b.idReferencia, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.updateData2 = <ModalidadEstudio[]>(<any>await this.commonService.getModalidadEstudio().toPromise()).datos;
    this.dataSource.data = (<any>await this.commonService.getLevelStudy().toPromise()).datos;
    if (this.dataSource.data.length > 0) { 
      this.dataSource.data.forEach(e => {
        this.updateData2.forEach(g => {
          if (e.idModalidad == g.id) {              
            e.nombreModalidad=g.descripcion;          
            return;
          }
        });

        this.dataSource3.data.forEach(g => {
          if (e.idModalidad == g.id) {      
            this.dataSource2.data.forEach(z =>{
              if(g.idReferencia === z.id){
                e.tipoEstudio=z.descripcion;
                return;
              }
            });
          }
        });
      });
    }

    

  }

  public async loadData2() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource2.data = (<any>await this.commonService.getTipoEstudio().toPromise()).datos;
  }

  public async loadData3() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.updateData = <ModalidadEstudio[]>(<any>await this.commonService.getModalidadEstudio().toPromise()).datos;
    if (this.dataSource2.data.length > 0) { 
      this.lstTipoEstudio= this.dataSource2.data;
      this.dataSource2.data.forEach(e => {
        this.lstTipoEstudio.forEach(g => {
          if (e.id == g.id) {           
            e.descripcion = this.translateField(g, 'descripcion', this.lang);            
          }
        });
      });
    }

    if (this.updateData.length > 0) { 
      this.updateData.forEach(e => {
        this.lstTipoEstudio.forEach(g => {
          if (e.idReferencia == g.id) {  
            e.descripcionReferencia=g.descripcion;          
            return;
          }
        });
      });
    }
    
    this.dataSource3.data= this.updateData;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        modality: new FormControl('', [Validators.required]),
        studyLevel: new FormControl('', [Validators.required]),
        nivelEstudio_En: new FormControl('', [Validators.required]),
        codStudyType: new FormControl('', [Validators.required]),
        codAcademicModality: new FormControl('', [Validators.required]),
        codEducationLevel: new FormControl('', [Validators.required]),
        studyType: new FormControl('', [Validators.required]),
        order: new FormControl('', [Validators.required]),
        cardProfesional: new FormControl('', [Validators.required]),


        idModalidad: new FormControl('', [Validators.required]),
        modalidadEstudio: new FormControl('', [Validators.required])
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.nivelEstudio_En);
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        id: new FormControl(''), 
        idReferencia: new FormControl(''), 
        idUsuarioModificacion: new FormControl(''), 
        descripcion: new FormControl('', [Validators.required]),
        descripcion_En:new FormControl('', [Validators.required])
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f2.descripcion_En);
  }

  public loadForm3() {
    this.form3 = this.fb.group(
      {
        id: new FormControl(''), 
        idReferencia: new FormControl(''), 
        idUsuarioModificacion: new FormControl(''), 
        descripcion: new FormControl('', [Validators.required]),
        descripcion_En:new FormControl('', [Validators.required])
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f3.descripcion_En);
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

  public edit(element: LevelStudy) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      modality: element.modalidad,
      studyLevel: element.nivelEstudio,
      nivelEstudio_En: element.nivelEstudio_En,
      codStudyType: element.codTipoEstudio,
      codAcademicModality: element.codModalidadAcademica,
      codEducationLevel: element.codNivelEducacion,
      studyType: element.tipoEstudio,
      order: element.orden,
      cardProfesional: element.aplicaTarjetaProfesional,
      idModalidad: element.idModalidad
    });
  }

  public edit2(element: ModalidadEstudio) {
    this.scrollTop();
    this.elementCurrent2 = C.cloneObject(element);
    this.scrollTop();
    this.form2.patchValue({
        id: element.id, 
        idReferencia: element.idReferencia, 
        idUsuarioModificacion: element.idUsuarioModificacion,
        descripcion: element.descripcion,
        descripcion_En: element.descripcion_En
    });
  }

  public edit3(element: ModalidadEstudio) {
    this.scrollTop();
    this.elementCurrent3 = C.cloneObject(element);
    this.form3.patchValue({
        id: element.id,
        idReferencia: element.idReferencia, 
        idUsuarioModificacion: element.idUsuarioModificacion,
        descripcion: element.descripcion,
        descripcion_En: element.descripcion_En
    });
  }

  public addLevelEducation() {

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

    // validar que no se duplique el registro
    const obj = this.dataSource.data.find((x: LevelStudy) => this.areEquals(x.modalidad, this.f.modality.value) && this.areEquals(x.nivelEstudio, this.f.studyLevel.value) );
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newLevelStudy: LevelStudy = {
      id: this.f.id.value ? this.f.id.value : undefined,
      modalidad: this.f.modality.value,
      nivelEstudio: this.f.studyLevel.value,
      nivelEstudio_En: this.f.nivelEstudio_En.value,
      codTipoEstudio: this.f.codStudyType.value,
      codModalidadAcademica: this.f.codAcademicModality.value,
      codNivelEducacion: this.f.codEducationLevel.value,
      tipoEstudio: this.f.studyType.value,
      orden: this.f.order.value,
      aplicaTarjetaProfesional: this.f.cardProfesional.value,
      idModalidad: this.f.idModalidad.value,
      modalidadEstudio: this.f.idModalidad.value
    };

    this.configurationService.saveLevelStudy(newLevelStudy).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        console.log('Error', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public addTipoEstudio() {

    if (this.elementCurrent2.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent2.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form2.valid) {
      this.submit2 = true;
    } else {
      this.submit2 = false;
      return;
    }

    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length no-trailing-whitespace
    const obj = this.dataSource2.data.find((x: ModalidadEstudio) => this.areEquals(x.descripcion, this.f2.descripcion.value) 
    && this.areEquals(x.descripcion_En, this.f2.descripcion_En.value));
    if (obj) {
      if (this.areEqualsID(this.f2.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit2 = false;
        return;
      }
    }

    const newModalidad: ModalidadEstudio = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      idReferencia: this.f2.idReferencia.value ? this.f2.idReferencia.value : null,
      idUsuarioModificacion: this.user.id,
      descripcion: this.f2.descripcion.value,
      descripcion_En: this.f2.descripcion_En.value,
    };
    this.configurationService.saveModalidadEstudio(newModalidad).toPromise()
      .then(ok => {
        this.loadData2().then(() => {
          this.loadData3().then(() =>{
            this.formV2.resetForm();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit2 = false);
          });
 
        });
      }).catch(e => {
        console.log('Error', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public addModalidadEstudio() {

    if (this.elementCurrent3.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent3.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form3.valid) {
      this.submit3 = true;
    } else {
      this.submit3 = false;
      return;
    }

    const obj = this.dataSource3.data.find((x: ModalidadEstudio) => this.areEquals(x.descripcion, this.f3.descripcion.value) 
    && this.areEquals(x.descripcion_En, this.f3.descripcion_En.value) && this.areEquals(x.idReferencia, this.f3.idReferencia.value) );
    if (obj) {
      if (this.areEqualsID(this.f3.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit3 = false;
        return;
      }
    }

    const newModalidad: ModalidadEstudio = {
      id: this.f3.id.value ? this.f3.id.value : undefined,
      idReferencia: this.f3.idReferencia.value,
      idUsuarioModificacion: this.user.id,
      descripcion: this.f3.descripcion.value,
      descripcion_En: this.f3.descripcion_En.value,
    };
    this.configurationService.saveModalidadEstudio(newModalidad).toPromise()
      .then(ok => {
        this.loadData3().then(() => {
          this.loadData2().then(() =>{
            this.formV3.resetForm();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit3 = false);
          });
        });
      }).catch(e => {
        console.log('Error', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit3 = false);
      });
  }


  public delete(element: LevelStudy) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id == element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.configurationService.deleteLevelStudy(element)
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

  public delete2(element: ModalidadEstudio) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
   
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected2(element.id);
          if (this.elementCurrent2.idReferencia == element.idReferencia) {
            this.formV2.resetForm();
            this.elementCurrent2 = {};
          }
          this.configurationService.deleteModalidadEstudio(element)
            .subscribe(o => {
              this.loadData2()
                .then(r => {
                  this.loadData3().then(r=>{
                    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  });                  
                });
            }, err => {
                this.alertService.showError(err);
            });
        }
      });
  }

  public delete3(element: ModalidadEstudio) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected3(element.id);
          if (this.elementCurrent3.id == element.id) {
            this.formV3.resetForm();
            this.elementCurrent3 = {};
          }
          this.configurationService.deleteModalidadEstudio(element)
            .subscribe(o => {
              this.loadData3()
                .then(r => {
                  this.loadData2().then(r=>{
                    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  });      
                });
            }, err => {
                this.alertService.showError(err);
            });
        }
      });
  }

  private deleteIsSelected(id){
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  private deleteIsSelected2(id){
    if (this.elementCurrent2.id == id) {
      this.cleanForm2();
    }
  }

  private deleteIsSelected3(id){
    if (this.elementCurrent3.id == id) {
      this.cleanForm3();
    }
  }

  public cleanForm() {
    this.formV.resetForm()
    this.elementCurrent = {};
  }

  public cleanForm2() {
    this.formV2.resetForm()
    this.elementCurrent2 = {};
  }

  public cleanForm3() {
    this.formV3.resetForm()
    this.elementCurrent3 = {};
  }

  public cambiarTipoEstudio(event) {
    this.lstTipoModalidad.splice(0);
    if (this.updateData.length > 0) { 
      this.updateData.forEach(e => {
          if (e.idReferencia == event.value) {  
            this.lstTipoModalidad.push(e);
          }
      });
    }
  }

}


