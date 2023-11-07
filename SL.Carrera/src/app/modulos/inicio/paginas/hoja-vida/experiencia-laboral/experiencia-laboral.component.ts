import { SectorExperience } from './../../../../../compartido/modelos/sector-experience';
import { Component, ViewChild, OnInit, AfterViewChecked, ChangeDetectorRef, TemplateRef, ElementRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm, Form } from '@angular/forms';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { WorkExperience } from '@app/compartido/modelos/work-experience';
import { WorkExperienceRama } from '@app/compartido/modelos/work-experience-rama';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { DatePipe } from '@angular/common';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import * as moment from 'moment';
import { CDays360 } from '@app/compartido/helpers/days360';
import { Fechas } from '@app/compartido/helpers/fechas';
import { FilesService } from '@app/core/servicios/files.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { TipoExperienciaLaboralModel } from '@app/compartido/modelos/tipo-experiencia-laboral-model';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss'],
})
export class ExperienciaLaboralComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstNameCualities: any[] = [];
  public lstTipoExperienciaLaboral: TipoExperienciaLaboralModel[] = [];

  public lstSectors: any[] = [];
  public lstCountries: any[];
  public lstDepartments: any[];
  public lstMunicipalities: any[];

  public lstCountries2: any[];
  public lstDepartments2: any[];
  public lstMunicipalities2: any[];

  public dataSource = new MatTableDataSource<any>([]);
  public dataSource2 = new MatTableDataSource<any>([]);
  public dataSourceEmpresa1 = new MatTableDataSource<any>([]);
  public dataSourceEmpresa2 = new MatTableDataSource<any>([]);

  // public displayedColumns: string[] = ['job', 'company', 'sector', 'municipality', 'initDate', 'endDate', 'currentWork', 'soport', 'options'];
  public displayedColumns: string[] = ['job', 'company', 'initDate', 'endDate', 'currentWork', 'soport', 'options'];
  public displayedColumns2: string[] = ['job', 'grade', 'corporation', 'initDate', 'endDate', 'currentWork', 'soport', 'options'];
  // public displayedColumns2: string[] = ['job', 'grade', 'corporation', 'nameQuality', 'initDate', 'endDate', 'currentWork', 'soport', 'options'];
  public displayedColumnsEmp1: string[] = ['cargo', 'fechaIngreso', 'fechaRetiro', 'soporte', 'options'];
  public displayedColumnsEmp2: string[] = ['cargo', 'grado', 'calidadNombramiento', 'fechaIngreso', 'fechaRetiro', 'soporte', 'options'];

  public form: FormGroup;
  public form2: FormGroup;
  public form3: FormGroup;
  public form4: FormGroup;

  public minDate: Date;
  public maxDate: Date;
  public now = new Date();

  public updateData: WorkExperience[] = [];
  public updateData2: WorkExperienceRama[] = [];
  private user = this.commonService.getVar(configMsg.USER);

  public elementCurrent: any = {};
  public elementCurrent2: any = {};
  public elementCurrent3: any = {};
  public matcher: any;
  public submit = false;
  public submit3 = false;
  public submit4 = false;

  public showEndDate = true;
  public showEndDate2 = true;

  public showCatedra = false;
  public sectorEducativo = null;

  /* Experiencia laboral por empresa */
  public showFieldSameFile = false;
  public showFieldSupport = false;
  public lstExperiencesEmp1: WorkExperience[] = [];
  private dialogRef1: MatDialogRef<any, any>;


  /* Experiencia laboral por empresa en la rama */
  public showFieldSameFile2 = false;
  public showFieldSupport2 = false;
  public lstExperiencesEmp2: WorkExperienceRama[] = [];
  private dialogRef2: MatDialogRef<any, any>;

  private CONTROL_TOTAL_REGISTROS_EXPERIENCIAS = 40;
  private TOTAL_REGISTROS_CURRENT = 0;

  public totalExperienceWork =
    { rama: { years: 0, months: 0, days: 0, msg: '' }, fueraRama: { years: 0, months: 0, days: 0, msg: '' }, total: { years: 0, months: 0, days: 0, msg: '' } };

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild('formV3', { static: false }) formV3: NgForm;
  @ViewChild('formV4', { static: false }) formV4: NgForm;
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  // @ViewChild('sort1', { static: true }) sort: MatSort;
  // @ViewChild('sort2', { static: true }) sort2: MatSort;
  // @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  // @ViewChild('table2', { read: MatSort, static: true }) sort2: MatSort;

  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;

  @ViewChild('dialogAddExperience1', { static: true }) dialog1: TemplateRef<any>;
  @ViewChild('dialogAddExperience2', { static: true }) dialog2: TemplateRef<any>;

  @ViewChild('inputFileSoport', { static: false }) inputFileViewFueraDeRama: ElementRef;
  @ViewChild('inputFileSoport2', { static: false }) inputFileViewDentroDeRama: ElementRef;

  constructor(
    private fb: FormBuilder,
    private emitter: EmitterService,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    public datepipe: DatePipe,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fs: FilesService,
    private dialogService: MatDialog,
    private convService: AdministracionConvocatoriaService
  ) {
    super();

    this.now.setDate(this.now.getDate() + 1);

    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);

    this.emitter.emitterCv({ value: 10 });
    this.loadForm1();
    this.loadForm2();
    this.loadForm3();
    this.loadForm4();
    this.loadData()
      .then(async ok => {
        if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
          return;
        }
        await this.loadData1();
        await this.loadData2();
        this.calculateTimeWork();
      });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource2.paginator = this.paginator2;

    this.dataSource.sort = this.sort;
    this.dataSource2.sort = this.sort2;

    this.dataSource.filterPredicate = (data: WorkExperience, filter: string): boolean => {
      const dataCompare = [data.cargo, data.entidad, data.sector, data.municipality, this.commonService.getFormatDate(new Date(data.fechaIngreso)), this.commonService.getFormatDate(new Date(data.fechaRetiro)), (data.esTrabajoActual === 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare, filter);
    }

    this.dataSource2.filterPredicate = (data: WorkExperienceRama, filter: string): boolean => {
      const dataCompare = [data.cargo, data.grado, data.corporacion, data.nameQuality, this.commonService.getFormatDate(new Date(data.fechaIngreso)), this.commonService.getFormatDate(new Date(data.fechaRetiro)), (data.esTrabajoActual === 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare, filter);
    }
  }

  sortData1(sort: Sort) {
    const data = this.dataSource.data;
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
        case 'municipality': return this.compare(a.municipality, b.municipality, isAsc);
        case 'initDate': return this.compare(a.fechaIngreso, b.fechaIngreso, isAsc);
        case 'endDate': return this.compare(a.fechaRetiro, b.fechaRetiro, isAsc);
        case 'currentWork': return this.compare(a.esTrabajoActual, b.esTrabajoActual, isAsc);
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

    sortedData = data.sort((a: WorkExperienceRama, b: WorkExperienceRama) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'job': return this.compare(a.cargo, b.cargo, isAsc);
        case 'grade': return this.compare(a.grado, b.grado, isAsc);
        case 'corporation': return this.compare(a.corporacion, b.corporacion, isAsc);
        case 'nameQuality': return this.compare(a.municipality, b.municipality, isAsc);
        case 'initDate': return this.compare(a.fechaIngreso, b.fechaIngreso, isAsc);
        case 'endDate': return this.compare(a.fechaRetiro, b.fechaRetiro, isAsc);
        case 'currentWork': return this.compare(a.esTrabajoActual, b.esTrabajoActual, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    this.lstNameCualities = this.ct.lstNameCualities();
    this.lstCountries = (await this.commonService.getCountries().toPromise() as any).paises;
    this.lstSectors = (await this.commonService.getSectorExperience().toPromise() as any).datos;
    this.lstTipoExperienciaLaboral = (await this.convService.getTipoExperienciaLaboral().toPromise() as any).datos;
    this.lstCountries2 = this.lstCountries;

    this.lstSectors.forEach(e => {
      // e.sectorExperiencia.includes('Educativo');
      if (e.sectorExperiencia.includes('Educativo')) {
        this.sectorEducativo = e;
      }
    });
  }

  public async loadData1() {
    this.updateData = (await this.cvService.getWorkExperience(this.user.id).toPromise() as any).datos as WorkExperience[];
    // this.TOTAL_REGISTROS_CURRENT += this.updateData.length;
    // this.updateData.sort((a: WorkExperience, b: WorkExperience) => {
    //   return C.getTime(new Date(b.fechaIngreso)) - C.getTime(new Date(a.fechaIngreso));
    // });
    if (this.updateData.length > 0) {
      this.updateData.forEach(async e => {
        const cityTemp = (await this.commonService.getCityById(e.idCiudad).toPromise() as any).datos;
        e.municipality = cityTemp.ciudad;
        this.lstSectors.forEach(g => {
          if (e.idSectorExperiencia === g.id) {
            e.sector = g.sectorExperiencia;
            return;
          }
        });
        if (e.esTrabajoActual === 1) {
          e.fechaRetiro = new Date().toString();
        }
        //buscar el tipo de experiencia laboral
        e.tipoExperienciaLaboralModel = this.lstTipoExperienciaLaboral.find(x => x.id == e.idTipoExperienciaLaboral);

      });
    }
    this.updateData.sort((a, b) => new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime());
    this.dataSource.data = this.updateData;
    this.alertService.close();
  }

  public async loadData2() {
    this.updateData2 = (await this.cvService.getWorkExperienceRama(this.user.id).toPromise() as any).datos as WorkExperienceRama[];
    // this.TOTAL_REGISTROS_CURRENT += this.updateData2.length;
    // this.updateData2.sort((a: WorkExperienceRama, b: WorkExperienceRama) => {
    //   return C.getTime(new Date(b.fechaIngreso)) - C.getTime(new Date(a.fechaIngreso));
    // });
    if (this.updateData2.length > 0) {
      this.updateData2.forEach(e => {
        e.municipality = e.idCiudad + '';
      });

      this.updateData2.forEach(async e => {
        const cityTemp = (await this.commonService.getCityById(e.idCiudad).toPromise() as any).datos;
        e.municipality = cityTemp.ciudad;
        this.lstNameCualities.forEach(g => {
          if (e.calidadNombramiento === g.id) {
            e.nameQuality = g.text;
            return;
          }
        });
        if (e.esTrabajoActual === 1) {
          e.fechaRetiro = new Date().toString();
        }
      });
    }
    this.updateData2.sort((a, b) => new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime());
    this.dataSource2.data = this.updateData2;
    this.alertService.close();
  }

  public calculateTimeWork() {
    let lstDates = [];
    this.updateData.forEach((data: WorkExperience) => {
      lstDates.push({
        start: data.fechaIngreso,
        end: data.fechaRetiro,
        rama: false
      });
    });

    this.updateData2.forEach((data: WorkExperienceRama) => {
      lstDates.push({
        start: data.fechaIngreso,
        end: data.fechaRetiro,
        rama: true
      });
    });

    lstDates.sort((a: any, b: any) => {
      return C.getTime(new Date(a.end)) - C.getTime(new Date(b.start));
    });

    let years = 0;
    let months = 0;
    let days = 0;

    let yearsRama = 0;
    let monthsRama = 0;
    let daysRama = 0;

    let yearsFueraRama = 0;
    let monthsFueraRama = 0;
    let daysFueraRama = 0;

    lstDates.forEach(date => {
      const daysTemp = CDays360.Days360(new Date(date.start), new Date(date.end));
      // const daysTemp = Fechas.diferenciaAMD(new Date(date.start), new Date(date.end));

      days += daysTemp;
      if (date.rama) {
        daysRama += daysTemp;
      } else {
        daysFueraRama += daysTemp;
      }
    });

    const nDays = 30;
    const nMonths = 12;

    // global
    let modDays = days % nDays;
    months = (days - modDays) / nDays;
    let modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.total.years = years;
    this.totalExperienceWork.total.months = modMonths;
    this.totalExperienceWork.total.days = modDays;


    // fuera rama
    modDays = daysFueraRama % nDays;
    months = (daysFueraRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.fueraRama.years = years;
    this.totalExperienceWork.fueraRama.months = modMonths;
    this.totalExperienceWork.fueraRama.days = modDays;


    // rama
    modDays = daysRama % nDays;
    months = (daysRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.rama.years = years;
    this.totalExperienceWork.rama.months = modMonths;
    this.totalExperienceWork.rama.days = modDays;



    this.totalExperienceWork.total.msg = `${this.totalExperienceWork.total.years} ${this.ct.YEARS}  ${this.totalExperienceWork.total.months} ${this.ct.MONTHS} ${this.totalExperienceWork.total.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.rama.msg = `${this.totalExperienceWork.rama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.rama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.rama.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.fueraRama.msg = `${this.totalExperienceWork.fueraRama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.fueraRama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.fueraRama.days} ${this.ct.DAYS}`;

    return;




    let daysT = 0;

    lstDates.forEach(date => {
      // day360 += CDays360.Days360(new Date(date.start), new Date(date.end));
      var a = moment(date.end);
      var b = moment(date.start);

      const daysTemp2 = a.diff(b, 'days');
      daysT += daysTemp2;

      // const yearsTemp = a.diff(b, 'year');
      // years += yearsTemp;
      // b.add(yearsTemp, 'years');

      const monthsTemp = a.diff(b, 'months');
      months += monthsTemp
      b.add(monthsTemp, 'months');

      const daysTemp = a.diff(b, 'days');
      days += daysTemp;

      if (date.rama) {
        // yearsRama += yearsTemp;
        monthsRama += monthsTemp;
        daysRama += daysTemp;
      } else {
        // yearsFueraRama += yearsTemp;
        monthsFueraRama += monthsTemp;
        daysFueraRama += daysTemp;
      }

    });

    let daysT2 = 0;

    if (days >= 30) {
      months += days >= 30 ? 1 : 0;
      days = days >= 30 ? 0 : days;
      daysT2 = (months * 30) + (days > 31 ? 30 : days);

    } else if (days === 0) {
      daysT2 = (months * 30);
    } else {
      daysT2 = (months * 30) + (days > 31 ? 30 : days);
    }

    days = daysT2;

    this.totalExperienceWork.total.years = years;
    this.totalExperienceWork.total.months = modMonths;
    this.totalExperienceWork.total.days = modDays;

    if (daysFueraRama >= 30) {
      monthsFueraRama += daysFueraRama >= 30 ? 1 : 0;
      daysFueraRama = daysFueraRama >= 30 ? 0 : daysFueraRama;
      daysT2 = (monthsFueraRama * 30) + (daysFueraRama > 31 ? 30 : daysFueraRama);
    } else if (daysFueraRama === 0) {
      daysT2 = (monthsFueraRama * 30);
    } else {
      daysT2 = (monthsFueraRama * 30) + (daysFueraRama > 31 ? 30 : daysFueraRama);
    }
    daysFueraRama = daysT2;


    modDays = daysFueraRama % nDays;
    months = (daysFueraRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.fueraRama.years = years;
    this.totalExperienceWork.fueraRama.months = modMonths;
    this.totalExperienceWork.fueraRama.days = modDays;




    if (daysRama >= 30) {
      monthsRama += daysRama >= 30 ? 1 : 0;
      daysRama = daysRama >= 30 ? 0 : daysRama;
      daysT2 = (monthsRama * 30) + (daysRama > 31 ? 30 : daysRama);
    } else if (daysRama === 0) {
      daysT2 = (monthsRama * 30);
    } else {
      daysT2 = (monthsRama * 30) + (daysRama > 31 ? 30 : daysRama);
    }
    daysRama = daysT2;

    modDays = daysRama % nDays;
    months = (daysRama - modDays) / nDays;
    modMonths = months % nMonths;
    years = (months - modMonths) / nMonths;

    this.totalExperienceWork.rama.years = years;
    this.totalExperienceWork.rama.months = modMonths;
    this.totalExperienceWork.rama.days = modDays;






    // var totalA = moment(lstDates[0].start);
    // var totalB = moment(lstDates[0].start);


    // totalA = moment(totalA).add(days, 'days');
    // totalA = moment(totalA).add(months, 'months');
    // totalA = moment(totalA).add(years, 'years');



    // years = totalA.diff(totalB, 'year');
    // totalB = moment(totalB).add(years, 'years');
    // months = totalA.diff(totalB, 'months');
    // totalB = moment(totalB).add(months, 'months');
    // days = totalA.diff(totalB, 'days');


    // this.totalExperienceWork.total.years = years;
    // this.totalExperienceWork.total.months = months;
    // this.totalExperienceWork.total.days = days;

    // rama
    // totalA = moment();
    // totalB = moment();

    // totalA = moment(totalA).add(daysRama, 'days');
    // totalA = moment(totalA).add(monthsRama, 'months');
    // totalA = moment(totalA).add(yearsRama, 'years');

    // years = totalA.diff(totalB, 'year');
    // totalB = moment(totalB).add(years, 'years');
    // months = totalA.diff(totalB, 'months');
    // totalB = moment(totalB).add(months, 'months');
    // days = totalA.diff(totalB, 'days');

    // this.totalExperienceWork.rama.years = years;
    // this.totalExperienceWork.rama.months = months;
    // this.totalExperienceWork.rama.days = days;

    // rama

    // totalA = moment();
    // totalB = moment();

    // totalA = moment(totalA).add(daysFueraRama, 'days');
    // totalA = moment(totalA).add(monthsFueraRama, 'months');
    // totalA = moment(totalA).add(yearsFueraRama, 'years');

    // years = totalA.diff(totalB, 'year');
    // totalB = moment(totalB).add(years, 'years');
    // months = totalA.diff(totalB, 'months');
    // totalB = moment(totalB).add(months, 'months');
    // days = totalA.diff(totalB, 'days');

    // this.totalExperienceWork.fueraRama.years = years;
    // this.totalExperienceWork.fueraRama.months = months;
    // this.totalExperienceWork.fueraRama.days = days;

    // const daysTotal = this.totalExperienceWork.fueraRama.days + this.totalExperienceWork.rama.days;

    // this.totalExperienceWork.total.days = (daysTotal > 31) ? (daysTotal - 31) : daysTotal;


    this.totalExperienceWork.total.msg = `${this.totalExperienceWork.total.years} ${this.ct.YEARS}  ${this.totalExperienceWork.total.months} ${this.ct.MONTHS} ${this.totalExperienceWork.total.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.rama.msg = `${this.totalExperienceWork.rama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.rama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.rama.days} ${this.ct.DAYS}`;
    this.totalExperienceWork.fueraRama.msg = `${this.totalExperienceWork.fueraRama.years} ${this.ct.YEARS}  ${this.totalExperienceWork.fueraRama.months} ${this.ct.MONTHS} ${this.totalExperienceWork.fueraRama.days} ${this.ct.DAYS}`;

  }


  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  private loadForm1() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        currentWork: new FormControl(false),
        job: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        company: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        sector: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        department: new FormControl('', [Validators.required]),
        municipality: new FormControl('', [Validators.required]),
        initDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        hasMoreExperienceCompany: new FormControl(false),
        applySameFile: new FormControl(false),
        docencia: new FormControl(false),
        catedra: new FormControl(''),
        idTipoExperienciaLaboral: new FormControl('', [Validators.required]),
      }
    );

    this.f.currentWork.valueChanges.subscribe(
      value => {
        this.f.endDate.clearValidators();
        if (!this.f.id.value) {
          this.f.endDate.setValue('');
        }
        if (value) {
          this.f.endDate.disable();
          this.f.endDate.setValue('');

        } else {
          this.f.endDate.enable();
          this.f.endDate.setValidators([Validators.required]);
        }
        this.showEndDate = !value;
        this.f.endDate.updateValueAndValidity();
      }
    );

    this.f.docencia.valueChanges.subscribe(
      value => {

        this.f.catedra.clearValidators();
        if (!this.f.id.value) {
          this.f.catedra.setValue('');
        }

        if (value) {
          this.f.catedra.enable();
          this.f.catedra.setValidators([Validators.required]);

          this.f.sector.setValue(this.sectorEducativo.id);
        } else {
          this.f.catedra.disable();
          this.f.catedra.setValue('');

          //this.f.sector.setValue('');
        }
        this.showCatedra = value;
        this.f.catedra.updateValueAndValidity();
        this.f.sector.updateValueAndValidity();
      }
    );

    this.f.hasMoreExperienceCompany.valueChanges.subscribe(
      value => {
        this.showFieldSameFile = value;
        this.f.applySameFile.setValue(true);
      }
    );
    this.listenerControls();
  }

  private loadForm2() {
    this.form2 = this.fb.group(
      {
        id: new FormControl(''),
        currentWork: new FormControl(false),
        job: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        grade: new FormControl('', [Validators.required]),
        corporation: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        country: new FormControl('', [Validators.required]),
        department: new FormControl('', [Validators.required]),
        municipality: new FormControl('', [Validators.required]),
        numberResolution: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        expireDate: new FormControl(''),
        nameCuality: new FormControl(''),
        initDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        hasMoreExperienceCompany: new FormControl(false),
        applySameFile: new FormControl(false),
      }
    );

    this.f2.currentWork.valueChanges.subscribe(
      value => {
        this.f2.endDate.clearValidators();
        if (!this.f2.id.value) {
          this.f2.endDate.setValue('');
        }
        if (value) {
          this.f2.endDate.disable();
          this.f2.endDate.setValue('');
        } else {
          this.f2.endDate.enable();
          this.f2.endDate.setValidators([Validators.required]);
        }
        this.showEndDate2 = !value;
        this.f2.endDate.updateValueAndValidity();
      }
    );

    this.f2.hasMoreExperienceCompany.valueChanges.subscribe(
      value => {
        this.showFieldSameFile2 = value;
        this.f2.applySameFile.setValue(true);
      }
    );
    this.listenerControls2();
  }

  public async addJobFueraRama() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      if (this.f.hasMoreExperienceCompany.value) {
        if (this.lstExperiencesEmp1.length === 0) {
          this.submit = false;
          return;
        } else {
          this.submit = true;
        }
      } else {
        this.submit = true;
      }
    } else {
      this.submit = false;
      this.f.requiredfile.markAsTouched();
      return;
    }

    if (this.f.currentWork.value) {
      this.f.endDate.setValue(new Date());
    }
    const newJob: WorkExperience = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      esTrabajoActual: this.f.currentWork.value ? 1 : 0,
      cargo: this.f.job.value,
      entidad: this.f.company.value,
      idCiudad: this.f.municipality.value,
      idSectorExperiencia: this.f.sector.value,
      fechaIngreso: this.f.initDate.value,
      fechaRetiro: this.f.endDate.value,
      soporte: this.elementCurrent.soporte,
      esTrabajoDocencia: this.f.docencia.value ? 1 : 0,
      catedra: this.f.catedra.value,
      idTipoExperienciaLaboral: this.f.idTipoExperienciaLaboral.value,
    };

    /* if (this.TOTAL_REGISTROS_CURRENT === this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS || this.TOTAL_REGISTROS_CURRENT >= this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS) {
      this.alertService.message(this.ct.MSG_NUMBER_MAX_EXCEEDED_EXPERIENCE, TYPES.ERROR);
      this.submit = false;
      return;
    } */

    const totalExperiencias = this.updateData.length + this.updateData2.length;
    if ((totalExperiencias === this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS || totalExperiencias >= this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS) && !this.f.id.value) {
      this.alertService.message(this.ct.MSG_NUMBER_MAX_EXCEEDED_EXPERIENCE, TYPES.ERROR);
      this.submit = false;
      return;
    }

    // validar las fechas con las demas experiencias
    if (!this.validateRangeDate(new Date(newJob.fechaIngreso), new Date(newJob.fechaRetiro), newJob.id)) {
      this.alertService.message(this.ct.DATES_INCORRECTS_VERIFY, TYPES.ERROR);
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
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.EXPERIENCIA_LABORAL, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.EXPERIENCIA_LABORAL,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newJob.soporte = documentFile.id;
    }

    /* valida si el check 'tiene mas experiencia en la empresa' esta activado */
    if (this.f.hasMoreExperienceCompany.value) {

      /* valida si el check 'aplicarMismoSoporte' esta activado */
      if (this.f.applySameFile.value) {

        if (this.lstExperiencesEmp1.length > 0) {
          this.lstExperiencesEmp1.forEach(async e => {
            // e.soporte = documentFile.id;
            e.soporte = newJob.soporte;
            try {
              await this.cvService.saveWorkExperience(e).toPromise()
                .then(res => {
                  this.loadData1().then(() => {
                    this.clearInputFile(this.inputFileViewFueraDeRama);
                    this.calculateTimeWork();
                  });
                })
                .catch(err => {
                  console.log('Error', err);
                  this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                    .finally(() => this.submit = false);
                });
            } catch (e) {
              console.log('Error', e);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            }
          });
        }
      } else {
        this.saveForm3();
      }
    }

    this.cvService.saveWorkExperience(newJob).toPromise()
      .then(res => {
        this.loadData1().then(() => {
          this.cleanForm(1);
          this.calculateTimeWork();
          this.clearInputFile(this.inputFileViewFueraDeRama);
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

  public async addJobDentroRama() {
    if (this.elementCurrent2.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent2.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form2.valid) {
      if (this.f2.hasMoreExperienceCompany.value) {
        if (this.lstExperiencesEmp2.length === 0) {
          this.submit = false;
          return;
        } else {
          this.submit = true;
        }
      } else {
        this.submit = true;
      }
    } else {
      this.submit = false;
      this.f2.requiredfile.markAsTouched();
      return;
    }
    if (this.f2.currentWork.value) {
      this.f2.endDate.setValue(new Date());
    }

    const newJob: WorkExperienceRama = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      esTrabajoActual: this.f2.currentWork.value ? 1 : 0,
      cargo: this.f2.job.value,
      grado: this.f2.grade.value,
      corporacion: this.f2.corporation.value,
      idCiudad: this.f2.municipality.value,
      resolucion: this.f2.numberResolution.value,
      fechaExpedicionResolucion: this.f2.expireDate.value ? this.f2.expireDate.value : null,
      calidadNombramiento: this.f2.nameCuality.value,
      fechaIngreso: this.f2.initDate.value,
      fechaRetiro: this.f2.endDate.value,
      soporte: this.elementCurrent2.soporte
    };


    const totalExperiencias = this.updateData.length + this.updateData2.length;
    if ((totalExperiencias === this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS || totalExperiencias >= this.CONTROL_TOTAL_REGISTROS_EXPERIENCIAS) && !this.f.id.value) {
      this.alertService.message(this.ct.MSG_NUMBER_MAX_EXCEEDED_EXPERIENCE, TYPES.ERROR);
      this.submit = false;
      return;
    }

    // validar las fechas con las demas experiencias
    if (!this.validateRangeDate(new Date(newJob.fechaIngreso), new Date(newJob.fechaRetiro), newJob.id)) {
      this.alertService.message(this.ct.DATES_INCORRECTS_VERIFY, TYPES.ERROR);
      this.submit = false;
      return;
    }

    if (this.f2.requiredfile.value) {
      if (this.elementCurrent2.soporte) {
        try {
          await this.fs.deleteFile(this.elementCurrent2.soporte).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (this.f2.requiredfile.value as FileInput).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.EXPERIENCIA_LABORAL, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.EXPERIENCIA_LABORAL,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newJob.soporte = documentFile.id;
    }

    /* valida si el check 'tiene mas experiencia en la empresa' esta activado */
    if (this.f2.hasMoreExperienceCompany.value) {
      /* valida si el check 'aplicarMismoSoporte' esta activado */
      if (this.f2.applySameFile.value) {
        if (this.lstExperiencesEmp2.length > 0) {
          this.lstExperiencesEmp2.forEach(async e => {
            e.soporte = newJob.soporte;
            try {
              await this.cvService.saveWorkExperienceRama(e).toPromise()
                .then(res => {
                  this.loadData2().then(() => {
                    this.clearInputFile(this.inputFileViewDentroDeRama);
                    this.calculateTimeWork();
                  });
                })
                .catch(err => {
                  console.log('Error', err);
                  this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                    .finally(() => this.submit = false);
                });
            } catch (e) {
              console.log('Error', e);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            }
          });
        }
      } else {
        this.saveForm4();
      }
    }

    this.cvService.saveWorkExperienceRama(newJob).toPromise()
      .then(res => {
        this.loadData2().then(() => {
          this.cleanForm(2);
          this.calculateTimeWork();
          this.clearInputFile(this.inputFileViewDentroDeRama);
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

  public async loadDepartments(pCountry: any, combo: number) {
    if (combo === 1) {
      this.form.patchValue({
        department: '',
        municipality: ''
      });
      this.lstMunicipalities = [];
      this.lstDepartments = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;
    } else if (combo === 2) {
      this.form2.patchValue({
        department: '',
        municipality: ''
      });
      this.lstMunicipalities2 = [];
      this.lstDepartments2 = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;
    }
  }

  public async loadMunicipalities(pDeparment: any, combo: number) {
    if (combo === 1) {
      this.form.patchValue({
        municipality: ''
      });
      this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
    } else if (combo === 2) {
      this.form2.patchValue({
        municipality: ''
      });
      this.lstMunicipalities2 = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
    }
  }

  public async edit(element: WorkExperience) {

    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();

    const municipalityTemp = (await this.commonService.getCityById(element.idCiudad).toPromise() as any).datos;
    const departmentTemp = (await this.commonService.getDepartmentById(municipalityTemp.idDepartamento).toPromise() as any).datos;
    this.lstDepartments = (await this.commonService.getDepartmentsByCountry(departmentTemp.idPais).toPromise() as any).departamentos;
    this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(municipalityTemp.idDepartamento).toPromise() as any).ciudades;

    if (this.elementCurrent.soporte) {
      this.elementCurrent.nameSoport = (await this.fs.getInformationFile(this.elementCurrent.soporte).toPromise() as any).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }

    // muestra el campo fecha de retiro si no es trabajo actual
    this.showEndDate = element.esTrabajoActual !== 1;

    this.showCatedra = element.esTrabajoDocencia === 1;

    // validar si activa el check de trabajo actual
    this.f.currentWork.setValue(false);
    this.f.currentWork.enable();
    if (this.updateData.length > 1) {
      for (let index = 0; index < this.updateData.length; index++) {
        const e = this.updateData[index];
        if (e.id !== element.id) {
          if (C.compareDate(new Date(element.fechaIngreso), new Date(e.fechaIngreso)) === -1) {
            this.f.currentWork.setValue(false);
            this.f.currentWork.disable();
            // this.showEndDate = element.esTrabajoActual != 1 ;
            break;
          }
        }
      }
    }

    if (this.updateData2.length > 1) {
      for (let index = 0; index < this.updateData2.length; index++) {
        const e = this.updateData2[index];
        if (e.id !== element.id) {
          if (C.compareDate(new Date(element.fechaIngreso), new Date(e.fechaIngreso)) === -1) {
            this.f.currentWork.setValue(false);
            this.f.currentWork.disable();
            break;
          }
        }
      }
    }

    this.form.patchValue({
      id: element.id,
      job: element.cargo,
      company: element.entidad,
      sector: element.idSectorExperiencia,
      country: departmentTemp.idPais,
      department: departmentTemp.id,
      municipality: element.idCiudad,
      initDate: element.fechaIngreso,
      endDate: element.fechaRetiro,
      currentWork: element.esTrabajoActual === 1 ? true : false,
      docencia: element.esTrabajoDocencia === 1 ? true : false,
      catedra: element.catedra,
      idTipoExperienciaLaboral: element.idTipoExperienciaLaboral
    });
    this.f.hasMoreExperienceCompany.setValue(false);
  }

  public delete(element: WorkExperience) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          if (this.elementCurrent.id === element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.cvService.deleteWorkExperience(element)
            .subscribe(() => {
              this.deleteSoport(element.soporte);
              this.clearInputFile(this.inputFileViewFueraDeRama);
              this.emitter.emitterCv({ progressBar: true });
              this.loadData1()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  this.calculateTimeWork();
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  public async edit2(element: WorkExperienceRama) {
    this.scrollTop();
    this.elementCurrent2 = C.cloneObject(element);

    const municipalityTemp = (await this.commonService.getCityById(element.idCiudad).toPromise() as any).datos;
    const departmentTemp = (await this.commonService.getDepartmentById(municipalityTemp.idDepartamento).toPromise() as any).datos;
    this.lstDepartments2 = (await this.commonService.getDepartmentsByCountry(departmentTemp.idPais).toPromise() as any).departamentos;
    this.lstMunicipalities2 = (await this.commonService.getCitiesByDepartment(municipalityTemp.idDepartamento).toPromise() as any).ciudades;

    if (this.elementCurrent2.soporte) {
      this.elementCurrent2.nameSoport = (await this.fs.getInformationFile(this.elementCurrent2.soporte).toPromise() as any).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f2.requiredfile, this.configFile.sizeFile);
    }

    // muestra el campo fecha de retiro si no es trabajo actual
    this.showEndDate2 = element.esTrabajoActual !== 1;

    // validar si activa el check de trabajo actual
    this.f2.currentWork.setValue(false);
    this.f2.currentWork.enable();

    if (this.updateData.length > 1) {
      for (let index = 0; index < this.updateData.length; index++) {
        const e = this.updateData[index];
        if (e.id !== element.id) {
          if (C.compareDate(new Date(element.fechaIngreso), new Date(e.fechaIngreso)) === -1) {
            this.f2.currentWork.setValue(false);
            this.f2.currentWork.disable();
            break;
          }
        }
      }
    }

    if (this.updateData2.length > 1) {
      for (let index = 0; index < this.updateData2.length; index++) {
        const e = this.updateData2[index];
        if (e.id !== element.id) {
          if (C.compareDate(new Date(element.fechaIngreso), new Date(e.fechaIngreso)) === -1) {
            this.f2.currentWork.setValue(false);
            this.f2.currentWork.disable();
            break;
          }
        }
      }
    }

    this.form2.patchValue({
      id: element.id,
      job: element.cargo,
      grade: element.grado,
      corporation: element.corporacion,
      country: departmentTemp.idPais,
      department: departmentTemp.id,
      municipality: element.idCiudad,
      numberResolution: element.resolucion,
      expireDate: element.fechaExpedicionResolucion,
      nameCuality: element.calidadNombramiento,
      initDate: element.fechaIngreso,
      endDate: element.fechaRetiro,
      currentWork: element.esTrabajoActual === 1 ? true : false,
    });
    this.f2.hasMoreExperienceCompany.setValue(false);
  }

  public delete2(element: WorkExperienceRama) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.clearInputFile(this.inputFileViewDentroDeRama);
          if (this.elementCurrent2.id === element.id) {
            this.formV2.resetForm();
            this.elementCurrent2 = {};
          }
          this.cvService.deleteWorkExperienceRama(element)
            .subscribe(ok => {
              this.deleteSoport(element.soporte);
              this.emitter.emitterCv({ progressBar: true });
              this.loadData2()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  this.calculateTimeWork();
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  public validateRangeDate(initDate: Date, endDate: Date, id?: string): boolean {
    const endDateString = this.commonService.getFormatDate(endDate);
    const initDateString = this.commonService.getFormatDate(initDate);

    if (endDateString === initDateString) {
      return false;
    }

    for (let i = 0; i < this.updateData.length; i++) {
      const e = this.updateData[i];
      if (id && id === e.id) {
        continue;
      }
      if (new Date(e.fechaIngreso) < initDate && new Date(e.fechaRetiro) > initDate) {
        return false;
      }
      if (new Date(e.fechaIngreso) < endDate && new Date(e.fechaRetiro) > endDate) {
        return false;
      }
      if (new Date(e.fechaIngreso) > initDate && new Date(e.fechaRetiro) < endDate) {
        return false;
      }
      if (this.commonService.getFormatDate(new Date(e.fechaIngreso)) === endDateString) {
        return false;
      }
    }

    for (let i = 0; i < this.updateData2.length; i++) {
      const e = this.updateData2[i];
      if (id && id === e.id) {
        continue;
      }
      if (new Date(e.fechaIngreso) < initDate && new Date(e.fechaRetiro) > initDate) {
        return false;
      }
      if (new Date(e.fechaIngreso) < endDate && new Date(e.fechaRetiro) > endDate) {
        return false;
      }
      if (new Date(e.fechaIngreso) > initDate && new Date(e.fechaRetiro) < endDate) {
        return false;
      }
      if (this.commonService.getFormatDate(new Date(e.fechaIngreso)) === endDateString) {
        return false;
      }
    }

    return true;
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

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fs.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public cleanForm(formNumber: number) {
    if (formNumber === 1) {
      this.formV.resetForm();
      this.elementCurrent = {};
      this.f.currentWork.setValue(false);
      this.f.currentWork.enable();
      C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
      this.showFieldSameFile = false;
      this.showFieldSupport = false;
      this.lstExperiencesEmp1 = [];
      this.submit3 = false;
      this.showCatedra = false;
      this.updateDataForm3();

      this.clearInputFile(this.inputFileViewFueraDeRama);
    } else if (formNumber === 2) {
      this.formV2.resetForm();
      this.elementCurrent2 = {};
      this.f2.currentWork.setValue(false);
      this.f2.currentWork.enable();
      C.setValidatorFile(true, this.f2.requiredfile, this.configFile.sizeFile);
      this.showFieldSameFile2 = false;
      this.showFieldSupport2 = false;
      this.lstExperiencesEmp2 = [];
      this.submit4 = false;
      this.updateDataForm4();
      this.clearInputFile(this.inputFileViewDentroDeRama);
    } else if (formNumber === 3) {
      this.submit3 = false;
      this.dialogRef1.close();
      this.formV3.resetForm();
    } else if (formNumber === 4) {
      this.submit4 = false;
      this.dialogRef2.close();
      this.formV4.resetForm();
    }

  }

  public deleteFileView(soport: number) {
    if (soport === 1) {
      this.elementCurrent.soporte = null;
      C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
      this.f.requiredfile.setValue(null);
    } else if (soport === 2) {
      this.elementCurrent2.soporte = null;
      C.setValidatorFile(true, this.f2.requiredfile, this.configFile.sizeFile);
      this.f2.requiredfile.setValue(null);
    }
  }

  /* Métodos para Experiencia laboral fuera de la rama */
  public listenerControls() {
    this.f.applySameFile.valueChanges.subscribe(
      value => {
        this.showFieldSupport = !value;
        if (value) {
          // this.showFieldSupport = !value;
          this.f3.idSupportAux.clearValidators();
          this.f3.idSupportAux.markAsTouched();
          C.setValidatorFile(false, this.f3.idSupportAux, this.configFile.sizeFile);
          this.f3.idSupportAux.setValue(undefined);
          this.f3.idSupportAux.disable();
        } else {
          this.f3.idSupportAux.enable();
          C.setValidatorFile(true, this.f3.idSupportAux, this.configFile.sizeFile);
        }
        this.f3.idSupportAux.updateValueAndValidity();
      }
    );
  }

  public loadForm3() {
    this.form3 = this.fb.group(
      {
        id: new FormControl(''),
        jobAux: new FormControl('', [Validators.required]),
        initDateAux: new FormControl('', [Validators.required]),
        endDateAux: new FormControl('', [Validators.required]),
        idSupportAux: new FormControl(undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)])
      }
    );
    this.listenerControls();
  }

  get f3() {
    return this.form3.controls;
  }

  public openDialog1() {
    if (!this.form.valid) {
      this.form.updateValueAndValidity();
    } else if (this.form.valid) {
      this.dialogRef1 = this.dialogService.open(this.dialog1);
      this.dialogRef1.disableClose = true;
      this.dialogRef1.addPanelClass(['col-sm-12', 'col-md-8']);
      this.dialogRef1.afterClosed().subscribe(result => {
        if (result !== undefined) {
          if (result === 'yes') {
          } else if (result === 'no') {
          }
        }
      });
    }
  }

  public addForm3() {

    if (this.form3.valid) {
      this.submit3 = true;
    } else {
      this.submit3 = false;
      this.f3.idSupportAux.markAsTouched();
      return;
    }

    let file = null;
    if (!this.f.applySameFile.value) {
      file = (this.f3.idSupportAux.value as FileInput).files[0];
    } else {
      file = undefined;
    }


    const newJob: WorkExperience = {
      id: this.f3.id.value ? this.f3.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      // esTrabajoActual: this.f.currentWork.value ? 1 : 0,
      esTrabajoActual: 0,
      entidad: this.f.company.value,
      idSectorExperiencia: this.f.sector.value,
      idCiudad: this.f.municipality.value,
      cargo: this.f3.jobAux.value,
      fechaIngreso: this.f3.initDateAux.value,
      fechaRetiro: this.f3.endDateAux.value,
      soporte: this.f3.idSupportAux.value,
      archivoSoporte: file,
      esTrabajoDocencia: this.f.docencia.value ? 1 : 0,
      catedra: this.f.catedra.value,
      idTipoExperienciaLaboral: this.f.idTipoExperienciaLaboral.value,
      // soporte: this.f.applySameFile.value ? this.f.requiredfile.value : this.f3.idSupportAux.value
    };

    // validar las fechas con las demas experiencias
    if (!this.validateRangeDate(new Date(newJob.fechaIngreso), new Date(newJob.fechaRetiro), newJob.id)) {
      this.alertService.message(this.ct.DATES_INCORRECTS_VERIFY, TYPES.ERROR);
      this.submit = false;
      this.submit3 = false;
      return;
    }

    this.lstExperiencesEmp1.push(newJob);
    this.updateDataForm3();
    this.cleanForm(3);
    this.submit3 = false;
  }

  private updateDataForm3() {

    if (this.lstExperiencesEmp1.length > 0) {
      this.f.applySameFile.disable();
    } else {
      this.f.applySameFile.enable();
    }
    this.f.applySameFile.updateValueAndValidity();

    this.dataSourceEmpresa1.data = this.lstExperiencesEmp1;
  }

  public async saveForm3() {
    if (this.lstExperiencesEmp1.length > 0) {
      this.lstExperiencesEmp1.forEach(async e => {
        const file = e.archivoSoporte;
        const params = {
          NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.EXPERIENCIA_LABORAL, documentsType.SOPORTE, this.commonService.getDateString()),
          Modulo: modulesSoports.EXPERIENCIA_LABORAL,
          NombreAuxiliar: file.name,
          idUsuarioModificacion: this.user.id
        };
        const documentFile: any = await this.fs.postFile(file, params).toPromise();
        e.soporte = documentFile.id;

        try {
          await this.cvService.saveWorkExperience(e).toPromise()
            .then(res => {
              this.loadData1().then(() => {
                this.calculateTimeWork();
              });
            })
            .catch(err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        } catch (e) {
          console.log('Error', e);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        }
      });
    }
  }

  public cleanForm3() {
    this.dialogRef1.close();
    this.formV3.resetForm();
    this.elementCurrent3 = {};
  }

  public deleteExperience1(element: WorkExperience) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }
    const index = this.lstExperiencesEmp1.indexOf(element);
    this.lstExperiencesEmp1.splice(index, 1);
    this.updateDataForm3();
  }

  /* Métodos para Experiencia laboral en la rama */
  public listenerControls2() {
    this.f2.applySameFile.valueChanges.subscribe(
      value => {
        this.showFieldSupport2 = !value;
        if (value) {
          // this.showFieldSupport = !value;
          this.f4.idSupportAux.clearValidators();
          this.f4.idSupportAux.markAsTouched();
          C.setValidatorFile(false, this.f4.idSupportAux, this.configFile.sizeFile);
          this.f4.idSupportAux.setValue(undefined);
          this.f4.idSupportAux.disable();
        } else {
          this.f4.idSupportAux.enable();
          C.setValidatorFile(true, this.f4.idSupportAux, this.configFile.sizeFile);
        }
        this.f4.idSupportAux.updateValueAndValidity();
      }
    );
  }

  public loadForm4() {
    this.form4 = this.fb.group(
      {
        id: new FormControl(''),
        jobAux: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        gradeAux: new FormControl('', [Validators.required]),
        numberResolutionAux: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        expireDateAux: new FormControl(''),
        nameCualityAux: new FormControl(''),
        initDateAux: new FormControl('', [Validators.required]),
        endDateAux: new FormControl('', [Validators.required]),
        idSupportAux: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
  }

  get f4() {
    return this.form4.controls;
  }

  public openDialog2() {
    if (!this.form2.valid) {
      this.form2.updateValueAndValidity();
    } else if (this.form2.valid) {
      this.dialogRef2 = this.dialogService.open(this.dialog2);
      this.dialogRef2.disableClose = true;
      this.dialogRef2.addPanelClass(['col-sm-12', 'col-md-8']);
      this.dialogRef2.afterClosed().subscribe(result => {
        if (result !== undefined) {
          if (result === 'yes') {
          } else if (result === 'no') {
          }
        }
      });
    }
  }

  public addForm4() {

    if (this.form4.valid) {
      this.submit4 = true;
    } else {
      this.submit4 = false;
      this.f4.idSupportAux.markAsTouched();
      return;
    }

    let file = null;
    if (!this.f2.applySameFile.value) {
      file = (this.f4.idSupportAux.value as FileInput).files[0];
    } else {
      file = undefined;
    }


    const newJob: WorkExperienceRama = {
      id: this.f4.id.value ? this.f4.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      esTrabajoActual: 0,
      corporacion: this.f2.corporation.value,
      idCiudad: this.f2.municipality.value,
      fechaExpedicionResolucion: this.f4.expireDateAux.value ? this.f4.expireDateAux.value : null,
      calidadNombramiento: this.f4.nameCualityAux.value,
      cargo: this.f4.jobAux.value,
      grado: this.f4.gradeAux.value,
      resolucion: this.f4.numberResolutionAux.value,
      fechaIngreso: this.f4.initDateAux.value,
      fechaRetiro: this.f4.endDateAux.value,
      soporte: this.f4.idSupportAux.value,
      archivoSoporte: file,
    };

    // validar las fechas con las demas experiencias
    if (!this.validateRangeDate(new Date(newJob.fechaIngreso), new Date(newJob.fechaRetiro), newJob.id)) {
      this.alertService.message(this.ct.DATES_INCORRECTS_VERIFY, TYPES.ERROR);
      this.submit = false;
      this.submit4 = false;
      return;
    }

    this.lstExperiencesEmp2.push(newJob);
    this.updateDataForm4();
    this.cleanForm(4);
    this.submit4 = false;
  }

  private updateDataForm4() {

    if (this.lstExperiencesEmp2.length > 0) {
      this.f2.applySameFile.disable();
    } else {
      this.f2.applySameFile.enable();
    }
    this.f2.applySameFile.updateValueAndValidity();

    this.dataSourceEmpresa2.data = this.lstExperiencesEmp2;
  }

  public async saveForm4() {
    if (this.lstExperiencesEmp2.length > 0) {
      this.lstExperiencesEmp2.forEach(async e => {
        const file = e.archivoSoporte;
        const params = {
          NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.EXPERIENCIA_LABORAL, documentsType.SOPORTE, this.commonService.getDateString()),
          Modulo: modulesSoports.EXPERIENCIA_LABORAL,
          NombreAuxiliar: file.name,
          idUsuarioModificacion: this.user.id
        };
        const documentFile: any = await this.fs.postFile(file, params).toPromise();
        e.soporte = documentFile.id;

        try {
          await this.cvService.saveWorkExperienceRama(e).toPromise()
            .then(res => {
              this.loadData2().then(() => {
                this.calculateTimeWork();
              });
            })
            .catch(err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        } catch (e) {
          console.log('Error', e);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        }
      });
    }
  }

  public deleteExperience2(element: WorkExperienceRama) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }
    const index = this.lstExperiencesEmp2.indexOf(element);
    this.lstExperiencesEmp2.splice(index, 1);
    this.updateDataForm4();
  }

}
