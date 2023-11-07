import { Component, OnInit, AfterViewChecked, ViewChild, Input, ChangeDetectorRef, ɵConsole } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, of, identity } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DataSource } from '@angular/cdk/collections';
import { ModalidadEstudio } from '@app/compartido/modelos/modalidad-estudio';
import { CommonService } from '@app/core/servicios/common.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { LevelStudy } from '@app/compartido/modelos/level-study';
import { AcademicInformation } from '@app/compartido/modelos/academic-information';
import { configMsg } from '@app/compartido/helpers/enums';
import { AreaConocimiento } from '@app/compartido/modelos/area-conocimiento';
import { TituloObtenido } from '@app/compartido/modelos/titulo-obtenido';
import { Institution } from '@app/compartido/modelos/institution';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { SectorExperience } from '@app/compartido/modelos/sector-experience';
import { Sexo } from '@app/compartido/modelos/sexo';
import { Departamento } from '@app/compartido/modelos/departamento';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DetalleUsuarioModel } from '@app/compartido/modelos/detalle-usuario-model';
import { DetalleUsuarioInfoAcademicaModel } from '@app/compartido/modelos/detalle-usuario-model';
import { FilterDetalleUsuario } from '@app/compartido/modelos/filter-detalle-usuario';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { DetalleUsuarioExpLaboral } from '../../../compartido/modelos/detalle-usuario-model';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { request } from 'https';


@Component({
  selector: 'app-banco-hoja-de-vida',
  templateUrl: './banco-hoja-de-vida.component.html',
  styleUrls: ['./banco-hoja-de-vida.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})
export class BancoHojaDeVidaComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;
  private user = this.commonService.getVar(configMsg.USER);

  //Informacion Academica
  public lstTipoModalidad: ModalidadEstudio[] = [];
  public lstTipoModalidad2: ModalidadEstudio[] = [];
  public lstTipoEstudio: ModalidadEstudio[] = [];
  public lstEducationLevels: LevelStudy[] = [];
  public lstEducationLevels2: LevelStudy[] = [];
  public lstKnowledgeArea: AreaConocimiento[] = [];
  public lstTitles: TituloObtenido[] = [];
  public lstInstitutions: Institution[] = [];

  public updateData: AcademicInformation[] = [];
  public dataSource2 = new MatTableDataSource<any>([]);


  public filteredOptions: Observable<any[]>;
  public filteredTitles: Observable<any[]>;
  public filteredCargos: Observable<any[]>;

  //Experiencia laboral
  public lstCargo: WorkExperience[] = [];
  public lstSectors: SectorExperience[] = [];

  //Datos Basicos
  public lstSex: Sexo[] = [];
  public lstDepartamento: Departamento[] = [];
  public lstMunicipio: Ciudad[] = [];
  public lstMunicipioAux: Ciudad[] = [];

  //
  public lstFiltro: DetalleUsuarioModel[] = [];
  public lstnivelStudio: LevelStudy[] = [];
  public lstLaboral: DetalleUsuarioExpLaboral[] = [];

  /////
  public dataSource = new MatTableDataSource<any>([]);
  // displayedColumns = [{ key: 'nombre', title: 'lbl.nombre' }, { key: 'apellido', title: 'lbl.apellido' }, { key: 'discapacidad', title: 'lbl.discapacidad' }, { key: 'documento', title: 'lbl.documento' }, { key: 'edad', title: 'lbl.edad' }, { key: 'hojaVida', title: 'lbl.hojaVida' }];
  //displayedColumns = ['nombre', 'apellido', 'tieneDiscapacidad', 'numeroDocumento', 'edad', 'hojaVida'];
  //titleColumn = { 'nombre': 'lbl.nombre', 'apellido': 'lbl.apellido', 'tieneDiscapacidad': 'lbl.discapacidad', 'numeroDocumento': 'lbl.documento', 'edad': 'lbl.edad', 'hojaVida': 'lbl.hojaVida' };
  public displayedColumns: string[] = [ 'nombre', 'apellido', 'discapacidad','documento', 'edad'];

  //isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  //expandedElement: FilterDetalleUsuario | null;

  public sortedData: any;
  public elementCurrent: any = {};


  public dropdownList = [];
  public selectedItems = [];
  public dropTitulo: IDropdownSettings = {};
  public dropMunicipio: IDropdownSettings = {};
  public dropSexo: IDropdownSettings = {};
  public dropNivelEstudio: IDropdownSettings = {};
  public dropInstitucion: IDropdownSettings = {};


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private commonService: CommonService,
    private fService: FilesService,
    private ct: CustomTranslateService,
    private alertService: AlertService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.loadData().then(()=> this.alertService.close());

    this.dataSource.filterPredicate = (data: DetalleUsuarioModel, filter: string): boolean => {
      const dataCompare = [data.discapacidad, data.nombre, data.apellido, data.discapacidad, data.numeroDocumento, data.edad ];
      return C.filterTable(dataCompare , filter);
    }

    this.dropSexo = {
      singleSelection: false,
      idField: 'id',
      textField: 'sexo' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      allowSearchFilter: false,
      maxHeight: 140
    };

    this.dropMunicipio = {
      singleSelection: false,
      idField: 'id',
      textField: 'ciudad',
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      itemsShowLimit: 3,
      allowSearchFilter: true,
      maxHeight: 140,
      searchPlaceholderText: this.ct.SEARCH
    };

    this.dropTitulo = {
      singleSelection: false,
      idField: 'id',
      textField: 'titulo' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      itemsShowLimit: 3,
      searchPlaceholderText: this.ct.SEARCH,
      allowSearchFilter: true,
      maxHeight: 140
    };

    this.dropNivelEstudio = {
      singleSelection: false,
      idField: 'id',
      textField: 'nivelEstudio' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      itemsShowLimit: 3,
      allowSearchFilter: false,
      maxHeight: 140
    };

    this.dropInstitucion = {
      singleSelection: true,
      idField: 'id',
      textField: 'institucion' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      allowSearchFilter: true,
      maxHeight: 100,
      searchPlaceholderText: this.ct.SEARCH,
    };

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
        case 'nombre': return this.compare(a.nombre, b.nombre, isAsc);
        case 'apellido': return this.compare(a.apellido, b.apellido, isAsc);
        case 'discapacidad': return this.compare(a.tieneDiscapacidad, b.tieneDiscapacidad, isAsc);
        case 'documento': return this.compare(a.numeroDocumento, b.numeroDocumento, isAsc);
        case 'edad': return this.compare(a.edad, b.edad, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    //Informacion Academica
    this.updateData = <AcademicInformation[]>(<any>await this.commonService.getInformacionAcademica().toPromise()).datos;
    this.lstTipoEstudio = <ModalidadEstudio[]>(<any>await this.commonService.getTipoEstudio().toPromise()).datos;
    this.lstTipoModalidad = <ModalidadEstudio[]>(<any>await this.commonService.getModalidadEstudio().toPromise()).datos;
    this.lstEducationLevels = (<any>await this.commonService.getLevelStudy().toPromise()).datos;
    this.lstTitles = (<any>await this.commonService.getTitulos().toPromise()).datos;
    this.lstInstitutions = (<any>await this.commonService.getInstitutions().toPromise()).datos;

    //Experiencia Laboral
    this.lstCargo = (<any>await this.commonService.getExperienciaLaboral().toPromise()).datos;
    this.lstSectors = (<any>await this.commonService.getSectorExperience().toPromise()).datos;

    //Datos Basicos
    this.lstSex = (<any>await this.commonService.getSex().toPromise()).datos;
    this.lstDepartamento = (<any>await this.commonService.getDepartamentos().toPromise()).departamentos;
    this.lstMunicipio = (<any>await this.commonService.getCiudades().toPromise()).ciudades;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        //Informacion academica
        id: new FormControl(''),
        idReferencia: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        descripcion: new FormControl(''),
        descripcion_En: new FormControl(''),
        modalidadEstudio: new FormControl(''),
        modalidad: new FormControl(''),
        educationLevel: new FormControl(''),
        titleObtain: new FormControl(''),
        institute: new FormControl(''),

        //Experiencia laboral
        cargo: new FormControl(''),
        empresa: new FormControl(''),
        sector: new FormControl(''),
        expMin: new FormControl(''),
        expdMax: new FormControl(''),

        //Datos basicos
        sex: new FormControl(null),
        edadMin: new FormControl(''),
        edadMax: new FormControl(''),

        departamento: new FormControl(''),
        municipio: new FormControl(''),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public cambiarTipoEstudio(event) {
    this.cleanTipoEducativoModalidad(3);
    if (this.lstTipoModalidad.length > 0) {
      this.lstTipoModalidad.forEach(e => {
        if (e.idReferencia == event.value) {
          this.lstTipoModalidad2.push(e);
        }
      });
    }
  }

  public cambiarTipoNivelEstudio(event) {
    this.cleanTipoEducativoModalidad(2);
    if (this.lstEducationLevels.length > 0) {
      this.lstEducationLevels.forEach(e => {
        if (e.idModalidad == event.value) {
          this.lstEducationLevels2.push(e);
        }
      });
    }
  }

  private cleanTipoEducativoModalidad(tipo: number) {
    if (tipo == 1) {
      this.lstTipoModalidad2.splice(0);

    } else if (tipo == 2) {
      this.lstEducationLevels2.splice(0);
      this.f.educationLevel.setValue(null);
    } else {
      this.lstTipoModalidad2.splice(0);
      this.f.modalidad.setValue(null);
      this.lstEducationLevels2.splice(0);
      this.f.educationLevel.setValue(null);
    }
  }

  private buildParams(): FilterDetalleUsuario {
    //convertir el listado titulo
    let filterTitulo: string;
    let titleObtainAux: string[] = [];
    let tAux = 0;
    if (this.f.titleObtain.value && this.f.titleObtain.value !== null) {
      this.f.titleObtain.value.forEach(element => {
        tAux++;
        if (tAux === 1) {
          filterTitulo = element.id;
        } else {
          filterTitulo += "&TitulosObtenidos=" + element.id;
        }
      });
      titleObtainAux.push(filterTitulo);
    }

    //convertir el listado nivel de educacion
    let filterNivel: string;
    let NivelnAux: string[] = [];
    let nAux = 0;
    if (this.f.educationLevel.value && this.f.educationLevel.value !== null) {
      this.f.educationLevel.value.forEach(element => {
        nAux++;
        if (nAux === 1) {
          filterNivel = element.id;
        } else {
          filterNivel += "&NivelesEstudio=" + element.id;
        }
      });
      NivelnAux.push(filterNivel);
    }


    //convertir el listado sexo
    let filterSex: string;
    let filterSexAux: string[] = [];
    let iAux = 0;
    if (this.f.sex.value && this.f.sex.value !== null) {
      this.f.sex.value.forEach(element => {
        iAux++;
        if (iAux === 1) {
          filterSex = element.id;
        } else {
          filterSex += "&IdSexos=" + element.id;
        }
      });
      filterSexAux.push(filterSex);
    }

    //convertir el listado municipios
    let filterMunicipio: string;
    let municipioAux: string[] = [];
    let mAux = 0;
    if (this.f.municipio.value && this.f.municipio.value !== null) {
      this.f.municipio.value.forEach(element => {
        mAux++;
        if (mAux === 1) {
          filterMunicipio = element.id;
        } else {
          filterMunicipio += "&IdCiudades=" + element.id;
        }
      });
      municipioAux.push(filterMunicipio);
    }

    //convertir el listado Institucion
    let filterInstituycion: number;
    let institucionAux: number;
    let inAux = 0;
    if (this.f.institute.value && this.f.institute.value !== null) {
      this.f.institute.value.forEach(element => {
        inAux++;
        if (inAux === 1) {
          filterInstituycion = element.id;
        }
      });
    }

    const params: FilterDetalleUsuario = {
      //Informacion academica
      TitulosObtenidos: titleObtainAux.length > 0 ? titleObtainAux : undefined,
      TipoEstudio: this.f.modalidadEstudio.value,
      ModalidadEstudio: this.f.modalidad.value,
      NivelesEstudio: NivelnAux.length > 0 ? NivelnAux : undefined,
      IdInstitucion: filterInstituycion,

      //Experiencia laboral
      Cargo: this.f.cargo.value,
      Entidad: this.f.empresa.value,
      IdSectorExperiencia: this.f.sector.value,
      ExpMinima: this.f.expMin.value,
      ExpMaxima: this.f.expdMax.value,


      //Datos personales
      IdSexos: filterSexAux.length > 0 ? filterSexAux : undefined,
      EdadMin: this.f.edadMin.value,
      EdadMaxima: this.f.edadMax.value,
      IdDepartamento: this.f.departamento.value,
      IdCiudades: municipioAux.length > 0 ? municipioAux : undefined,
    };
    return params;
  }


  public async filtro() {
    const params: FilterDetalleUsuario = this.buildParams();
    this.lstFiltro.splice(0);
    this.lstFiltro = <DetalleUsuarioModel[]>(<any>await this.commonService.getFiltro(params).toPromise()).datos;
    //this.lstLaboral = <DetalleUsuarioExpLaboral[]>(<any>await this.commonService.getFiltro(params).toPromise()).datos;

    /*if (this.lstFiltro.length > 0) {
      this.lstFiltro.forEach(e => {
        e.infoAcademica.forEach(x => {
          x.nivelEstudioModel = this.lstEducationLevels.find(el => el.id === x.idNivelEstudio);
        });

        e.expLaboral.forEach(x => {
          x.sectoExperienciaModel = this.lstSectors.find(el => el.id === x.idSectorExperiencia);
        });
      });
    }*/

    this.dataSource.data = this.lstFiltro;
  }

  public viewFile() {
    const params: FilterDetalleUsuario = this.buildParams();
    this.fService.DescargarFiltro(params).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public cleanForm() {
    this.formV.resetForm()
  }

  public async campoCiudad(idCiudad){
    this.lstMunicipioAux = (<any>await this.commonService.getCitiesByDepartment(idCiudad.value).toPromise()).ciudades;
  }
}
