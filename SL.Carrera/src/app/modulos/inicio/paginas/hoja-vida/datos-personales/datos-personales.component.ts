import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Constants as C } from '@app/compartido/helpers/constants';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { DataPersonal } from '@app/compartido/modelos/data-personal';
import { DatePipe } from '@angular/common';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatAccordion } from '@angular/material';
import { FilesService } from '@app/core/servicios/files.service';
import { forkJoin, Observable } from 'rxjs';
import { Pais } from '@app/compartido/modelos/pais';
import { Discapacidad } from '../../../../../compartido/modelos/discapacidad';

@Component({
  selector: 'app-datos-personales',
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.scss'],
  //providers: C.PROVIDER_DATEPICKER
})
export class DatosPersonalesComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstClassMilitarCard: any[] = [];
  public lstNacionalities: any[] = [];
  public lstGenders: any[] = [];
  public lstSex: any[] = [];
  public lstBloodTypes: any[] = [];
  public lstMaritalStatus: any = [];
  public lstCountries: any = [];
  public lstDepartments: any[] = [];
  public lstMunicipalities: any[];
  public lstCountriesBirthdate: any = [];
  public lstDepartmentsBirthdate: any[] = [];
  public lstMunicipalitiesBirthdate: any[];
  public lstCountriesExpideDocument: any = [];
  public lstDepartmentsExpideDocument: any[] = [];
  public lstMunicipalitiesExpideDocument: any[];
  public lstTypesIdentification: any[];
  public lstRelationships: any[] = [];
  public lstDiscapacidades: Discapacidad[] = [];
  public lstYesNot = [];
  public country: any;
  public department: any;
  public countryBirthdate: any;
  public departmentBirthdate: any;
  public countryExpideDocument: any;
  public departmentExpideDocument: any;
  public form: FormGroup;
  public dataPersonal: any = {};
  private user = this.commonService.getVar(configMsg.USER);
  public matcher: any;
  public minDateBirthdate: Date = new Date();
  public maxDateBirthdate: Date = new Date();
  public now: Date = new Date();

  public submit = false;

  @ViewChild('accordion', { static: false }) panels: MatAccordion;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private alertService: AlertService,
    private cvService: CurriculumVitaeService,
    public datepipe: DatePipe,
    public emitter: EmitterService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fs: FilesService
  ) {
    super();
    this.lstYesNot = this.ct.lstYesOrNot();
    this.lstNacionalities = this.ct.lstNacionalities();
    this.lstClassMilitarCard = this.ct.lstClassMilitaryCard();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }


  ngOnInit(): void {
    this.alertService.loading();
    this.emitter.emitterCv({ showProgressLoading: true });
    this.minDateBirthdate.setMonth(new Date().getMonth() - (12 * this.commonService.getVar(configMsg.MIN_YEAR_REGISTER)));
    this.maxDateBirthdate.setMonth(new Date().getMonth() - (12 * this.commonService.getVar(configMsg.MAX_YEAR_REGISTER)));
    this.configFile.allowExtensions = this.commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(this.commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);

    this.loadForm();
    this.loadData().then(
      () => {
        //this.alertService.close();
      }, err => {
        console.log('Error :', err);
        this.alertService.close();
      })
      .finally(() => {
        this.emitter.emitterCv({ showProgressLoading: false });
        this.alertService.close();
      });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        firtsName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        secondName: new FormControl('', [Validators.maxLength(30)]),
        firtsLastname: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        secondLastname: new FormControl('', [Validators.maxLength(30)]),
        birthdate: new FormControl('', [Validators.required]),
        gender: new FormControl('', [Validators.required]),
        sex: new FormControl('', [Validators.required]),
        bloodType: new FormControl('', [Validators.required]),
        maritalStatus: new FormControl('', [Validators.required]),
        municipality: new FormControl('', [Validators.required]),
        municipalityBirthdate: new FormControl('', [Validators.required]),
        municipalityExpideDocument: new FormControl('', [Validators.required]),
        nacionality: new FormControl('', [Validators.required]),
        email: new FormControl({ value: this.user.email, disabled: true }, [Validators.required, Validators.email, Validators.pattern(C.PATTERN_EMAIL_CTRL), Validators.maxLength(50)]),
        celphone: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        address: new FormControl('', [Validators.required]),
        typeIdentification: new FormControl('', [Validators.required]),
        identification: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        classMilitarCard: new FormControl('', [Validators.required]),
        numberMilitaryCard: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        distric: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        nameEmergency: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        addressEmergency: new FormControl('', [Validators.required, Validators.maxLength(40)]),
        celEmergency: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        relationshipEmergencyContact: new FormControl('', [Validators.required]),
        fileIdentification: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        fileMilitaryCard: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        dateExpided: new FormControl('', [Validators.required]),

        tieneDiscapacidad: new FormControl(0, [Validators.required]),
        porcentajeDiscapacidad: new FormControl(''),
        idTipoDiscapacidad: new FormControl(''),
        discapacidad: new FormControl(''),

        tieneLibretaMilitar: new FormControl(0, [Validators.required])
      }

    );

    this.country = new FormControl('', Validators.required);
    this.department = new FormControl('', Validators.required);
    this.countryBirthdate = new FormControl('', Validators.required);
    this.departmentBirthdate = new FormControl('', Validators.required);
    this.countryExpideDocument = new FormControl('', Validators.required);
    this.departmentExpideDocument = new FormControl('', Validators.required);

    this.listenerControls();

    this.f.tieneDiscapacidad.setValue(0);
    this.f.tieneLibretaMilitar.setValue(0);
  }

  public async loadData() {
    this.submit = true;

    // TODO: Prueba de forkJoin
    const getCountries: Observable<any> = this.commonService.getCountries();
    const getMaritalStatus: Observable<any> = this.commonService.getMaritalStatus();
    const getGenders: Observable<any> = this.commonService.getGenders();
    const getSex: Observable<any> = this.commonService.getSex();
    const getBloodyTypes: Observable<any> = this.commonService.getBloodyTypes();
    const getTypesIdentification: Observable<any> = this.commonService.getTypesIdentification();
    const getRelationship: Observable<any> = this.commonService.getRelationship();
    const getDiscapacidad: Observable<any> = this.commonService.getDiscapacidad();

    // Se puede colocar animacion 
    forkJoin([getCountries, getMaritalStatus, getGenders, getSex, getBloodyTypes, getTypesIdentification, getRelationship, getDiscapacidad]).subscribe({
      next: ([responseCountries, respMarital, resGetGenders, rSex, rBloodyTypes, rTypesIdentification, rRelationship, rDiscapacidad]) => {
        this.lstCountries = responseCountries.paises;
        this.lstCountriesBirthdate = responseCountries.paises;
        this.lstCountriesExpideDocument = responseCountries.paises;
        this.lstMaritalStatus = respMarital.datos;
        this.lstGenders = resGetGenders.datos;
        this.lstSex = rSex.datos;
        this.lstBloodTypes = rBloodyTypes.datos;
        this.lstTypesIdentification = rTypesIdentification.datos;
        this.lstRelationships = rRelationship.datos;
        this.lstDiscapacidades = rDiscapacidad.datos;

        this.f.idTipoDiscapacidad.setValue(this.dataPersonal.idTipoDiscapacidad);
        this.f.discapacidad.setValue(this.dataPersonal.discapacidad);

        // Toda la logica, validar si la respuesta trae datos (undefined) o controlar con try catch
        // ocultar animacion
      },
      error: () => {
        console.log('ERROR');
      }
    });

    // this.lstGenders = (await this.commonService.getGenders().toPromise() as any).datos;
    // this.lstSex = (await this.commonService.getSex().toPromise() as any).datos;
    // this.lstBloodTypes = (await this.commonService.getBloodyTypes().toPromise() as any).datos;
    // this.lstTypesIdentification = (await this.commonService.getTypesIdentification().toPromise() as any).datos;
    // this.lstRelationships = (await this.commonService.getRelationship().toPromise() as any).datos;

    const updateData = (await this.cvService.getPersonalData(this.user.id).toPromise() as any).datos;
    if (updateData.length > 0) {
      this.dataPersonal = updateData[0] as DataPersonal;
      // guardamos en memoria la identificacion del usuario
      this.user.identification = this.dataPersonal.numeroDocumento;
      this.commonService.setVar(configMsg.USER, this.user);

      if (this.dataPersonal.claseLibretaMilitar) {
        this.f.tieneLibretaMilitar.setValue(1);
      }

      // cargar datos principales
      this.form.patchValue({
        firtsName: this.dataPersonal.primerNombre,
        secondName: this.dataPersonal.segundoNombre,
        firtsLastname: this.dataPersonal.primerApellido,
        secondLastname: this.dataPersonal.segundoApellido,
        birthdate: this.dataPersonal.fechaNacimiento,
        gender: this.dataPersonal.idGenero,
        sex: this.dataPersonal.idSexo,
        bloodType: this.dataPersonal.idGrupoSanguineo,
        maritalStatus: this.dataPersonal.idEstadoCivil,
        municipality: this.dataPersonal.idCiudadCorrespondencia,
        municipalityBirthdate: this.dataPersonal.idLugarNacimiento,
        municipalityExpideDocument: this.dataPersonal.idLugarExpedicionDocumento,
        nacionality: this.dataPersonal.nacionalidad,
        celphone: this.dataPersonal.telefono,
        address: this.dataPersonal.direccionCorrespondencia,
        typeIdentification: this.dataPersonal.idTipoDocumento,
        identification: this.dataPersonal.numeroDocumento,
        classMilitarCard: this.dataPersonal.claseLibretaMilitar,
        numberMilitaryCard: this.dataPersonal.numeroLibretaMilitar,
        distric: this.dataPersonal.distritoLibretaMilitar,
        nameEmergency: this.dataPersonal.nombreContactoEmergencia,
        addressEmergency: this.dataPersonal.direccionContactoEmergencia,
        celEmergency: this.dataPersonal.telefonoContactoEmergencia,
        relationshipEmergencyContact: this.dataPersonal.idParentesco,
        dateExpided: this.dataPersonal.fechaExpedicionDocumento,
        // fileIdentification:this.dataPersonal.soporteIdentificacion,
        // fileMilitaryCard:this.dataPersonal.soporteDeclaracion,

        tieneDiscapacidad: this.dataPersonal.tieneDiscapacidad,
        porcentajeDiscapacidad: this.dataPersonal.porcentajeDiscapacidad,
      });
    /* }

    
    if (updateData.length > 0) { */
      // cargar combox
      let munc1 = (await this.commonService.getCityById(this.dataPersonal.idCiudadCorrespondencia).toPromise() as any).datos;
      let depar1 = (await this.commonService.getDepartmentById(munc1.idDepartamento).toPromise() as any).datos;
      this.country.setValue(depar1.idPais);
      this.department.setValue(depar1.id);
      this.lstDepartments = (await this.commonService.getDepartmentsByCountry(depar1.idPais).toPromise() as any).departamentos;
      this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(munc1.idDepartamento).toPromise() as any).ciudades;

      const munc2 = (await this.commonService.getCityById(this.dataPersonal.idLugarExpedicionDocumento).toPromise() as any).datos;
      const depar2 = (await this.commonService.getDepartmentById(munc2.idDepartamento).toPromise() as any).datos;
      this.countryExpideDocument.setValue(depar2.idPais);
      this.departmentExpideDocument.setValue(depar2.id);
      this.lstDepartmentsExpideDocument = depar1.idPais == depar2.idPais ? this.lstDepartments : (await this.commonService.getDepartmentsByCountry(depar2.idPais).toPromise() as any).departamentos;
      this.lstMunicipalitiesExpideDocument = munc1.idDepartamento == munc2.idDepartamento ? this.lstMunicipalities : (await this.commonService.getCitiesByDepartment(munc2.idDepartamento).toPromise() as any).ciudades;

      const munc3 = (await this.commonService.getCityById(this.dataPersonal.idLugarNacimiento).toPromise() as any).datos;
      const depar3 = (await this.commonService.getDepartmentById(munc3.idDepartamento).toPromise() as any).datos;
      this.countryBirthdate.setValue(depar3.idPais);
      this.departmentBirthdate.setValue(depar3.id);
      this.lstDepartmentsBirthdate = depar1.idPais == depar3.idPais ? this.lstDepartments : depar2.idPais == depar3.idPais ? this.lstDepartmentsExpideDocument : (await this.commonService.getDepartmentsByCountry(depar3.idPais).toPromise() as any).departamentos;
      this.lstMunicipalitiesBirthdate = munc1.idDepartamento == munc3.idDepartamento ? this.lstMunicipalities : munc2.idDepartamento == munc3.idDepartamento ? this.lstMunicipalitiesExpideDocument : (await this.commonService.getCitiesByDepartment(munc3.idDepartamento).toPromise() as any).ciudades;

      try {
        if (this.dataPersonal.soporteIdentificacion) {
          this.dataPersonal.detailFileIdentification = (await this.fs.getInformationFile(this.dataPersonal.soporteIdentificacion).toPromise() as any).datos.nombreAuxiliar;
        }
        if (this.dataPersonal.soporteLibretaMilitar) {
          this.dataPersonal.detailFileMilitarydCard = (await this.fs.getInformationFile(this.dataPersonal.soporteLibretaMilitar).toPromise() as any).datos.nombreAuxiliar;
        }
      } catch (error) {
        console.log('Error', error);
      }


      if (this.dataPersonal.soporteIdentificacion) {
        C.setValidatorFile(false, this.f.fileIdentification, this.configFile.sizeFile);
      }
      if (this.dataPersonal.soporteLibretaMilitar) {
        C.setValidatorFile(false, this.f.fileMilitaryCard, this.configFile.sizeFile);
      }
    }

    this.f.sex.setValue(this.f.sex.value);
    this.submit = false;
  }


  public listenerIdTipoDiscapacidad() {
    this.f.porcentajeDiscapacidad.setValue('');
  }

  private listenerControls() {

    this.f.idTipoDiscapacidad.valueChanges.subscribe(
      r => {
        let limpiar = true;
        this.lstDiscapacidades.forEach(e => {
          if (e.esCampoOtro == 1 && e.id === r) {
            this.f.discapacidad.enable();
            limpiar = false;
            return;
          }
        });
        if (limpiar) {
          this.f.discapacidad.disable();
          this.f.discapacidad.setValue('');
        }
        this.f.discapacidad.updateValueAndValidity();
      }
    );

    this.f.sex.valueChanges.subscribe(
      r => {
        this.lstSex.forEach(g => {
          if (r == g.id) {
            if (g.codSexo.startsWith('M')) {
              this.f.classMilitarCard.clearValidators();
              this.f.classMilitarCard.setValidators([Validators.required]);

              this.f.numberMilitaryCard.clearValidators();
              this.f.numberMilitaryCard.setValidators([Validators.required, Validators.maxLength(15)]);

              this.f.distric.clearValidators();
              this.f.distric.setValidators([Validators.required, Validators.maxLength(30)]);

              if (!this.dataPersonal.soporteLibretaMilitar) {
                C.setValidatorFile(true, this.f.fileMilitaryCard, this.configFile.sizeFile);
              } else {
                C.setValidatorFile(false, this.f.fileMilitaryCard, this.configFile.sizeFile);
              }

              this.f.tieneLibretaMilitar.enable();
              this.f.tieneLibretaMilitar.updateValueAndValidity();

              this.f.classMilitarCard.updateValueAndValidity();
              this.f.numberMilitaryCard.updateValueAndValidity();
              this.f.distric.updateValueAndValidity();
            } else {
              this.f.tieneLibretaMilitar.setValue(0);
              this.f.tieneLibretaMilitar.disable();
              this.f.tieneLibretaMilitar.updateValueAndValidity();

              this.f.classMilitarCard.clearValidators();
              this.f.numberMilitaryCard.clearValidators();
              this.f.numberMilitaryCard.setValidators([Validators.maxLength(15)]);
              this.f.distric.clearValidators();
              this.f.distric.setValidators([Validators.maxLength(30)]);


              this.f.classMilitarCard.updateValueAndValidity();
              this.f.numberMilitaryCard.updateValueAndValidity();
              this.f.distric.updateValueAndValidity();

              C.setValidatorFile(false, this.f.fileMilitaryCard, this.configFile.sizeFile);
            }
          }
        });
      }, err => {
        console.log('Error', err);
      }
    );


    this.f.tieneDiscapacidad.valueChanges.subscribe(
      value => {
        if (value == 1) {
          this.f.idTipoDiscapacidad.enable();
          this.f.porcentajeDiscapacidad.enable();
          this.f.idTipoDiscapacidad.setValidators([Validators.required]);
          this.f.porcentajeDiscapacidad.setValidators([Validators.required]);

        } else {
          this.f.idTipoDiscapacidad.setValue(undefined);
          this.f.porcentajeDiscapacidad.setValue(undefined);

          this.f.idTipoDiscapacidad.disable();
          this.f.porcentajeDiscapacidad.disable();

          this.f.idTipoDiscapacidad.clearValidators();
          this.f.porcentajeDiscapacidad.clearValidators();

        }
        this.f.idTipoDiscapacidad.updateValueAndValidity();
        this.f.porcentajeDiscapacidad.updateValueAndValidity();
      }
    );

    this.f.tieneLibretaMilitar.valueChanges.subscribe(
      value => {
        if (value === 1) {
          this.f.classMilitarCard.enable();
          this.f.numberMilitaryCard.enable();
          this.f.distric.enable();
          this.f.fileMilitaryCard.enable();

          this.f.classMilitarCard.setValidators([Validators.required]);
          this.f.numberMilitaryCard.setValidators([Validators.required]);
          this.f.distric.setValidators([Validators.required]);
          // C.setValidatorFile(true, this.f.fileMilitaryCard, this.configFile.sizeFile);

          if (!this.dataPersonal.soporteLibretaMilitar) {
            C.setValidatorFile(true, this.f.fileMilitaryCard, this.configFile.sizeFile);
          } else {
            C.setValidatorFile(false, this.f.fileMilitaryCard, this.configFile.sizeFile);
          }

        } else {
          this.f.classMilitarCard.setValue(undefined);
          this.f.numberMilitaryCard.setValue(undefined);
          this.f.distric.setValue(undefined);
          this.f.fileMilitaryCard.setValue(undefined);

          this.f.classMilitarCard.disable();
          this.f.numberMilitaryCard.disable();
          this.f.distric.disable();
          this.f.fileMilitaryCard.disable();

          this.f.classMilitarCard.clearValidators();
          this.f.numberMilitaryCard.clearValidators();
          this.f.distric.clearValidators();
          this.f.fileMilitaryCard.markAsUntouched();
          C.setValidatorFile(false, this.f.fileMilitaryCard, this.configFile.sizeFile);

        }
        this.f.classMilitarCard.updateValueAndValidity();
        this.f.numberMilitaryCard.updateValueAndValidity();
        this.f.distric.updateValueAndValidity();
      }
    );

  }


  get f() {
    return this.form.controls;
  }

  public async loadDepartments(pCountry: any, combo: number) {
    if (combo == 1) {
      this.department.setValue('');
      this.form.patchValue({
        municipality: ''
      });
      this.lstMunicipalities = [];
      this.lstDepartments = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;
    } else if (combo == 2) {
      this.departmentBirthdate.setValue('');
      this.form.patchValue({
        municipalityBirthdate: ''
      });
      this.lstMunicipalitiesBirthdate = [];
      this.lstDepartmentsBirthdate = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;
    } else if (combo == 3) {
      this.departmentExpideDocument.setValue('');
      this.form.patchValue({
        municipalityExpideDocument: ''
      });
      this.lstMunicipalitiesExpideDocument = [];
      this.lstDepartmentsExpideDocument = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;
    }
  }

  public async loadMunicipalities(pDeparment: any, combo: number) {
    if (combo == 1) {
      this.form.patchValue({
        municipality: ''
      });
      this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
    } else if (combo == 2) {
      this.form.patchValue({
        municipalityBirthdate: ''
      });
      this.lstMunicipalitiesBirthdate = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
    } else if (combo == 3) {
      this.form.patchValue({
        municipalityExpideDocument: ''
      });
      this.lstMunicipalitiesExpideDocument = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
    }

  }

  public async save() {
    try {

      if (this.form.valid) {
        this.submit = true;
      } else {
        this.submit = false;
        this.f.fileIdentification.markAsTouched();
        this.f.fileMilitaryCard.markAsTouched();
        this.f.classMilitarCard.markAsTouched();
        this.panels.openAll();
        return;
      }

      this.alertService.loading();
      const dPersonal: DataPersonal = {
        idUsuarioModificacion: this.user.id,
        primerNombre: this.f.firtsName.value,
        segundoNombre: this.f.secondName.value,
        primerApellido: this.f.firtsLastname.value,
        segundoApellido: this.f.secondLastname.value,
        idGenero: this.f.gender.value,
        idSexo: this.f.sex.value,
        idTipoDocumento: this.f.typeIdentification.value,
        numeroDocumento: this.f.identification.value,
        idLugarExpedicionDocumento: this.f.municipalityExpideDocument.value,
        nacionalidad: this.f.nacionality.value,
        fechaNacimiento: this.f.birthdate.value,
        idLugarNacimiento: this.f.municipalityBirthdate.value,
        claseLibretaMilitar: this.f.classMilitarCard.value,
        numeroLibretaMilitar: this.f.numberMilitaryCard.value,
        distritoLibretaMilitar: this.f.distric.value,
        idGrupoSanguineo: this.f.bloodType.value,
        idEstadoCivil: this.f.maritalStatus.value,
        direccionCorrespondencia: this.f.address.value,
        idCiudadCorrespondencia: this.f.municipality.value,
        telefono: this.f.celphone.value,
        nombreContactoEmergencia: this.f.nameEmergency.value,
        direccionContactoEmergencia: this.f.addressEmergency.value,
        telefonoContactoEmergencia: this.f.celEmergency.value,
        idParentesco: this.f.relationshipEmergencyContact.value,
        id: this.dataPersonal && this.dataPersonal.id ? this.dataPersonal.id : '',
        soporteIdentificacion: this.dataPersonal.soporteIdentificacion,
        soporteLibretaMilitar: this.dataPersonal.soporteLibretaMilitar,
        fechaExpedicionDocumento: this.f.dateExpided.value,

        tieneDiscapacidad: this.f.tieneDiscapacidad.value,
        porcentajeDiscapacidad: Number(this.f.porcentajeDiscapacidad.value),
        idTipoDiscapacidad: this.f.idTipoDiscapacidad.value,

        discapacidad: this.f.discapacidad.value,
      };

      if (this.f.fileIdentification.value) {
        if (this.dataPersonal.soporteIdentificacion) {
          try {
            await this.fs.deleteFile(this.dataPersonal.soporteIdentificacion).toPromise();
          } catch (e) {
            console.log('Error', e);
          }
        }
        const file = (this.f.fileIdentification.value as FileInput).files[0];
        const params = {
          NombreSoporte: C.generateNameFile(file.name, dPersonal.numeroDocumento, modulesSoports.DATOS_PERSONALES, documentsType.DOCUMENTO_IDENTIDAD, this.getDateString()),
          Modulo: modulesSoports.DATOS_PERSONALES,
          NombreAuxiliar: file.name,
          idUsuarioModificacion: this.user.id
        };
        const documentFile: any = await this.fs.postFile(file, params).toPromise();
        dPersonal.soporteIdentificacion = documentFile.id;
      }

      if (this.f.fileMilitaryCard.value) {
        if (this.dataPersonal.soporteLibretaMilitar) {
          try {
            await this.fs.deleteFile(this.dataPersonal.soporteLibretaMilitar).toPromise();
            dPersonal.soporteLibretaMilitar = null;
          } catch (e) {
            console.log('Error', e);
          }
        }

        const file = (this.f.fileMilitaryCard.value as FileInput).files[0];
        const params = {
          NombreSoporte: C.generateNameFile(file.name, dPersonal.numeroDocumento, modulesSoports.DATOS_PERSONALES, documentsType.LIBRETA_MILITAR, this.getDateString()),
          Modulo: modulesSoports.DATOS_PERSONALES,
          NombreAuxiliar: file.name,
          idUsuarioModificacion: this.user.id
        };
        const militardFile: any = await this.fs.postFile(file, params).toPromise();
        dPersonal.soporteLibretaMilitar = militardFile.id;
      }

      this.cvService.saveDataPersonal(dPersonal)
        .toPromise()
        .then((res) => {
          this.loadData().then(loaded => {
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES);
            this.updateControllersForm(this.form);
            this.emitter.emitterCv({ progressBar: true });
            this.submit = false;
            this.panels.closeAll();
            this.scrollTop();
          });
        })
        .catch(err => {
          console.log('Error', err);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        })
        .finally(() => this.submit = false);
    } catch (error) {
      this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);

    }
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

  public updateControllersForm(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).updateValueAndValidity();
    }
  }

  public validateIdentification() {
    if (this.f.identification.value) {
      this.cvService.validateIdentification({ numeroDocumento: this.f.identification.value }, this.dataPersonal.id)
        .subscribe(
          (res: any) => {
            if (res.totalItems > 0) {
              this.alertService.message(this.ct.ERROR_DUPLICATE_IDENTIFICATION, TYPES.WARNING);
              this.f.identification.setValue('');
            }
          }, err => {
            console.log('Error', err);
          }
        );
    }
  }

  public formValidate(form: any): boolean {
    if (!form.valid) {
      return false;
    }
    return false;
  }

  public deleteFileView(soport: number) {
    if (soport == 1) {
      this.dataPersonal.soporteIdentificacion = null;
      C.setValidatorFile(true, this.f.fileIdentification, this.configFile.sizeFile);
      this.f.fileIdentification.setValue(null);
    } else if (soport == 2) {
      this.dataPersonal.soporteLibretaMilitar = null;
      this.f.fileMilitaryCard.setValue(null);
      this.f.sex.setValue(this.f.sex.value);
    }
  }


}
