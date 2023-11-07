import { Component, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { Constants as C } from '@app/compartido/helpers/constants';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { AcademicInformation } from '@app/compartido/modelos/academic-information';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { DatePipe } from '@angular/common';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { AreaConocimiento } from '@app/compartido/modelos/area-conocimiento';
import { ModalidadEstudio } from '@app/compartido/modelos/modalidad-estudio';
import { LevelStudy } from '@app/compartido/modelos/level-study';
import { SoporteModel } from '@app/compartido/modelos/soporte-model';

@Component({
  selector: 'app-informacion-academica',
  templateUrl: './informacion-academica.component.html',
  styleUrls: ['./informacion-academica.component.scss'],
})
export class InformacionAcademicaComponent extends BaseController implements OnInit, AfterViewChecked {


  public lstGrades: any[] = [];
  public lstGraduates: any[] = [];
  public lstTitles: any[] = [];
  public lstKnowledgeArea: AreaConocimiento[] = [];
  public lstYears: any[] = (C.range(1980, (new Date()).getFullYear() + 1)).sort((a, b) => b - a);
  public lstEducationLevels: LevelStudy[] = [];
  public lstEducationLevels2: LevelStudy[] = [];
  public lstInstitutions: any[] = [];
  public lstSemesters: any[] = C.range(1, 11);
  public lstTipoEstudio: ModalidadEstudio[] = [];
  public lstTipoModalidad: ModalidadEstudio[] = [];
  public lstTipoModalidad2: ModalidadEstudio[] = [];
  public lstInformacioAcademica: AcademicInformation[] = [];
  public updateData: AcademicInformation[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public dataSourceAll = new MatTableDataSource<any>([]);
  // public displayedColumns: string[] = ['areaKnowledge', 'educationLevel', 'grade', 'approvedSemesters', 'graduate', 'titleObtain', 'institute', 'gradeDate', 'anio', 'hours', 'numberCardProfesional', 'options'];
  public displayedColumns: string[] = ['tipoEstudio', 'modalidad', 'educationLevel', 'titleObtain', 'institute', 'gradeDate', 'soport','convalidacion', 'options'];
  public form: FormGroup;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: AcademicInformation | any = {};

  public showField: statesField = this.initStateFields(false);
  public matcher: any;
  public submit = false;

  public filteredOptions: Observable<any[]>;
  public filteredTitles: Observable<any[]>;

  private validationType = {
    areaKnowledge: [Validators.required],
    educationLevel: [Validators.required],
    grade: [Validators.required],
    approvedSemesters: [Validators.required],
    graduate: [Validators.required],
    titleObtain: [Validators.required, Validators.maxLength(100)],
    titleNotFormal: [Validators.required, Validators.maxLength(100)],
    institute: [Validators.required],
    gradeDate: [Validators.required],
    year: [Validators.required],
    hours: [Validators.required, Validators.maxLength(5)],
    numberCardProfesional: [Validators.maxLength(20)],
    // numberCardProfesional: [Validators.required, Validators.maxLength(20)],
    dateExpideCardProfesional: [],
    requiredfile: [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)],


    modalidad: [Validators.required],
    modalidadEstudio: [Validators.required],

    tituloFueraPais: [Validators.required],
    idSoporteTituloFueraPais: [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)],
  };

  private CONTROL_TOTAL_REGISTROS_INFO = 20;
  private TOTAL_REGISTROS_CURRENT = 0;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('soportFile', { static: false }) inputFileView: ElementRef;
  @ViewChild('soportFileTFP', { static: false }) inputFileViewTFP: ElementRef;
  @ViewChild('divTituloFuera', { static: true }) divTituloFuera: ElementRef;

  constructor(
    private fb: FormBuilder,
    private emitter: EmitterService,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    public datepipe: DatePipe,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fs: FilesService
  ) {
    super();
    this.alertService.loading();
    this.lang = this.ct.getLangDefault().langBd;
    BaseController.lang = this.lang;

    const temp: string[] = [];
    this.lstYears.forEach(e => {
      temp.push(String(e));
    });
    this.lstYears = temp;
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
    this.loadForm();
    this.loadList()
      .then(r => {
        this.loadData().then(() => this.alertService.close());
      }
      );
    this.lstGraduates = this.ct.lstYesOrNot();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.filteredOptions = this.f.institute.valueChanges
      .pipe(
        startWith(''),
        // map(value => this._filter(value))
        map(value => typeof value === 'string' ? value : value != null ? value.institucion : ''),
        map(institucion => institucion ? this._filter(institucion) : this.lstInstitutions.slice())
      );
    this.filteredTitles = this.f.titleObtain.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? this.translateField(value, 'titulo', this.lang) : ''),
        map(titulo => titulo ? this._filterTitle(titulo) : this.lstTitles.slice())
      );

    this.dataSource.filterPredicate = (data: AcademicInformation, filter: string): boolean => {
      const dataCompare = [data.areaKnowledge, data.educationLevel, (data.esGraduado === 1 ? this.ct.YES : this.ct.NOT), data.tipoTituloObtenido, data.institution, this.commonService.getFormatDate(new Date(data.fechaGrado))];
      return C.filterTable(dataCompare, filter);
    };

    //ocultar el div del soporte para titulo fuera del pais
    this.divTituloFuera.nativeElement.hidden = true;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data.sort((a: AcademicInformation, b: AcademicInformation) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tipoEstudio': return this.compare(a.tipoEstudio, b.tipoEstudio, isAsc);
        case 'modalidad': return this.compare(a.modalidadEstudio, b.modalidadEstudio, isAsc);
        case 'educationLevel': return this.compare(a.educationLevel, b.educationLevel, isAsc);
        case 'titleObtain': return this.compare(a.tipoTituloObtenido, b.tipoTituloObtenido, isAsc);
        case 'institute': return this.compare(a.institution, b.institution, isAsc);
        case 'gradeDate': return this.compare(a.fechaGrado, b.fechaGrado, isAsc);
        default: return 0;
      }
    });
  }

  private _filter(value: any): any[] {
    if (!value || value === '') {
      return this.lstInstitutions;
    }
    const filterValue = value.toLowerCase();
    return this.lstInstitutions.filter(e => e.institucion.toLowerCase().includes(filterValue));
    // return this.options.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterTitle(value: any): any[] {
    if (!value || value === '') {
      return this.lstTitles;
    }
    const filterValue = value.toLowerCase();
    return this.lstTitles.filter(e => this.translateField(e, 'titulo', this.lang).toLowerCase().includes(filterValue));
  }

  public displayFn(pInstitute: any): string {
    return pInstitute && pInstitute.institucion ? pInstitute.institucion : '';
  }

  public displayTitle(pTitle: any): string {
    const field = pTitle ? BaseController.translateField(pTitle, 'titulo', BaseController.lang) : '';
    return field ? field : '';
  }

  public async loadList() {
    this.lstEducationLevels = (await this.commonService.getLevelStudy().toPromise() as any).datos;
    const c: any[] = [];
    this.lstEducationLevels.forEach((e, i) => {
      c[i] = e.nivelEstudio + ' - ' + e.codTipoEstudio;
    });
    this.lstEducationLevels.forEach((e, i) => {
      c[i] = e.nivelEstudio + ' - ' + e.codTipoEstudio;
    });
    this.lstInstitutions = (await this.commonService.getInstitutions().toPromise() as any).datos;
    this.lstKnowledgeArea = (await this.commonService.getAreaKnowledge().toPromise() as any).datos;
    this.lstTitles = (await this.commonService.getTitulos().toPromise() as any).datos;
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.TOTAL_REGISTROS_CURRENT = 0;
    this.updateData = (await this.cvService.getAcademicInformation(this.user.id).toPromise() as any).datos as AcademicInformation[];
    this.TOTAL_REGISTROS_CURRENT = this.updateData.length;
    this.lstTipoEstudio = (await this.commonService.getTipoEstudio().toPromise() as any).datos as ModalidadEstudio[];
    // this.lstInformacioAcademica = <AcademicInformation[]>(<any>await this.cvService.getAllAcademicInformation().toPromise()).datos;
    this.lstTipoModalidad = (await this.commonService.getModalidadEstudio().toPromise() as any).datos as ModalidadEstudio[];
    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {
        e.tipoEstudio = this.translateField(e, 'tipoEstudio', this.lang);
        e.modalidadEstudio = this.translateField(e, 'modalidadEstudio', this.lang);
        this.lstKnowledgeArea.forEach(g => {
          if (e.idAreaConocimiento === g.id) {
            // e.areaKnowledge = g.areaConocimiento;
            e.areaKnowledge = this.translateField(g, 'areaConocimiento', this.lang);
            return;
          }
        });

        this.lstEducationLevels.forEach(g => {
          if (e.idNivelEstudio === g.id) {
            // e.educationLevel = g.nivelEstudio;
            e.educationLevel = this.translateField(g, 'nivelEstudio', this.lang);
            return;
          }
        });
        this.lstInstitutions.forEach(r => {
          if (e.idInstitucion === r.id) {
            e.institution = r.institucion;
            return;
          }
        });

        this.lstTitles.forEach(r => {
          if (e.idTipoTituloObtenido === r.id) {
            // e.tipoTituloObtenido = r.titulo;
            e.tipoTituloObtenido = this.translateField(r, 'titulo', this.lang);
            return;
          } else if (e.idTipoTituloObtenido === null && e.tituloObtenidoInformal !== '') {
            e.tipoTituloObtenido = e.tituloObtenidoInformal;
            return;
          }
        });
        e.grade = e.numSemestresAprobados;
      });
    }

    this.dataSource.data = this.updateData;
    this.alertService.close();
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        areaKnowledge: new FormControl('', this.validationType.areaKnowledge),
        educationLevel: new FormControl('', this.validationType.educationLevel),
        grade: new FormControl('', this.validationType.grade),
        approvedSemesters: new FormControl('', [Validators.required]),
        graduate: new FormControl('', this.validationType.graduate),
        titleObtain: new FormControl('', this.validationType.titleObtain),
        titleNotFormal: new FormControl('', this.validationType.titleNotFormal),
        institute: new FormControl('', this.validationType.institute),
        gradeDate: new FormControl('', this.validationType.gradeDate),
        year: new FormControl('', this.validationType.year),
        hours: new FormControl('', this.validationType.hours),
        numberCardProfesional: new FormControl('', this.validationType.numberCardProfesional),
        dateExpideCardProfesional: new FormControl('', this.validationType.dateExpideCardProfesional),
        requiredfile: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],

        modalidadEstudio: new FormControl('', this.validationType.educationLevel),
        modalidad: new FormControl('', this.validationType.educationLevel),

        tituloFueraPais: new FormControl(0, this.validationType.tituloFueraPais),
        idSoporteTituloFueraPais: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );

    this.f.graduate.valueChanges.subscribe(
      v => {
        if (v !== '' && this.showField.graduate) {

          let educationLevelTemp: any;
          this.lstEducationLevels.forEach(e => {
            if (e.id === this.f.educationLevel.value) {
              educationLevelTemp = e;
              return;
            }
          });

          if (v === 1) {
            this.f.gradeDate.setValidators(this.validationType.gradeDate);
            this.f.gradeDate.updateValueAndValidity();

            if (this.elementCurrent.soporte) {
              C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
            } else {
              C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
            }

            if (educationLevelTemp && educationLevelTemp.aplicaTarjetaProfesional === 1) {
              this.f.numberCardProfesional.setValidators(this.validationType.numberCardProfesional);
              this.f.numberCardProfesional.updateValueAndValidity();
              this.f.dateExpideCardProfesional.setValidators(this.validationType.dateExpideCardProfesional);
              this.f.dateExpideCardProfesional.updateValueAndValidity();
            }

          } else {
            this.f.gradeDate.clearValidators();
            this.f.gradeDate.updateValueAndValidity();
            C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);

            if (educationLevelTemp && educationLevelTemp.aplicaTarjetaProfesional === 1) {
              this.f.numberCardProfesional.clearValidators();
              this.f.numberCardProfesional.updateValueAndValidity();
              this.f.dateExpideCardProfesional.clearValidators();
              this.f.dateExpideCardProfesional.updateValueAndValidity();
            }
          }
        }

      }
    );

    this.f.tituloFueraPais.valueChanges.subscribe(
      res => {
        if (res !== '' && res == 1) {
          const required = this.elementCurrent.idSoporteTituloFueraPais ? false : true;
          C.setValidatorFile(required, this.f.idSoporteTituloFueraPais, this.configFile.sizeFile);
          this.divTituloFuera.nativeElement.hidden = false;
        } else {
          C.setValidatorFile(false, this.f.idSoporteTituloFueraPais, this.configFile.sizeFile);
          this.divTituloFuera.nativeElement.hidden = true;
        }
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  validateNumber(value) {
    try {
      if (value) {
        return Number(value);
      }
    } catch (e) {
      return 0;
    }
    return 0;
  }

  public async edit(element: AcademicInformation) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.clearInputFile(this.inputFileView);

    let levelStidyTemp: LevelStudy = null;
    this.lstEducationLevels.forEach(e => {
      if (e.id === element.idNivelEstudio) {
        this.changeEducationLevel({ value: e.id });
        this.f.graduate.setValue(element.esGraduado);
        levelStidyTemp = e;
        return;
      }
    });

    if (levelStidyTemp) {
      const modalidadTemp = this.lstTipoModalidad.find(x => x.id === levelStidyTemp.idModalidad);
      const tipoEstudio = this.lstTipoEstudio.find(x => x.id === modalidadTemp.idReferencia);
      this.cambiarTipoEstudio({ value: tipoEstudio.id });
      this.cambiarTipoNivelEstudio({ value: modalidadTemp.id });
      this.f.modalidadEstudio.setValue(tipoEstudio.id);
      this.f.modalidad.setValue(modalidadTemp.id);

    }

    this.form.patchValue({
      id: element.id,
      areaKnowledge: element.idAreaConocimiento,
      educationLevel: element.idNivelEstudio,
      grade: element.grade,
      approvedSemesters: element.numSemestresAprobados,
      graduate: element.esGraduado,
      titleNotFormal: element.tituloObtenidoInformal,
      gradeDate: element.fechaGrado,
      year: element.anio,
      hours: element.horas,
      numberCardProfesional: element.tarjetaProfesional,
      dateExpideCardProfesional: element.fechaExpedicionTarjeta,

      tituloFueraPais: element.tituloFueraPais
    });



    this.lstInstitutions.forEach(e => {
      if (e.id === element.idInstitucion) {
        this.f.institute.setValue(e);
        return;
      }
    });

    this.lstTitles.forEach(e => {
      if (e.id === element.idTipoTituloObtenido) {
        this.f.titleObtain.setValue(e);
        return;
      }
    });

    if (this.f.graduate.value === '0') {
      this.f.gradeDate.clearValidators();
      this.f.gradeDate.updateValueAndValidity();
    }
    this.changeEducationLevel({ value: element.idNivelEstudio });

    if (this.elementCurrent.id) {
      this.elementCurrent.nameSoport = (await this.fs.getInformationFile(this.elementCurrent.soporte).toPromise() as any).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }

    //setear si tiene titulo fuera del pais
    /*if (this.f.tituloFueraPais.value === '0') {
      this.f.tituloFueraPais.clearValidators();
      this.f.tituloFueraPais.updateValueAndValidity();
    }*/

    //setear archivo titulo fuera pais
    if (this.elementCurrent.id && this.elementCurrent.tituloFueraPais == 1 && this.elementCurrent.idSoporteTituloFueraPais) {
      this.fs.getInformationFile(this.elementCurrent.idSoporteTituloFueraPais)
        .toPromise()
        .then(res => {
          this.elementCurrent.soporteTituloFueraPaisModel = res.datos;
          C.setValidatorFile(false, this.f.idSoporteTituloFueraPais, this.configFile.sizeFile);
        }).catch(err => console.log(err))
    }
  }


  public async addLevelEducation() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.requiredfile.markAsTouched();
      this.f.graduate.markAsTouched();
      this.f.idSoporteTituloFueraPais.markAsTouched();
      return;
    }

    /* if (this.TOTAL_REGISTROS_CURRENT === this.CONTROL_TOTAL_REGISTROS_INFO || this.TOTAL_REGISTROS_CURRENT >= this.CONTROL_TOTAL_REGISTROS_INFO) {
      this.alertService.message(this.ct.MSG_NUMBER_MAX_EXCEEDED_INFO, TYPES.ERROR);
      this.submit = false;
      return;
    } */

    this.alertService.loading();


    const add: AcademicInformation = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idAreaConocimiento: this.f.areaKnowledge.value,
      idNivelEstudio: this.f.educationLevel.value,
      idInstitucion: this.f.institute.value.id,
      // idInstitucion: this.f.institute.value,
      numSemestresAprobados: this.f.approvedSemesters.value ? this.validateNumber(this.f.approvedSemesters.value) : this.validateNumber(this.f.grade.value),
      esGraduado: Number(this.f.graduate.value),
      idTipoTituloObtenido: this.f.titleObtain.value ? this.f.titleObtain.value.id : null,
      tituloObtenidoInformal: this.f.titleNotFormal.value,
      fechaGrado: this.f.gradeDate.value ? this.f.gradeDate.value : null,
      tarjetaProfesional: this.f.numberCardProfesional.value,
      anio: String(this.f.year.value),
      horas: String(this.f.hours.value),
      soporte: this.elementCurrent.soporte,
      fechaExpedicionTarjeta: this.f.dateExpideCardProfesional.value ? this.f.dateExpideCardProfesional.value : '',

      // modalidadEstudio: this.f.modalidadEstudio.value,
      // modalidad: this.f.modalidad.value
      tituloFueraPais: Number(this.f.tituloFueraPais.value),
      idSoporteTituloFueraPais: this.elementCurrent.idSoporteTituloFueraPais,
    };

    if ((this.updateData.length === this.CONTROL_TOTAL_REGISTROS_INFO || this.updateData.length >= this.CONTROL_TOTAL_REGISTROS_INFO) && !this.f.id.value) {
      this.alertService.message(this.ct.MSG_NUMBER_MAX_EXCEEDED_INFO, TYPES.ERROR);
      this.submit = false;
      return;
    }

    if (this.f.requiredfile.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fs.deleteFile(this.elementCurrent.soporte).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (this.f.requiredfile.value as FileInput).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.INFORMACION_ACADEMICA, documentsType.SOPORTE, this.getDateString()),
        Modulo: modulesSoports.INFORMACION_ACADEMICA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      add.soporte = documentFile.id;
    }

    //guardar el archivo titulo fuera pais
    if (this.f.idSoporteTituloFueraPais.value) {
      if (this.elementCurrent.idSoporteTituloFueraPais) {
        try {
          await this.fs.deleteFile(this.elementCurrent.idSoporteTituloFueraPais).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      if (add.tituloFueraPais == 1) {
        const file = (this.f.idSoporteTituloFueraPais.value as FileInput).files[0];
        const params = {
          NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.INFORMACION_ACADEMICA, documentsType.SOPORTE, this.getDateString()),
          Modulo: modulesSoports.INFORMACION_ACADEMICA,
          NombreAuxiliar: file.name,
          idUsuarioModificacion: this.user.id
        };
        const documentFile: any = await this.fs.postFile(file, params).toPromise();
        add.idSoporteTituloFueraPais = documentFile.id;
      } else {
        add.idSoporteTituloFueraPais = null;
      }
    }

    //eliminar el soporte del servidor si marca no
    if (add.tituloFueraPais == 0) {
      add.idSoporteTituloFueraPais = null;
      if (this.elementCurrent.idSoporteTituloFueraPais) {
        try {
          await this.fs.deleteFile(this.elementCurrent.idSoporteTituloFueraPais).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
    }

    this.cvService.saveAcademicInformation(add).toPromise()
      .then(res => {
        this.loadData().then(() => {
          this.cleanForm();
          this.clearInputFile(this.inputFileView);
          this.clearInputFile(this.inputFileViewTFP);
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
          this.emitter.emitterCv({ progressBar: true });
        });
      })
      .catch(err => {
        console.log('Error', err);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fs.downloadFile(id).subscribe(
      res => {
        const blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }



  public delete(element: AcademicInformation) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
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
          this.cvService.deleteAcademicInformation(element)
            .subscribe(ok => {
              this.deleteSoport(element.soporte);
              this.deleteSoport(element.idSoporteTituloFueraPais);
              this.emitter.emitterCv({ progressBar: true });
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  public changeEducationLevel(event) {
    // this.alertService.loading();
    if (event.value === undefined) {
      return;
    }
    let educationLevelTemp: any;
    this.lstEducationLevels.forEach(e => {
      if (e.id === event.value) {
        educationLevelTemp = e;
        return;
      }
    });
    this.initStateFields(false);
    this.initValidators(this.form);

    switch (educationLevelTemp.codTipoEstudio) {
      case 'B':
        this.showField.grade = true;
        this.showField.titleObtain = true;
        this.showField.institute = true;
        this.showField.gradeDate = true;
        this.showField.graduate = true;

        if (educationLevelTemp.nivelEstudio === C.PRIMARIA) {
          this.lstGrades = C.range(1, 6);
          if (this.f.grade.value && Number(this.f.grade.value) >= 6) {
            this.f.grade.setValue('');
          }
        } else if (educationLevelTemp.nivelEstudio === C.BACHILLER) {
          this.lstGrades = C.range(6, 12);
          if (this.f.grade.value && Number(this.f.grade.value) < 6) {
            this.f.grade.setValue('');
          }
        }

        this.f.graduate.setValidators(this.validationType.graduate);
        this.f.grade.setValidators(this.validationType.grade);
        this.f.titleObtain.setValidators(this.validationType.titleObtain);
        this.f.institute.setValidators(this.validationType.institute);
        this.f.gradeDate.setValidators(this.validationType.gradeDate);
        break;

      case 'I':
        this.showField.titleObtain = false;
        this.showField.titleNotFormal = true;
        this.showField.institute = true;
        // this.showField.gradeDate = true;
        this.showField.year = true;
        this.showField.hours = true;


        // this.f.titleObtain.setValidators(this.validationType.titleObtain);
        this.f.titleNotFormal.setValidators(this.validationType.titleNotFormal);
        this.f.institute.setValidators(this.validationType.institute);
        // this.f.gradeDate.setValidators(this.validationType.gradeDate);
        this.f.year.setValidators(this.validationType.year);
        this.f.hours.setValidators(this.validationType.hours);
        break;

      case 'S':
        this.showField.titleObtain = true;
        this.showField.institute = true;
        this.showField.gradeDate = true;
        this.showField.approvedSemesters = true;
        this.showField.graduate = true;

        this.f.graduate.setValidators(this.validationType.graduate);
        this.f.titleObtain.setValidators(this.validationType.titleObtain);
        this.f.institute.setValidators(this.validationType.institute);
        this.f.gradeDate.setValidators(this.validationType.gradeDate);
        this.f.approvedSemesters.setValidators(this.validationType.approvedSemesters);
        if (this.f.approvedSemesters.value && Number(this.f.grade.value) > this.lstSemesters[this.lstSemesters.length - 1]) {
          this.f.approvedSemesters.setValue('');
        }

        if (educationLevelTemp.aplicaTarjetaProfesional === 1) {
          this.showField.numberCardProfesional = true;
          this.showField.dateExpideCardProfesional = true;
          this.f.numberCardProfesional.setValidators(this.validationType.numberCardProfesional);
          this.f.dateExpideCardProfesional.setValidators(this.validationType.dateExpideCardProfesional);
        }
        break;

      case 'T':
        this.showField.titleObtain = true;
        this.showField.institute = true;
        this.showField.approvedSemesters = true;
        this.showField.gradeDate = true;
        this.showField.graduate = true;

        this.f.graduate.setValidators(this.validationType.graduate);
        this.f.titleObtain.setValidators(this.validationType.titleObtain);
        this.f.institute.setValidators(this.validationType.institute);
        this.f.approvedSemesters.setValidators(this.validationType.approvedSemesters);
        this.f.gradeDate.setValidators(this.validationType.gradeDate);
        break;
    }

    this.showField.soport = true;
    /*if (this.elementCurrent.id) {
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }*/


    this.initValue();

    // tslint:disable-next-line: forin
    for (const key in this.form.controls) {
      this.form.get(key).updateValueAndValidity();
    }

  }

  public initStateFields(state: boolean) {
    this.showField = {
      grade: state,
      approvedSemesters: state,
      graduate: state,
      titleObtain: state,
      titleNotFormal: state,
      institute: state,
      gradeDate: state,
      year: state,
      hours: state,
      numberCardProfesional: state,
      soport: state,
      dateExpideCardProfesional: state,
    };
    return this.showField;
  }

  public initValue() {
    this.f.grade.setValue(this.showField.grade ? this.f.grade.value : '');
    this.f.approvedSemesters.setValue(this.showField.approvedSemesters ? this.f.approvedSemesters.value : '');
    this.f.graduate.setValue(this.showField.graduate ? this.f.graduate.value : '');
    this.f.titleObtain.setValue(this.showField.titleObtain ? this.f.titleObtain.value : '');
    this.f.institute.setValue(this.showField.institute ? this.f.institute.value : '');
    this.f.gradeDate.setValue(this.showField.gradeDate ? this.f.gradeDate.value : '');
    this.f.year.setValue(this.showField.year ? this.f.year.value : '');
    this.f.hours.setValue(this.showField.hours ? this.f.hours.value : '');
    this.f.numberCardProfesional.setValue(this.showField.numberCardProfesional ? this.f.numberCardProfesional.value : '');
    this.f.requiredfile.setValue(this.showField.soport ? this.f.requiredfile.value : '');
    this.f.dateExpideCardProfesional.setValue(this.showField.dateExpideCardProfesional ? this.f.dateExpideCardProfesional.value : '');
  }

  public initValidators(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
    }
    this.form.controls.areaKnowledge.setValidators(this.validationType.areaKnowledge);
    this.form.controls.areaKnowledge.updateValueAndValidity();
    this.form.controls.educationLevel.setValidators(this.validationType.educationLevel);
    this.form.controls.educationLevel.updateValueAndValidity();
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
  }

  public setInstituteControl(pInstitute: any) {
    this.f.institute.setValue(pInstitute.id);
  }


  private deleteIsSelected(id) {
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.initStateFields(false);
    this.initValidators(this.form);
    this.initValue();
    this.clearInputFile(this.inputFileView);
    this.clearInputFile(this.inputFileViewTFP);
    this.cleanTipoEducativoModalidad(3);
  }

  public deleteFileView() {
    this.elementCurrent.nameSoport = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }

  public deleteFileTituloFueraPais() {
    this.elementCurrent.soporteTituloFueraPaisModel = null;
    C.setValidatorFile(true, this.f.idSoporteTituloFueraPais, this.configFile.sizeFile);
    this.f.idSoporteTituloFueraPais.setValue(null);
    this.elementCurrent.idSoporteTituloFueraPais = null;
  }

  public deleteSoport(soporte) {
    if (soporte) {
      this.fs.deleteFile(soporte).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public cambiarTipoEstudio(event) {
    this.cleanTipoEducativoModalidad(3);
    this.initStateFields(false);
    if (this.lstTipoModalidad.length > 0) {
      this.lstTipoModalidad.forEach(e => {
        if (e.idReferencia === event.value) {
          this.lstTipoModalidad2.push(e);
        }
      });
    }
  }

  public cambiarTipoNivelEstudio(event) {
    this.cleanTipoEducativoModalidad(2);
    this.initStateFields(false);
    if (this.lstEducationLevels.length > 0) {
      this.lstEducationLevels.forEach(e => {
        if (e.idModalidad === event.value) {
          this.lstEducationLevels2.push(e);
        }
      });
    }
  }

  private cleanTipoEducativoModalidad(tipo: number) {
    if (tipo === 1) {
      this.lstTipoModalidad2.splice(0);
      this.f.modalidad.setValue(null);
    } else if (tipo === 2) {
      this.lstEducationLevels2.splice(0);
      this.f.educationLevel.setValue(null);
    } else {
      this.lstTipoModalidad2.splice(0);
      this.f.modalidad.setValue(null);
      this.lstEducationLevels2.splice(0);
      this.f.educationLevel.setValue(null);
    }

  }


  public getNombreSoporte(soporte: SoporteModel) {
    if (soporte) {
      return soporte.nombreAuxiliar;
    }
    return '';
  }


}

export interface statesField {
  grade: boolean,
  approvedSemesters: boolean,
  graduate: boolean,
  titleObtain: boolean,
  institute: boolean,
  gradeDate: boolean,
  year: boolean,
  hours: boolean,
  numberCardProfesional: boolean,
  soport: boolean,
  dateExpideCardProfesional: boolean,
  titleNotFormal: boolean,
}