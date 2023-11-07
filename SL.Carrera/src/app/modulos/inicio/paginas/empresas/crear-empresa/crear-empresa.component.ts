import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, modulesSoports, documentsType, PermisosAcciones } from '@app/compartido/helpers/enums';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Empresa } from '@app/compartido/modelos/empresa';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { FilesService } from '@app/core/servicios/files.service';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { Constants as C } from '@app/compartido/helpers/constants';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-crear-empresa',
  templateUrl: './crear-empresa.component.html',
  styleUrls: ['./crear-empresa.component.scss']
})
export class CrearEmpresaComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstCountries: any = [];
  public lstDepartments: any[] = [];
  public lstMunicipalities: any[];
  public lstTypesIdentification: any[];
  public lstEmpresas: Empresa[] = [];

  public country: any;
  public department: any;
  public elementCurrent: any = {};
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public matcher: any;

  public form: FormGroup;
  public displayedColumns: string[] = ['id', 'nombre', 'nit', 'correo', 'telefono', 'municipio', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fService: FilesService,
    private empresaService: EmpresaService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadExtensions();
    this.loadForm();
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadExtensions() {
    const exten = <any>(<any>await this.commonService.getMessageByName(configMsg.ALLOW_EXTENSIONS_SIGN).toPromise()).datos.valor;
    this.configFile.allowExtensions = exten;
    this.configFile.sizeFile = C.byteToMb(Number(this.commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        company: new FormControl('', [Validators.required]),
        nit: new FormControl('', [Validators.required]),
        slogan: new FormControl(''),
        email: new FormControl(''),
        telephone: new FormControl(''),
        municipality: new FormControl('', [Validators.required]),
        address: new FormControl(''),
        logo: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
        codAlterno: new FormControl(''),
        hasReference: new FormControl(''),
        idReference: new FormControl({ value: '', disabled: true }),

        /* Representante legal */
        managerName: new FormControl(''),
        typeIdentification: new FormControl(''),
        identification: new FormControl(''),
      }
    );
    this.listenerControls();
    this.country = new FormControl('');
    this.department = new FormControl('');
  }

  public listenerControls() {
    this.f.hasReference.valueChanges.subscribe(
      value => {
        this.f.idReference.clearValidators();
        if (value) {
          this.f.idReference.enable();
          this.f.idReference.setValidators([Validators.required]);
        } else {
          this.f.idReference.disable();
          this.f.idReference.setValidators([]);
        }
        this.f.idReference.updateValueAndValidity();
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async loadData() {
    this.lstCountries = (await this.commonService.getCountries().toPromise() as any).paises;
    this.lstTypesIdentification = <any>(<any>await this.commonService.getTypesIdentification().toPromise()).datos;

    this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    if (this.lstCompanies.length > 0) {
      this.lstCompanies.forEach(async e => {
        const munc = (await this.commonService.getCityById(e.idCiudad).toPromise() as any).datos;
        if (munc) {
          const depar = (await this.commonService.getDepartmentById(munc.idDepartamento).toPromise() as any).datos;
          e.ciudad = munc.ciudad;
          e.idPais = depar.idPais;
          e.idDepartamento = depar.id;
          e.departamento = depar.departamento;
        }
      });
    }
    this.dataSource.data = this.lstCompanies;
  }

  public async edit(element: Empresa) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);

    if (this.elementCurrent.logo) {
      try {
        this.elementCurrent.nombreLogo = (<any>await this.fService.getInformationFile(this.elementCurrent.logo).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.logo, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.logo = null;
        console.log(err);
      }
    }

    if (element.idReferencia) {
      this.f.hasReference.setValue(true);
      this.f.hasReference.enable();
      this.f.idReference.enable();
    } else {
      this.f.hasReference.setValue(false);
      this.f.idReference.disable();
      this.f.idReference.setValidators([]);
    }

    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      company: element.nombreEmpresa,
      nit: element.nit,
      slogan: element.sLogan,
      email: element.email,
      telephone: element.telefono,
      municipality: element.idCiudad,
      address: element.direccion,
      // logo: element.codigoAcuerdo,
      managerName: element.nombreRepresentante,
      typeIdentification: element.tipoDocumentoRepresentante,
      identification: element.documentoRepresentante,
      codAlterno: element.codAlterno,
      idReference: element.idReferencia
    });

    // let munic = (await this.commonService.getCityById(element.idCiudad).toPromise() as any).datos;
    const depart = (await this.commonService.getDepartmentById(this.elementCurrent.idDepartamento).toPromise() as any).datos;
    this.country.setValue(element.idPais);
    this.department.setValue(depart.id);
    this.lstDepartments = (await this.commonService.getDepartmentsByCountry(depart.idPais).toPromise() as any).departamentos;
    this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(depart.id).toPromise() as any).ciudades;
  }

  public async save() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.logo.markAsTouched();
      return;
    }

    this.alertService.loading();
    const newCompany: Empresa = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      nombreEmpresa: this.f.company.value,
      nit: this.f.nit.value,
      sLogan: this.f.slogan.value,
      logo: this.elementCurrent.logo,
      email: this.f.email.value,
      telefono: this.f.telephone.value,
      idCiudad: this.f.municipality.value,
      direccion: this.f.address.value,
      nombreRepresentante: this.f.managerName.value,
      tipoDocumentoRepresentante: this.f.typeIdentification.value ? this.f.typeIdentification.value : null,
      documentoRepresentante: this.f.identification.value,
      codAlterno: this.f.codAlterno.value,
      idReferencia: this.f.idReference.value ? this.f.idReference.value : null
    };

    if (this.f.logo.value) {
      if (this.elementCurrent.logo) {
        try {
          await this.fService.deleteFile(this.elementCurrent.logo).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.logo.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.OTRO, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.OTRO,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newCompany.logo = documentFile.id;
    }

    this.empresaService.saveEmpresa(newCompany).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Empresa) {
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
          this.empresaService.deleteEmpresa(element)
            .subscribe(ok => {
              this.deleteSoport(element.logo);
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


  public cleanForm() {
    this.formV.resetForm();
    this.country = new FormControl('');
    this.department = new FormControl('');
    this.elementCurrent = {};
    C.setValidatorFile(false, this.f.logo, this.configFile.sizeFile);
  }

  public async loadDepartments(pCountry: any) {
    this.department.setValue('');
    this.form.patchValue({
      municipality: ''
    });
    this.lstMunicipalities = [];
    this.lstDepartments = (await this.commonService.getDepartmentsByCountry(pCountry.value).toPromise() as any).departamentos;

  }

  public async loadMunicipalities(pDeparment: any) {
    this.form.patchValue({
      municipality: ''
    });
    this.lstMunicipalities = (await this.commonService.getCitiesByDepartment(pDeparment.value).toPromise() as any).ciudades;
  }

  public deleteFileView() {
    this.elementCurrent.logo = null;
    C.setValidatorFile(false, this.f.logo, this.configFile.sizeFile);
    this.f.logo.setValue(null);
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fService.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

}
