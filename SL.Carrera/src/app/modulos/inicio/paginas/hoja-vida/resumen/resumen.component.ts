import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { configMsg } from '../../../../../compartido/helpers/enums';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { DatePipe } from '@angular/common';
import { PersonalActivities } from '@app/compartido/modelos/personal-activities';
import { ObservationActivity } from '@app/compartido/modelos/observation-activity';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { WorkExperienceRama } from '@app/compartido/modelos/work-experience-rama';
import { AcademicInformation } from '@app/compartido/modelos/academic-information';
import { FamilyInformation } from '@app/compartido/modelos/family-information';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Annexed } from '@app/compartido/modelos/annexed';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { FilesService } from '@app/core/servicios/files.service';
import { Observable, forkJoin, concat } from 'rxjs';




@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class ResumenComponent extends BaseController implements OnInit, AfterViewChecked {

  //listas
  public lstNameCualities: any[] = [];
  public lstKnowledgeArea: any[] = [];
  public lstEducationLevels: any[] = [];
  public lstInstitutions: any[] = [];
  public lstSectors: any[] = [];
  public lstGenders: any[] = [];
  public lstCivil: any[] = [];
  public lstSex: any[] = [];
  public lstRelationships: any[] = [];
  public activities: any[] = [];
  public frequencies: any[] = [];
  public lstDiscapacidades: any[] = [];
  public lstYesNot = [];
  public lstTitles: any[] = [];

  ///Datos Personales
  public form: FormGroup;
  public dataPersonal: any = {};

  ///Informacion Familiar
  public updateDataInformationFamily: FamilyInformation[] = [];
  public displayedColumnsInformationFamily: string[] = ['firtsName',  'firtsLastname', 'secondLastname', 'birthdate',  'relationship', 'dependsEconomically'];
  public dataSourceInformationFamily = new MatTableDataSource<any>([]);

  //Actividades personales.
  public updateDataPersonalActivities: PersonalActivities[] = [];
  public displayedColumnsPersonalActivities: string[] = ['activity', 'frecuently','observaciones'];
  public dataSourcePersonalActivities = new MatTableDataSource<any>([]);
  public observationPersonalActivities = new FormControl('');

  ///Informacion Academica
  public updateDataAcademicInformation: AcademicInformation[] = [];
  public dataSourceAcademicInformation = new MatTableDataSource<any>([]);
  public displayedColumnsAcademicInformation: string[] = ['areaKnowledge', 'educationLevel', 'graduate', 'titleObtain', 'institute', 'numberCardProfesional', 'soport'];

  //Experiencia Laboral Fuera de la Rama Judicial
  public displayedColumnsWorkExperience: string[] = ['job', 'company', 'sector', 'initDate', 'endDate', 'soport'];
  public updateDataWorkExperience: WorkExperience[] = [];
  public dataSourceWorkExperience = new MatTableDataSource<any>([]);


  //Experiencia Laboral En la Rama Judicial
  public displayedColumnsWorkExperienceRama: string[] = ['job', 'grade', 'corporation',  'numberResolution', 'expireDate', 'initDate', 'endDate', 'soport'];
  public updateDataWorkExperienceRama: WorkExperienceRama[] = [];
  public dataSourceWorkExperienceRama = new MatTableDataSource<any>([]);

  //Experiencia Laboral En la Rama Judicial
  public displayedColumnsAnnexed: string[] = ['typeFile', 'otherFile', 'soport'];
  public updateDataAnnexed: Annexed[] = [];
  public dataSourceAnnexed = new MatTableDataSource<any>([]);

  private user = this.commonService.getVar(configMsg.USER);
  public data: any = {};

  @ViewChild("matPaginator1", { static: true }) paginator1: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  @ViewChild("matPaginator2", { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;

  @ViewChild("matPaginator3", { static: true }) paginator3: MatPaginator;
  @ViewChild('TableThreeSort', { static: true }) sort3: MatSort;

  @ViewChild("matPaginator4", { static: true }) paginator4: MatPaginator;
  @ViewChild('TableFourSort', { static: true }) sort4: MatSort;

  @ViewChild("matPaginator5", { static: true }) paginator5: MatPaginator;
  @ViewChild('TableFiveSort', { static: true }) sort5: MatSort;

  @ViewChild("matPaginator6", { static: true }) paginator6: MatPaginator;
  @ViewChild('TableSixSort', { static: true }) sort6: MatSort;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private emitter: EmitterService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fs:FilesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.lstYesNot = this.ct.lstYesOrNot();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSourceInformationFamily.paginator = this.paginator1;
    this.dataSourceInformationFamily.sort = this.sort;

    this.dataSourcePersonalActivities.paginator = this.paginator2;
    this.dataSourcePersonalActivities.sort = this.sort2;

    this.dataSourceAcademicInformation.paginator = this.paginator3;
    this.dataSourceAcademicInformation.sort = this.sort3;

    this.dataSourceWorkExperience.paginator = this.paginator4;
    this.dataSourceWorkExperience.sort = this.sort4;

    this.dataSourceWorkExperienceRama.paginator = this.paginator5;
    this.dataSourceWorkExperienceRama.sort = this.sort5;

    this.dataSourceAnnexed.paginator = this.paginator6;
    this.dataSourceAnnexed.sort = this.sort6;

    this.emitter.emitterCv({ showProgressLoading: true });
    this.loadForm();
    this.commonService.getDetailSummaryUser(this.user.id)
      .subscribe(
        (res: any) => {
          this.data = res.datos;
          this.loadData().finally(() => this.emitter.emitterCv({ showProgressLoading: false }));
        }, err => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
          this.emitter.emitterCv({ showProgressLoading: false });
        },
      );
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSourceAcademicInformation.data.sort((a: AcademicInformation, b: AcademicInformation) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'areaKnowledge': return this.compare(a.areaKnowledge, b.areaKnowledge, isAsc);
        case 'educationLevel': return this.compare(a.educationLevel, b.educationLevel, isAsc);
        case 'graduate': return this.compare(a.esGraduado, b.esGraduado, isAsc);
        case 'titleObtain': return this.compare(a.tipoTituloObtenido, b.tipoTituloObtenido, isAsc);
        case 'institute': return this.compare(a.institution, b.institution, isAsc);
        case 'numberCardProfesional': return this.compare(a.tarjetaProfesional, b.tarjetaProfesional, isAsc);
        default: return 0;
      }
    });
  }

  sortData1(sort: Sort) {
    const data = this.dataSourceWorkExperience.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: WorkExperience, b: WorkExperience) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'job': return this.compare(a.cargo, b.cargo, isAsc);
        case 'company': return this.compare(a.entidad, b.entidad, isAsc);
        case 'sector': return this.compare(a.sector, b.sector, isAsc);
        case 'initDate': return this.compare(a.fechaIngreso, b.fechaIngreso, isAsc);
        case 'endDate': return this.compare(a.fechaRetiro, b.fechaRetiro, isAsc);
        default: return 0;
      }
    });
  }

  sortData2(sort: Sort) {
    const data = this.dataSourceWorkExperienceRama.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: WorkExperienceRama, b: WorkExperienceRama) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'job': return this.compare(a.cargo, b.cargo, isAsc);
        case 'grade': return this.compare(a.grado, b.grado, isAsc);
        case 'corporation': return this.compare(a.corporacion, b.corporacion, isAsc);
        case 'numberResolution': return this.compare(a.resolucion, b.resolucion, isAsc);
        case 'expireDate' : return this.compare(a.fechaExpedicionResolucion, b.fechaExpedicionResolucion, isAsc);
        case 'initDate': return this.compare(a.fechaIngreso, b.fechaIngreso, isAsc);
        case 'endDate': return this.compare(a.fechaRetiro, b.fechaRetiro, isAsc);
        default: return 0;
      }
    });
  }

  sortData3(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSourceInformationFamily.data.sort((a: FamilyInformation, b: FamilyInformation) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {        
        case 'firtsName': return this.compare(a.primerNombre, b.primerNombre, isAsc);
        case 'firtsLastname': return this.compare(a.primerApellido, b.primerApellido, isAsc);
        case 'secondLastname': return this.compare(a.segundoApellido, b.segundoApellido, isAsc);        
        case 'birthdate': return this.compare(a.fechaNacimiento, b.fechaNacimiento, isAsc);
        case 'relationship': return this.compare(a.relationship, b.relationship, isAsc);
        case 'dependsEconomically': return this.compare(a.dependeEconomicamente, b.dependeEconomicamente, isAsc);
        default: return 0;
      }
    });
  }

  sortData4(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSourcePersonalActivities.data.sort((a: PersonalActivities, b: PersonalActivities) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'activity': return this.compare(a.activity, b.activity, isAsc);
        case 'frecuently': return this.compare(a.frecuently, b.frecuently, isAsc);
        case 'observaciones': return this.compare(a.observacion, b.observacion, isAsc);
        default: return 0;
      }
    });
  }

  sortData5(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSourceAnnexed.data.sort((a: Annexed, b: Annexed) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'typeFile': return this.compare(a.nameTypeFile, b.nameTypeFile, isAsc);
        case 'otherFile': return this.compare(a.otroArchivo, b.otroArchivo, isAsc);
        default: return 0;
      }
    });
  }

  /*sortData5(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSourceAnnexed.data.sort((a: Annexed, b: Annexed) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'typeFile': return this.compare(a.nameTypeFile, b.nameTypeFile, isAsc);
        case 'otherFile': return this.compare(a.otroArchivo, b.otroArchivo, isAsc);
        default: return 0;
      }
    });
  }*/

  public loadForm() {
    this.form = this.fb.group(
      {
        ///Informacion Familiar
        firtsName: new FormControl({ value: '', disabled: false }),
        secondName: new FormControl({ value: '', disabled: false }),
        firtsLastname: new FormControl({ value: '', disabled: false }),
        secondLastname: new FormControl({ value: '', disabled: false }),
        birthdate: new FormControl({ value: '', disabled: false }),
        sex: new FormControl({ value: '', disabled: false }),
        gener: new FormControl({ value: '', disabled: false }),
        relationship: new FormControl({ value: '', disabled: false }),
        otherRelationship: new FormControl({ value: '', disabled: false }),
        gender: new FormControl({ value: '', disabled: false }),
        bloodType: new FormControl({ value: '', disabled: false }),
        maritalStatus: new FormControl({ value: '', disabled: false }),
        email: new FormControl({ value: '', disabled: false }),
        country: new FormControl({ value: '', disabled: false }),
        department: new FormControl({ value: '', disabled: false }),
        municipality: new FormControl({ value: '', disabled: false }),
        nacionality: new FormControl(''),

        countryBirthdate: new FormControl({ value: '', disabled: false }),
        departmentBirthdate: new FormControl({ value: '', disabled: false }),
        municipalityBirthdate: new FormControl({ value: '', disabled: false }),

        countryExpideDocument: new FormControl({ value: '', disabled: false }),
        departmentExpideDocument: new FormControl({ value: '', disabled: false }),
        municipalityExpideDocument: new FormControl({ value: '', disabled: false }),

        celphone: new FormControl({ value: '', disabled: false }),
        address: new FormControl({ value: '', disabled: false }),
        typeIdentification: new FormControl({ value: '', disabled: false }),
        identification: new FormControl({ value: '', disabled: false }),
        classMilitarCard: new FormControl({ value: '', disabled: false }),
        numberMilitaryCard: new FormControl({ value: '', disabled: false }),
        distric: new FormControl({ value: '', disabled: false }),
        nameEmergency: new FormControl({ value: '', disabled: false }),
        addressEmergency: new FormControl({ value: '', disabled: false }),
        celEmergency: new FormControl({ value: '', disabled: false }),
        relationshipEmergencyContact: new FormControl({ value: '', disabled: false }),
        dateExpided: new FormControl({ value: '', disabled: false }),

        fileIdentification: new FormControl({ value: '', disabled: false }),
        fileMilitaryCard: new FormControl({ value: '', disabled: false }),

        tieneDiscapacidad: new FormControl({ value: 0, disabled: true }),
        porcentajeDiscapacidad: new FormControl({ value: '', disabled: false }),
        idTipoDiscapacidad: new FormControl({ value: '', disabled: false }),
        
        discapacidad: new FormControl({ value: '', disabled: false }),
      }
    );
  }

  public async loadData2() {
    try {
      this.dataPersonal = this.data.datosPersonales;

      this.form.patchValue({
        ///Datos Personales
        firtsName: this.dataPersonal.primerNombre,
        secondName: this.dataPersonal.segundoNombre,
        firtsLastname: this.dataPersonal.primerApellido,
        secondLastname: this.dataPersonal.segundoApellido,
        email: this.user.email,

        ///Contacto y Correspondencia
        celphone: this.dataPersonal.telefono,
        address: this.dataPersonal.direccionCorrespondencia,

        ///Lugar y Fecha de Nacimiento
        birthdate: this.datePipe.transform(this.dataPersonal.fechaNacimiento, 'dd/MM/yyyy'),

        ///Documento de Identidad
        identification: this.dataPersonal.numeroDocumento,
        dateExpided: this.datePipe.transform(this.dataPersonal.fechaExpedicionDocumento, 'dd/MM/yyyy'),


        ///Libreta Militar
        numberMilitaryCard: this.dataPersonal.numeroLibretaMilitar,
        distric: this.dataPersonal.distritoLibretaMilitar,
        classMilitarCard: this.dataPersonal.claseLibretaMilitar,

        ///En caso de emergencia avisar a
        nameEmergency: this.dataPersonal.nombreContactoEmergencia,
        addressEmergency: this.dataPersonal.direccionContactoEmergencia,
        celEmergency: this.dataPersonal.telefonoContactoEmergencia,

        nacionality: this.dataPersonal.nacionalidad,

        ///Discapacidad
        tieneDiscapacidad: this.dataPersonal.tieneDiscapacidad,
        porcentajeDiscapacidad: this.dataPersonal.porcentajeDiscapacidad,
        idTipoDiscapacidad: this.dataPersonal.idTipoDiscapacidad,
      });

     

      // TODO: Prueba de forkJoin
      this.dataPersonal.idGrupoSanguineo = undefined;
      const getBloodyTypeById: Observable<any> = this.dataPersonal.idGrupoSanguineo ?  this.commonService.getBloodyTypeById(this.dataPersonal.idGrupoSanguineo) : new Observable<any>();
      const getMaritalStatuById: Observable<any> = this.commonService.getMaritalStatuById(this.dataPersonal.idEstadoCivil);
      const getGenderById: Observable<any> = this.commonService.getGenderById(this.dataPersonal.idGenero);
      const getSex: Observable<any> = this.commonService.getSex();
      const getDiscapacidad: Observable<any> = this.commonService.getDiscapacidad();
      // const getBloodyTypes: Observable<any> = this.commonService.getBloodyTypes();
      // const getTypesIdentification: Observable<any> = this.commonService.getTypesIdentification();
      // const getRelationship: Observable<any> = this.commonService.getRelationship();
      // Se puede colocar animacion 

    
      forkJoin([getBloodyTypeById, getMaritalStatuById, getGenderById, getSex, getDiscapacidad]).subscribe({
        next: ([rgetBloodyTypeById, rgetMaritalStatuById, rgetGenderById, rgetSex, rDiscapacidad]) => {

          this.lstSex = rgetSex.datos;
          //const gender: string = rgetGenderById.datos.genero;
          const gender: string = this.translateField(rgetGenderById.datos, 'genero', this.lang)
          const blood: string = rgetBloodyTypeById.datos.grupoSanguineo ;
          const civil: string = rgetMaritalStatuById.datos.estadoCivil;
          const discapacidad: string = rDiscapacidad.datos.discapacidad;
          

          let sex: string;
          // const gender: string = this.dataPersonal.idGenero ? (<any>await this.commonService.getGenderById(this.dataPersonal.idGenero).toPromise()).datos.genero : '';
          // const blood: string = this.dataPersonal.idGrupoSanguineo ? (<any>await this.commonService.getBloodyTypeById(this.dataPersonal.idGrupoSanguineo).toPromise()).datos.grupoSanguineo : '';
          // const civil: string = this.dataPersonal.idEstadoCivil ? (<any>await this.commonService.getMaritalStatuById(this.dataPersonal.idEstadoCivil).toPromise()).datos.estadoCivil : '';

          //cargar listas
          // this.lstSex = (<any>await this.commonService.getSex().toPromise()).datos;
          this.lstSex.forEach(g => {
            if (this.dataPersonal.idSexo == g.id) {
              //sex = g.sexo;
              sex = this.translateField(g , 'sexo', this.lang);
              return;
            }
          });

          this.form.patchValue({
            sex: sex,
            gender: gender,
            bloodType: blood,
            maritalStatus: civil,
          });

        },
        error: () => {
          console.log('ERROR');
        }
      });



      const muniCorrespondence: any = this.dataPersonal.idCiudadCorrespondencia ? (<any>await this.commonService.getCityById(this.dataPersonal.idCiudadCorrespondencia).toPromise()).datos : '';
      const departmentCorrespondence: any = muniCorrespondence.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniCorrespondence.idDepartamento).toPromise()).datos : '';
      const countryCorrespondence: any = departmentCorrespondence.idPais ? (<any>await this.commonService.getCountryById(departmentCorrespondence.idPais).toPromise()).datos : '';

      const muniBirthdate: any = this.dataPersonal.idLugarNacimiento ? (<any>await this.commonService.getCityById(this.dataPersonal.idLugarNacimiento).toPromise()).datos : '';
      const departmentBirthdate: any = muniBirthdate.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniBirthdate.idDepartamento).toPromise()).datos : '';
      const countryBirthdate: any = departmentBirthdate.idPais ? (<any>await this.commonService.getCountryById(departmentBirthdate.idPais).toPromise()).datos : '';

      const muniExpideDocument: any = this.dataPersonal.idLugarExpedicionDocumento ? (<any>await this.commonService.getCityById(this.dataPersonal.idLugarExpedicionDocumento).toPromise()).datos : '';
      const departmentExpideDocument: any = muniExpideDocument.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniExpideDocument.idDepartamento).toPromise()).datos : '';
      const countryExpideDocument: any = departmentExpideDocument.idPais ? (<any>await this.commonService.getCountryById(departmentExpideDocument.idPais).toPromise()).datos : '';

      const typeIdenti: string = this.dataPersonal.idTipoDocumento ? (<any>await this.commonService.getTypesIdentificationById(this.dataPersonal.idTipoDocumento).toPromise()).datos.tipoDocumento : '';
      const relationshipEmergencyContact: string = this.dataPersonal.idParentesco ? (<any>await this.commonService.getRelationshipById(this.dataPersonal.idParentesco).toPromise()).datos.parentesco : '';

      if (this.dataPersonal.soporteIdentificacion) {
        this.dataPersonal.detailFileIdentification = (<any>await this.fs.getInformationFile(this.dataPersonal.soporteIdentificacion).toPromise()).datos;
      }
      if (this.dataPersonal.soporteLibretaMilitar) {
        this.dataPersonal.detailFileMilitarydCard = (<any>await this.fs.getInformationFile(this.dataPersonal.soporteLibretaMilitar).toPromise()).datos;
      }

      this.form.patchValue({

        ///Contacto y Correspondencia
        country: countryCorrespondence.pais,
        municipality: muniCorrespondence.ciudad,
        department: departmentCorrespondence.departamento,

        ///Lugar y Fecha de Nacimiento
        countryBirthdate: countryBirthdate.pais,
        municipalityBirthdate: muniBirthdate.ciudad,
        departmentBirthdate: departmentBirthdate.departamento,

        ///Documento de Identidad
        typeIdentification: typeIdenti,
        countryExpideDocument: countryExpideDocument.pais,
        municipalityExpideDocument: muniExpideDocument.ciudad,
        departmentExpideDocument: departmentExpideDocument.departamento,

        ///Libreta Militar

        ///En caso de emergencia avisar a
        relationshipEmergencyContact: relationshipEmergencyContact,

        //files
        fileIdentification: C.validateData(this.dataPersonal.detailFileIdentification) ? this.dataPersonal.detailFileIdentification.nombreAuxiliar : undefined,
        fileMilitaryCard: C.validateData(this.dataPersonal.detailFileMilitarydCard) ? this.dataPersonal.detailFileMilitarydCard.nombreAuxiliar : undefined,
      });

      //cargar listas
      this.lstRelationships = (<any>await this.commonService.getRelationship().toPromise()).datos;
      this.activities = (<any>await this.commonService.getPersonalActivity().toPromise()).datos;
      this.frequencies = (<any>await this.commonService.getFrecuentlyActivity().toPromise()).datos;
      this.lstEducationLevels = (<any>await this.commonService.getLevelStudy().toPromise()).datos;
      const c: any[] = [];
      this.lstEducationLevels.forEach((e, i) => {
        c[i] = e.nivelEstudio + " - " + e.codTipoEstudio;
      });
      this.lstInstitutions = (<any>await this.commonService.getInstitutions().toPromise()).datos;
      this.lstKnowledgeArea = (<any>await this.commonService.getAreaKnowledge().toPromise()).datos;
      this.lstSectors = (<any>await this.commonService.getSectorExperience().toPromise()).datos;

      ///Informacion Familiar
      this.updateDataInformationFamily = <FamilyInformation[]>(<any>await this.cvService.getFamilyInformation(this.user.id).toPromise()).datos;

      if (this.updateDataInformationFamily.length > 0) {
        this.updateDataInformationFamily.forEach(e => {
          this.lstSex.forEach(g => {
            if (e.idSexo == g.id) {
              //e.sex = g.sexo;
              e.sex = this.translateField(g , 'sexo', this.lang);
              return;
            }
          });
          this.lstRelationships.forEach(r => {
            if (e.idParentesco == r.id) {
              //e.relationship = r.parentesco + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              e.relationship = this.translateField(r , 'parentesco', this.lang); + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              return;
            }
          });
        });
        this.dataSourceInformationFamily.data = this.updateDataInformationFamily;
      }

      //Actividades personales.
      this.updateDataPersonalActivities = <PersonalActivities[]>(<any>await this.cvService.getActivityInformationByUser(this.user.id).toPromise()).datos;
      const oTemp = <ObservationActivity[]>(<any>await this.cvService.getObervatioActivityInformationByUser(this.user.id).toPromise()).datos;

      if (oTemp.length > 0) {
        const observationTemp: ObservationActivity = oTemp[0];
        this.observationPersonalActivities.setValue(observationTemp.observacion);
      }

      if (this.updateDataPersonalActivities.length > 0) {
        this.updateDataPersonalActivities.forEach(e => {
          this.activities.forEach(g => {
            if (e.idActividadPersonal == g.id) {
              //e.activity = g.actividadPersonal;
              e.activity = this.translateField(g , 'actividadPersonal', this.lang);
              return;
            }
          });
          this.frequencies.forEach(r => {
            if (e.idFrecuencia == r.id) {
              //e.frecuently = r.frecuenciaActividad;
              e.frecuently = this.translateField(r , 'frecuenciaActividad', this.lang);
              return;
            }
          });
        });
        this.dataSourcePersonalActivities.data = this.updateDataPersonalActivities;
      }

      ///Informacion Academica
      this.updateDataAcademicInformation = <AcademicInformation[]>(<any>await this.cvService.getAcademicInformation(this.user.id).toPromise()).datos;
      if (this.updateDataAcademicInformation.length > 0) {
        this.updateDataAcademicInformation.forEach(e => {

          this.lstKnowledgeArea.forEach(g => {
            if (e.idAreaConocimiento == g.id) {
              //e.areaKnowledge = g.areaConocimiento;
              e.areaKnowledge = this.translateField(g , 'areaConocimiento', this.lang);
              return;
            }
          });

          this.lstEducationLevels.forEach(g => {
            if (e.idNivelEstudio == g.id) {
              //e.educationLevel = g.nivelEstudio;
              e.educationLevel = this.translateField(g , 'nivelEstudio', this.lang);
              return;
            }
          });
          this.lstInstitutions.forEach(r => {
            if (e.idInstitucion == r.id) {
              //e.institution = r.institucion;
              e.institution = this.translateField(r , 'nivelEstudio', this.lang);
              return;
            }
          });

        });
        this.dataSourceAcademicInformation.data = this.updateDataAcademicInformation;
      }

      //Experiencia Laboral Fuera de la Rama Judicial
      this.updateDataWorkExperience = <WorkExperience[]>(<any>await this.cvService.getWorkExperience(this.user.id).toPromise()).datos;
      this.updateDataWorkExperience.sort((a: WorkExperience, b: WorkExperience) => {
        return this.getTime(new Date(b.fechaIngreso)) - this.getTime(new Date(a.fechaIngreso));
      });
      if (this.updateDataWorkExperience.length > 0) {
        for (let i = 0; i < this.updateDataWorkExperience.length; i++) {
          const cityTemp = (<any>await this.commonService.getCityById(this.updateDataWorkExperience[i].idCiudad).toPromise()).datos;
          this.updateDataWorkExperience[i].municipality = cityTemp.ciudad;
          this.lstSectors.forEach(g => {
            if (this.updateDataWorkExperience[i].idSectorExperiencia == g.id) {
              this.updateDataWorkExperience[i].sector = g.sectorExperiencia;
              return;
            }
          });
        }
        this.dataSourceWorkExperience.data = this.updateDataWorkExperience;
      }

      //Experiencia Laboral En la Rama Judicial
      this.updateDataWorkExperienceRama = <WorkExperienceRama[]>(<any>await this.cvService.getWorkExperienceRama(this.user.id).toPromise()).datos;
      if (this.updateDataWorkExperienceRama.length > 0) {
        for (let i = 0; i < this.updateDataWorkExperienceRama.length; i++) {
          const cityTemp = (<any>await this.commonService.getCityById(this.updateDataWorkExperienceRama[i].idCiudad).toPromise()).datos;
          this.updateDataWorkExperienceRama[i].municipality = cityTemp.ciudad;
          this.lstNameCualities.forEach(g => {
            if (this.updateDataWorkExperienceRama[i].calidadNombramiento == g.id) {
              this.updateDataWorkExperienceRama[i].nameQuality = g.text;
              return;
            }
          });
        }
        this.dataSourceWorkExperienceRama.data = this.updateDataWorkExperienceRama;
      }

      //Anexos
      const lstTypeFileAnnexed = <TypeFileAnnexed[]>(<any>await this.commonService.getTypeFileAnnexed().toPromise()).datos;
      this.updateDataAnnexed = <Annexed[]>(<any>await this.cvService.getAnnexesByUser(this.user.id).toPromise()).datos;
      if (this.updateDataAnnexed.length > 0) {
        for (let i = 0; i < this.updateDataAnnexed.length; i++) {
          lstTypeFileAnnexed.forEach(g => {
            if (this.updateDataAnnexed[i].idTipoArchivo == g.id) {
              this.updateDataAnnexed[i].nameTypeFile = g.tipoArchivo;
              return;
            }
          });
        }
        this.dataSourceAnnexed.data = this.updateDataAnnexed;
      }
      this.alertService.close();
    } catch (error) {
      console.log(error);
    }
  }


  public async loadData() {
    try {
      this.dataPersonal = this.data.datosPersonales;
      // const sex: string = this.dataPersonal.idSexo ? (<any>await this.commonService.getSexById(this.dataPersonal.idSexo).toPromise()).datos.sexo : '';
      let sex: string;

      const gender: string = this.dataPersonal.idGenero ? this.translateField((<any>await this.commonService.getGenderById(this.dataPersonal.idGenero).toPromise()).datos,'genero', this.lang ) : '';
      const blood: string = this.dataPersonal.idGrupoSanguineo ? (<any>await this.commonService.getBloodyTypeById(this.dataPersonal.idGrupoSanguineo).toPromise()).datos.grupoSanguineo : '';
      const civil: string = this.dataPersonal.idEstadoCivil ? this.translateField((<any>await this.commonService.getMaritalStatuById(this.dataPersonal.idEstadoCivil).toPromise()).datos,'estadoCivil', this.lang ) : '';
      const disca: string = this.dataPersonal.idTipoDiscapacidad ? this.translateField((<any>await this.commonService.getDiscapacidadById(this.dataPersonal.idTipoDiscapacidad).toPromise()).datos,'discapacidad', this.lang ) : '';

      //cargar listas
      this.lstNameCualities = this.ct.lstNameCualities();
      this.lstSex = (<any>await this.commonService.getSex().toPromise()).datos;
      this.lstDiscapacidades = (<any>await this.commonService.getDiscapacidad().toPromise()).datos;
      this.lstSex.forEach(g => {
        if (this.dataPersonal.idSexo == g.id) {
          //sex = g.sexo;
          sex = this.translateField(g, 'sexo', this.lang);
          return;
        }
      });

      const classMilitar = this.ct.lstClassMilitaryCard().find(x => x.id == this.dataPersonal.claseLibretaMilitar);

      this.form.patchValue({
        ///Datos Personales
        firtsName: this.dataPersonal.primerNombre,
        secondName: this.dataPersonal.segundoNombre,
        firtsLastname: this.dataPersonal.primerApellido,
        secondLastname: this.dataPersonal.segundoApellido,
        sex: sex,
        gender: gender,
        bloodType: blood,
        maritalStatus: civil,
        email: this.user.email,

        discapacidad: this.dataPersonal.discapacidad,

        tieneDiscapacidad: this.dataPersonal.tieneDiscapacidad,
        porcentajeDiscapacidad: this.dataPersonal.porcentajeDiscapacidad,
        idTipoDiscapacidad: disca,

        ///Contacto y Correspondencia
        celphone: this.dataPersonal.telefono,
        address: this.dataPersonal.direccionCorrespondencia,

        ///Lugar y Fecha de Nacimiento
        birthdate: this.datePipe.transform(this.dataPersonal.fechaNacimiento, 'dd/MM/yyyy'),

        ///Documento de Identidad
        identification: this.dataPersonal.numeroDocumento,
        dateExpided: this.datePipe.transform(this.dataPersonal.fechaExpedicionDocumento, 'dd/MM/yyyy'),


        ///Libreta Militar
        numberMilitaryCard: this.dataPersonal.numeroLibretaMilitar,
        distric: this.dataPersonal.distritoLibretaMilitar,
        classMilitarCard: classMilitar ? classMilitar.valor : '',

        ///En caso de emergencia avisar a
        nameEmergency: this.dataPersonal.nombreContactoEmergencia,
        addressEmergency: this.dataPersonal.direccionContactoEmergencia,
        celEmergency: this.dataPersonal.telefonoContactoEmergencia,

        nacionality: this.dataPersonal.nacionalidad,
      });



      const muniCorrespondence: any = this.dataPersonal.idCiudadCorrespondencia ? (<any>await this.commonService.getCityById(this.dataPersonal.idCiudadCorrespondencia).toPromise()).datos : '';
      const departmentCorrespondence: any = muniCorrespondence.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniCorrespondence.idDepartamento).toPromise()).datos : '';
      const countryCorrespondence: any = departmentCorrespondence.idPais ? (<any>await this.commonService.getCountryById(departmentCorrespondence.idPais).toPromise()).datos : '';

      const muniBirthdate: any = this.dataPersonal.idLugarNacimiento ? (<any>await this.commonService.getCityById(this.dataPersonal.idLugarNacimiento).toPromise()).datos : '';
      const departmentBirthdate: any = muniBirthdate.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniBirthdate.idDepartamento).toPromise()).datos : '';
      const countryBirthdate: any = departmentBirthdate.idPais ? (<any>await this.commonService.getCountryById(departmentBirthdate.idPais).toPromise()).datos : '';

      const muniExpideDocument: any = this.dataPersonal.idLugarExpedicionDocumento ? (<any>await this.commonService.getCityById(this.dataPersonal.idLugarExpedicionDocumento).toPromise()).datos : '';
      const departmentExpideDocument: any = muniExpideDocument.idDepartamento ? (<any>await this.commonService.getDepartmentById(muniExpideDocument.idDepartamento).toPromise()).datos : '';
      const countryExpideDocument: any = departmentExpideDocument.idPais ? (<any>await this.commonService.getCountryById(departmentExpideDocument.idPais).toPromise()).datos : '';

      const typeIdenti: string = this.dataPersonal.idTipoDocumento ? (<any>await this.commonService.getTypesIdentificationById(this.dataPersonal.idTipoDocumento).toPromise()).datos.tipoDocumento : '';
      const relationshipEmergencyContact: string = this.dataPersonal.idParentesco ? this.translateField((<any>await this.commonService.getRelationshipById(this.dataPersonal.idParentesco).toPromise()).datos,'parentesco', this.lang ) : '';

      if (this.dataPersonal.soporteIdentificacion) {
        this.dataPersonal.detailFileIdentification = (<any>await this.fs.getInformationFile(this.dataPersonal.soporteIdentificacion).toPromise()).datos;
      }
      if (this.dataPersonal.soporteLibretaMilitar) {
        this.dataPersonal.detailFileMilitarydCard = (<any>await this.fs.getInformationFile(this.dataPersonal.soporteLibretaMilitar).toPromise()).datos;
      }

      this.form.patchValue({

        ///Contacto y Correspondencia
        country: countryCorrespondence.pais,
        municipality: muniCorrespondence.ciudad,
        department: departmentCorrespondence.departamento,

        ///Lugar y Fecha de Nacimiento
        countryBirthdate: countryBirthdate.pais,
        municipalityBirthdate: muniBirthdate.ciudad,
        departmentBirthdate: departmentBirthdate.departamento,
       
        ///Documento de Identidad
        typeIdentification: typeIdenti,
        countryExpideDocument: countryExpideDocument.pais,
        municipalityExpideDocument: muniExpideDocument.ciudad,
        departmentExpideDocument: departmentExpideDocument.departamento,

        ///Libreta Militar

        ///En caso de emergencia avisar a
        relationshipEmergencyContact: relationshipEmergencyContact,

        //files
        fileIdentification: C.validateData(this.dataPersonal.detailFileIdentification) ? this.dataPersonal.detailFileIdentification.nombreAuxiliar : undefined,
        fileMilitaryCard: C.validateData(this.dataPersonal.detailFileMilitarydCard) ? this.dataPersonal.detailFileMilitarydCard.nombreAuxiliar : undefined,
      });

      //cargar listas
      this.lstRelationships = (<any>await this.commonService.getRelationship().toPromise()).datos;
      this.activities = (<any>await this.commonService.getPersonalActivity().toPromise()).datos;
      this.frequencies = (<any>await this.commonService.getFrecuentlyActivity().toPromise()).datos;
      this.lstEducationLevels = (<any>await this.commonService.getLevelStudy().toPromise()).datos;
      const c: any[] = [];
      this.lstEducationLevels.forEach((e, i) => {
        c[i] = e.nivelEstudio + " - " + e.codTipoEstudio;
      });
      this.lstInstitutions = (<any>await this.commonService.getInstitutions().toPromise()).datos;
      this.lstKnowledgeArea = (<any>await this.commonService.getAreaKnowledge().toPromise()).datos;
      this.lstSectors = (<any>await this.commonService.getSectorExperience().toPromise()).datos;
      this.lstTitles = (<any>await this.commonService.getTitulos().toPromise()).datos;
      ///Informacion Familiar
      this.updateDataInformationFamily = <FamilyInformation[]>(<any>await this.cvService.getFamilyInformation(this.user.id).toPromise()).datos;

      if (this.updateDataInformationFamily.length > 0) {
        this.updateDataInformationFamily.forEach(e => {
          this.lstSex.forEach(g => {
            if (e.idSexo == g.id) {
              //e.sex = g.sexo;
              e.sex = this.translateField(g , 'sexo', this.lang);
              return;
            }
          });
          this.lstRelationships.forEach(r => {
            if (e.idParentesco == r.id) {
              //e.relationship = r.parentesco + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              e.relationship = this.translateField(r , 'parentesco', this.lang); + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
              return;
            }
          });
        });
        this.dataSourceInformationFamily.data = this.updateDataInformationFamily;
      }

      //Actividades personales.
      this.updateDataPersonalActivities = <PersonalActivities[]>(<any>await this.cvService.getActivityInformationByUser(this.user.id).toPromise()).datos;
      const oTemp = <ObservationActivity[]>(<any>await this.cvService.getObervatioActivityInformationByUser(this.user.id).toPromise()).datos;

      if (oTemp.length > 0) {
        const observationTemp: ObservationActivity = oTemp[0];
        this.observationPersonalActivities.setValue(observationTemp.observacion);
      }

      if (this.updateDataPersonalActivities.length > 0) {
        this.updateDataPersonalActivities.forEach(e => {
          this.activities.forEach(g => {
            if (e.idActividadPersonal == g.id) {
              //e.activity = g.actividadPersonal;
              e.activity = this.translateField(g , 'actividadPersonal', this.lang);
              return;
            }
          });
          this.frequencies.forEach(r => {
            if (e.idFrecuencia == r.id) {
              //e.frecuently = r.frecuenciaActividad;
              e.frecuently = this.translateField(r , 'frecuenciaActividad', this.lang);
              return;
            }
          });
        });
        this.dataSourcePersonalActivities.data = this.updateDataPersonalActivities;
      }

      ///Informacion Academica
      this.updateDataAcademicInformation = <AcademicInformation[]>(<any>await this.cvService.getAcademicInformation(this.user.id).toPromise()).datos;
      if (this.updateDataAcademicInformation.length > 0) {
        this.updateDataAcademicInformation.forEach(e => {

          this.lstKnowledgeArea.forEach(g => {
            if (e.idAreaConocimiento == g.id) {
              //e.areaKnowledge = g.areaConocimiento;
              e.areaKnowledge = this.translateField(g , 'areaConocimiento', this.lang);
              return;
            }
          });

          this.lstEducationLevels.forEach(g => {
            if (e.idNivelEstudio == g.id) {
              //e.educationLevel = g.nivelEstudio;
              e.educationLevel = this.translateField(g , 'nivelEstudio', this.lang);
              return;
            }
          });
          this.lstInstitutions.forEach(r => {
            if (e.idInstitucion == r.id) {
              //e.institution = r.institucion;
              e.institution = this.translateField(r , 'institucion', this.lang);
              return;
            }
          });
          this.lstTitles.forEach(r => {
            if (e.idTipoTituloObtenido === r.id) {
              //e.tipoTituloObtenido = r.titulo;
              e.tipoTituloObtenido = this.translateField(r , 'titulo', this.lang);
              return;
            }
          });
        });
        this.dataSourceAcademicInformation.data = this.updateDataAcademicInformation;
      }

      //Experiencia Laboral Fuera de la Rama Judicial
      this.updateDataWorkExperience = <WorkExperience[]>(<any>await this.cvService.getWorkExperience(this.user.id).toPromise()).datos;
      this.updateDataWorkExperience.sort((a: WorkExperience, b: WorkExperience) => {
        return this.getTime(new Date(b.fechaIngreso)) - this.getTime(new Date(a.fechaIngreso));
      });
      if (this.updateDataWorkExperience.length > 0) {
        for (let i = 0; i < this.updateDataWorkExperience.length; i++) {
          const cityTemp = (<any>await this.commonService.getCityById(this.updateDataWorkExperience[i].idCiudad).toPromise()).datos;
          this.updateDataWorkExperience[i].municipality = cityTemp.ciudad;
          this.lstSectors.forEach(g => {
            if (this.updateDataWorkExperience[i].idSectorExperiencia == g.id) {
              this.updateDataWorkExperience[i].sector = g.sectorExperiencia;
              return;
            }
          });
        }
        this.dataSourceWorkExperience.data = this.updateDataWorkExperience;
      }

      //Experiencia Laboral En la Rama Judicial
      this.updateDataWorkExperienceRama = <WorkExperienceRama[]>(<any>await this.cvService.getWorkExperienceRama(this.user.id).toPromise()).datos;
      if (this.updateDataWorkExperienceRama.length > 0) {
        for (let i = 0; i < this.updateDataWorkExperienceRama.length; i++) {
          const cityTemp = (<any>await this.commonService.getCityById(this.updateDataWorkExperienceRama[i].idCiudad).toPromise()).datos;
          this.updateDataWorkExperienceRama[i].municipality = cityTemp.ciudad;
          this.lstNameCualities.forEach(g => {
            if (this.updateDataWorkExperienceRama[i].calidadNombramiento == g.id) {
              this.updateDataWorkExperienceRama[i].nameQuality = g.text;
              return;
            }
          });
        }
        this.dataSourceWorkExperienceRama.data = this.updateDataWorkExperienceRama;
      }

      //Anexos
      const lstTypeFileAnnexed = <TypeFileAnnexed[]>(<any>await this.commonService.getTypeFileAnnexed().toPromise()).datos;
      this.updateDataAnnexed = <Annexed[]>(<any>await this.cvService.getAnnexesByUser(this.user.id).toPromise()).datos;
      if (this.updateDataAnnexed.length > 0) {
        for (let i = 0; i < this.updateDataAnnexed.length; i++) {
          lstTypeFileAnnexed.forEach(g => {
            if (this.updateDataAnnexed[i].idTipoArchivo == g.id) {
              this.updateDataAnnexed[i].nameTypeFile = g.tipoArchivo;
              return;
            }
          });
        }
        this.dataSourceAnnexed.data = this.updateDataAnnexed;
      }
      this.alertService.close();
    } catch (error) {
      console.log(error);
    }
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fs.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  private getTime(date?: Date) {
    return date != null ? date.getTime() : 0;
  }

}
