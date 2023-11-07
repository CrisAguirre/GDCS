import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { configMsg, stateConvocatoria, modulesSoports, documentsType } from '../../../../../compartido/helpers/enums';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { EscalafonRama } from '@app//compartido/modelos/escalafonRama';
import { Cargo } from '@app//compartido/modelos/cargo';
import { PerfilService } from '@app/core/servicios/perfil.service';
import { DatePipe } from '@angular/common';
import { Configuration } from '../../../../../compartido/modelos/configuration';
import { PerfilesConCodAlterno } from '../../../../../compartido/modelos/listar-cod-alterno-perfil';
import { Despachos } from '../../../../../compartido/modelos/despachos';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { element } from 'protractor';
import { CargoHumano } from '../../../../../compartido/modelos/cargo-humano';


@Component({
  selector: 'app-info-escalafon',
  templateUrl: './info-escalafon.component.html',
  styleUrls: ['./info-escalafon.component.scss']
})
export class InfoEscalafonComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['numDocumento', 'nombreCompleto', 'idSeccional', 'cargo', 'despacho', 'fechaPosesion', 'soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;
  public submit = false;

  public lstEscalafonRama: EscalafonRama[] = [];
  public lstCargo: Cargo[] = [];
  public lstCargoHumano: PerfilesConCodAlterno[] = [];
  public lstCargoHumanoAux: PerfilesConCodAlterno[] = [];

  public lstDespacho: Despachos[] = [];
  filteredOptions: Observable<Despachos[]>;

  filterCargos: Observable<Cargo[]>;

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];
  public company: any;
  public idEmpresaT = null;
  public vCargos: Configuration;
  public tipoCargo: number;

  public despachoSeleccionado: Despachos;


  public matcher: any;
  private user = this.commonService.getVar(configMsg.USER);

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('removableInput', { static: false }) inputFileView: ElementRef;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private convocatoryServices: ConvocatoriaService,
    private alertService: AlertService,
    public datepipe: DatePipe,
    private fs: FilesService,
    private perfilServices: PerfilService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;

    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngOnInit() {
    this.alertService.loading();
    //this.loadUserData();
    this.loadForm();
    this.loadData().then(() => {
      if (this.tipoCargo == 0) {
        this.filterCargos = this.f.codigoAlternoPerfil.valueChanges
          .pipe(
            startWith(''),
            map(value => value ? typeof value === 'string' ? value : value.cargo + value.codAlterno : undefined),
            map(cargo => cargo ? this._filter2(cargo) : this.lstCargo.slice())
          );
      } else if (this.tipoCargo == 1) {
        this.filterCargos = this.f.codigoAlternoPerfil.valueChanges
          .pipe(
            startWith(''),
            map(value => value ? typeof value === 'string' ? value : value.cargo + value.codigoAlterno : undefined),
            map(cargo => cargo ? this._filter3(cargo) : this.lstCargoHumano.slice())
          );
      }
      this.alertService.close();
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.filteredOptions = this.f.despacho.valueChanges
      .pipe(
        startWith(''),
        map(value => value ? typeof value === 'string' ? value : value.despacho + value.codigoDespacho : undefined),
        map(despacho => despacho ? this._filter(despacho) : this.lstDespacho.slice())
      );

  }

  displayFn(element: Despachos): string {
    return element && element.despacho ? element.codigoDespacho + ' - ' + element.despacho : '';
  }


  displayCg(element: Cargo): string {
    return element && element.cargo ? element.codAlterno + ' - ' + element.cargo : '';
  }

  displayCgH(element: PerfilesConCodAlterno): string {
    return element && element.cargo ? element.codigoAlterno + ' - ' + element.cargo : '';
  }

  private _filter(value: any): any[] {
    if (!value || value === '') {
      return this.lstDespacho;
    }
    const filterValue = value.toLowerCase();
    return this.lstDespacho.filter(e => {
      const source: string = (e.codigoDespacho + ' - ' + e.despacho);
      return source.toLowerCase().includes(filterValue);
      // e.despacho.toLowerCase().indexOf(filterValue) || e.codigoDespacho.toLowerCase().indexOf(filterValue)
    });
    // return this.lstDespacho.filter(e => e.despacho.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filter2(value: any): any[] {
    if (!value || value === '') {
      return this.lstCargo;
    }
    const filterValue = value.toLowerCase();
    return this.lstCargo.filter(e => {
      const source: string = (e.codAlterno + ' - ' + e.cargo);
      return source.toLowerCase().includes(filterValue);
    });
  }

  private _filter3(value: any): any[] {
    if (!value || value === '') {
      return this.lstCargoHumano;
    }
    const filterValue = value.toLowerCase();
    return this.lstCargoHumano.filter(e => {
      const source: string = (e.codigoAlterno + ' - ' + e.cargo);
      return source.toLowerCase().includes(filterValue);
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: EscalafonRama, b: EscalafonRama) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'numDocumento': return this.compare(a.numDocumento, b.numDocumento, isAsc);
        case 'nombreCompleto': return this.compare(a.nombreCompleto, b.nombreCompleto, isAsc);
        case 'idSeccional': return this.compare(a.idSeccional, b.idSeccional, isAsc);
        case 'cargo': return this.compare(a.codigoAlternoPerfil, b.codigoAlternoPerfil, isAsc);
        case 'despacho': return this.compare(a.despacho, b.despacho, isAsc);
        case 'fechaPosesion': return this.compare(a.fechaPosesion, b.fechaPosesion, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.vCargos = !this.vCargos ? await this.commonService.getVarConfig(configMsg.OBTENER_CARGOS_HUMANO) : this.vCargos;
    this.tipoCargo = Number(this.vCargos.valor);


    if ((!this.lstCargoHumano || this.lstCargoHumano.length == 0) && this.tipoCargo == 1) {
      this.lstCargoHumano = <PerfilesConCodAlterno[]>(<any>await this.perfilServices.getListarPerfilesCodAlterno().toPromise()).datos;
      this.lstCargoHumano = this.lstCargoHumano.filter(obj => obj.cargo && obj.cargo !== 'null');
    }

    if ((!this.lstCargo || this.lstCargo.length == 0) && this.tipoCargo == 0) {
      this.lstCargo = <Cargo[]>(<any>await this.perfilServices.getCargos().toPromise()).datos;
    }

    if (!this.lstDespacho || this.lstDespacho.length == 0) {
      this.lstDespacho = <Despachos[]>(<any>await this.convocatoryServices.getTodosDespachos().toPromise()).datos;
    }

    if (!this.lstEmpresa || this.lstEmpresa.length == 0) {
      this.lstEmpresa = <Empresa[]>(<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    }

    this.lstEscalafonRama = <EscalafonRama[]>(<any>await this.convocatoryServices.getEscalafonRama().toPromise()).datos;
    if (this.lstEscalafonRama.length > 0) {
      this.lstEscalafonRama.forEach(e => {

        this.lstEmpresa.forEach(g => {
          if (e.idSeccional === g.id) {
            e.nombreSeccional = g.nombreEmpresa;
            return;
          }
        });

        if (this.tipoCargo === 0) {

          this.lstCargo.forEach(g => {
            if (e.codigoAlternoPerfil === g.codAlterno) {
              e.nombreCargo = g.cargo;
              return;
            }
          });

        } else {
          this.lstCargoHumano.forEach(g => {
            if (e.codigoAlternoPerfil === g.codigoAlterno) {
              e.nombreCargo = g.cargo;
              return;
            }
          });
        }

        this.lstDespacho.forEach(g => {
          if (e.despacho === g.codigoDespacho) {
            e.nombreDespacho = g.despacho;
            return;
          }
        });


      });
    }

    this.dataSource.data = this.lstEscalafonRama;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        numDocumento: new FormControl('', [Validators.required]),
        nombreCompleto: new FormControl('', [Validators.required]),
        idSeccional: new FormControl('', [Validators.required]),
        novedad: new FormControl('', [Validators.required]),
        resolucion: new FormControl('', [Validators.required]),
        fechaResolucion: new FormControl('', [Validators.required]),
        codigoAlternoPerfil: new FormControl('', [Validators.required]),
        despacho: new FormControl('', [Validators.required]),
        orden: new FormControl(''),
        sede: new FormControl('', [Validators.required]),
        fechaPosesion: new FormControl('', [Validators.required]),
        fechaRetiro: new FormControl(''),
        radicadoSigobius: new FormControl(''),
        fechaRadicadoSigobius: new FormControl(''),
        fechaGrabacion: new FormControl(''),
        requiredfile: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
    //this.company = new FormControl('', [Validators.required]);
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: EscalafonRama) {
    this.elementCurrent = C.cloneObject(element);
    this.clearInputFile(this.inputFileView);
    this.scrollTop();
    if (this.elementCurrent.id && this.elementCurrent.idSoporte) {
      this.elementCurrent.nameTypeFileAux = (<any>await this.fs.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      numDocumento: element.numDocumento,
      nombreCompleto: element.nombreCompleto,
      idSeccional: element.idSeccional,
      novedad: element.novedad,
      resolucion: element.resolucion,
      fechaResolucion: element.fechaResolucion,
      codigoAlternoPerfil: element.codigoAlternoPerfil,
      despacho: element.despacho,
      orden: element.orden,
      sede: element.sede,
      fechaPosesion: element.fechaPosesion,
      fechaRetiro: element.fechaRetiro,
      radicadoSigobius: element.radicadoSigobius,
      fechaRadicadoSigobius: element.fechaRadicadoSigobius,
      fechaGrabacion: element.fechaGrabacion,
    });

    this.lstDespacho.forEach(e => {
      if (e.codigoDespacho === element.despacho) {
        this.f.despacho.setValue(e);
        return;
      }
    });

    if (this.tipoCargo == 0) {
      this.lstCargo.forEach(e => {
        if (e.codAlterno === element.codigoAlternoPerfil) {
          this.f.codigoAlternoPerfil.setValue(e);
          return;
        }
      });
    } else if (this.tipoCargo == 1) {
      this.lstCargoHumano.forEach(e => {
        if (e.codigoAlterno === element.codigoAlternoPerfil) {
          this.f.codigoAlternoPerfil.setValue(e);
          return;
        }
      });
    }

  }

  public async addEscalafonRama() {


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
      return;
    }

    let code = '';
    if (this.tipoCargo == 0) {
      code = this.f.codigoAlternoPerfil.value.codAlterno;
    } else if (this.tipoCargo == 1) {
      code = this.f.codigoAlternoPerfil.value.codigoAlterno;
    }

    const newEscalafonRama: EscalafonRama = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      numDocumento: this.f.numDocumento.value,
      nombreCompleto: this.f.nombreCompleto.value,
      idSeccional: this.f.idSeccional.value,
      novedad: this.f.novedad.value,
      resolucion: this.f.resolucion.value,
      fechaResolucion: this.f.fechaResolucion.value,
      codigoAlternoPerfil: code,
      despacho: undefined,
      orden: this.f.orden.value ? this.f.orden.value : null,
      sede: this.f.sede.value,
      fechaPosesion: this.f.fechaPosesion.value,
      fechaRetiro: this.f.fechaRetiro.value ? this.f.fechaRetiro.value : null,
      radicadoSigobius: this.f.radicadoSigobius.value ? this.f.radicadoSigobius.value : null,
      fechaRadicadoSigobius: this.f.fechaRadicadoSigobius.value ? this.f.fechaRadicadoSigobius.value : null,
      fechaGrabacion: this.f.fechaGrabacion.value ? this.f.fechaGrabacion.value : null,
      idSoporte: this.elementCurrent.idSoporte ? this.elementCurrent.idSoporte : null,
    };

    newEscalafonRama.despacho = this.despachoSeleccionado.codigoDespacho;

    if (this.f.requiredfile.value) {
      if (this.elementCurrent.idSoporte) {
        try {
          await this.fs.deleteFile(this.elementCurrent.idSoporte).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }

      const file = (<FileInput>this.f.requiredfile.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, newEscalafonRama.id, modulesSoports.CARGAR_ESCALAFON, documentsType.CARGAR_ESCALAFON, this.getDateString()),
        Modulo: modulesSoports.INSTRUCTIVOS,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newEscalafonRama.idSoporte = documentFile.id;
    }

    this.convocatoryServices.saveEscalafonRama(newEscalafonRama).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.elementCurrent = {};
          this.clearInputFile(this.inputFileView);
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: EscalafonRama) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convocatoryServices.deleteEscalafonRama(element)
            .subscribe(ok2 => {
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

  public deleteFileView() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }


  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fs.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
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

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

  public cleanForm() {
    this.formV.resetForm();
    this.clearInputFile(this.inputFileView);
    this.elementCurrent = {};
  }

}
