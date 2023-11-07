import { Component, OnInit, Output, ViewChild, ChangeDetectorRef, AfterViewChecked, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Cronograma } from '@app/compartido/modelos/cronograma';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { ConvocatoryActivity } from '@app/compartido/modelos/convocatory-activity';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, stateConvocatoria, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { Constants as C } from '@app/compartido/helpers/constants';
import { FilesService } from '@app/core/servicios/files.service';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';
import { Configuration } from '@app/compartido/modelos/configuration';


@Component({
  selector: 'app-cronograma',
  templateUrl: './cronograma.component.html',
  styleUrls: ['./cronograma.component.scss'],
})
export class CronogramaComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;
  public displayedColumns: string[] = ['codeConvocatoria', 'activity', 'initDate', 'dateEnd', 'esProrroga', 'soport', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstActivities: ConvocatoryActivity[] = [];
  public submit = false;
  public elementCurrent: any = {};
  public updateData: Cronograma[] = [];
  public idOtraActividad: any;
  private user = this.commonService.getVar(configMsg.USER);
  public matcher: any;
  public sortedData: any;
  public minDate: Date;
  public convocatoryCurrent: any = {};
  public dataConvocatory: Convocatoria;
  public varModificarConvSuperAdmin: VariableAppModel;

  public idPeriodoInscripcionConvocatoria: Configuration;
  public estadoConvocatoria: string;

  public msg: MessageEmitter = {
    showProggressBar: true,
  }

  public idEmpresaT = null;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstCronogramasByEmpresa: Cronograma[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('divFechaInicial', { static: true }) divFechaInicial: ElementRef;

  constructor(
    private alertService: AlertService,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private ct: CustomTranslateService,
    private acs: AdministracionConvocatoriaService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
    private fileS: FilesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadUserData();
    this.loadData()
      .finally(() => {
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Cronograma, filter: string): boolean => {
      const dataCompare = [data.convocatoria, data.actividadaConvocatoria, this.commonService.getFormatDate(new Date(data.fechaInicial)), this.commonService.getFormatDate(new Date(data.fechaFinal)), (data.esProrroga == 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare, filter);
    }
  }

  public async loadUserData() {
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
      this.f.idEmpresa.setValidators([]);
      this.f.idEmpresa.updateValueAndValidity();
    }
  }

  public async loadCronogramaByEmpresa(pCompany: any) {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstCronogramasByEmpresa = (<any>await this.cs.getTodosCronogramaByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatories = <Convocatoria[]>(<any>await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;

    this.lstConvocatories.forEach(x => {
      x.mostrar = false;
      if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
        x.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        x.mostrar = true;
        //this.lstConvocatories.push(x);
      }
    });

    if (this.lstCronogramasByEmpresa.length > 0) {
      for (let i = 0; i < this.lstCronogramasByEmpresa.length; i++) {
        this.lstConvocatories.forEach(g => {
          if (this.lstCronogramasByEmpresa[i].idConvocatoria === g.id) {
            this.lstCronogramasByEmpresa[i].convocatoria = g.nombreConvocatoria;
            return;
          }
        });
        this.lstActivities.forEach(g => {
          if (this.lstCronogramasByEmpresa[i].idActividadConvocatoria === g.id) {
            this.lstCronogramasByEmpresa[i].actividadaConvocatoria = this.translateField(g, 'actividadConvocatoria', this.lang) + (g.id === this.idOtraActividad ? ' (' + this.lstCronogramasByEmpresa[i].otroActividadConvocatoria + ')' : '');
            const c = this.lstConvocatories.find(x => x.id === this.lstCronogramasByEmpresa[i].idConvocatoria);
            if (c) {
              this.lstCronogramasByEmpresa[i].mostrarBtns = c.mostrar;
            }
            return;
          }
        });
      }
    }

    this.lstCronogramasByEmpresa.sort((a: Cronograma, b: Cronograma) => {
      return (a.convocatoria > b.convocatoria ? 1 : -1);
    });

    //this.dataSource.data = this.lstCronogramasByEmpresa.filter(x => x.registroActivo === 1);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'codeConvocatoria': return this.compare(a.convocatoria, b.convocatoria, isAsc);
        case 'activity': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        case 'initDate': return this.compare(a.tipoEtapa, b.tipoEtapa, isAsc);
        case 'dateEnd': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);
        case 'esProrroga': return this.compare(a.esProrroga, b.esProrroga, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;

    this.lstConvocatories = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise()).datos;
    } else {
      this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getConvocatorias().toPromise()).datos;
    }

    this.lstConvocatoriesAll.forEach(x => {
      x.mostrar = false;
      if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
        x.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        x.mostrar = true;
        this.lstConvocatories.push(x);
      }
    });
    // this.lstConvocatories = this.lstConvocatoriesAll.filter(x => x.mostrar);


    this.lstActivities = <ConvocatoryActivity[]>(<any>await this.acs.getActividadConvocatoria().toPromise()).datos;
    const o = this.lstActivities.find(x => x.actividadConvocatoria == 'Otro');
    this.idOtraActividad = o ? o.id : -1;

    this.idPeriodoInscripcionConvocatoria = (await this.commonService.getVarConfig(configMsg.ID_PERIODO_INSCRIPCION_CONVOCATORIA));
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idActividadConvocatoria: new FormControl('', [Validators.required]),
        otroActividadConvocatoria: new FormControl({ value: '', disabled: true }, [Validators.maxLength(500)]),
        fechaInicial: new FormControl('', [Validators.required]),
        fechaFinal: new FormControl('', [Validators.required]),
        esProrroga: new FormControl('0'),
        registroActivo: new FormControl('1'),
        idReferenciaProrroga: new FormControl(''),
        idSoporteProrroga: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
        idEmpresa: new FormControl('', [Validators.required]),
        fechaInicialMax: new FormControl(''),
        fechaFinalMax: new FormControl(''),
      }
    );
    this.f.idSoporteProrroga.disable();
    this.listenerControls();
  }

  public listenerControls() {
    this.form.controls.idActividadConvocatoria.valueChanges.subscribe(
      r => {
        this.form.controls.otroActividadConvocatoria.setValue('');
        this.form.controls.otroActividadConvocatoria.disable();
        this.lstActivities.forEach(e => {
          if (e.actividadConvocatoria === 'Otro' && e.id === r) {
            this.form.controls.otroActividadConvocatoria.enable();
            return;
          }
        });
      }
    );


    this.f.fechaInicial.valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.convocatoryCurrent.fechaInicialDynamic = val;
      }
    });

    this.f.fechaFinal.valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.convocatoryCurrent.fechaFinalDynamic = val;
      }
    });
  }

  get f() {
    return this.form.controls;
  }


  public async add() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
      // si no es prorroga valida que no este registrada esa actividad
      if (Number(this.f.esProrroga.value) === 0) {
        this.updateData.forEach(x => {
          if (!this.f.id || x.id !== this.f.id.value) {
            if (x.idActividadConvocatoria === this.f.idActividadConvocatoria.value) {
              let showMesg = true;
              if (this.f.idActividadConvocatoria.value === this.idPeriodoInscripcionConvocatoria.valor) {
                showMesg = false;
                /*  if (!this.validateRangeDate(new Date(this.f.fechaInicial.value), new Date(this.f.fechaFinal.value), (this.f.id ? this.f.id.value : undefined))) {
                   this.alertService.message(this.ct.FECHAS_INCORRECTAS_CRONOGRAMA, TYPES.ERROR);
                   this.submit = false;
                 } */
              }
              if (this.idOtraActividad === this.f.idActividadConvocatoria.value && this.f.otroActividadConvocatoria.value !== x.otroActividadConvocatoria) {
                showMesg = false;
              }
              if (x.idConvocatoria !== this.f.idConvocatoria.value) {
                showMesg = false;
              }
              if (showMesg) {
                this.alertService.message(this.ct.EXIST_ACTIVITY, TYPES.WARNING);
                this.submit = false;
                return;
              }
            }
          }
        });
      }

      // validar las fechas con los cronogramas
      if (!this.validateRangeDate(new Date(this.f.fechaInicial.value), new Date(this.f.fechaFinal.value), (this.f.id ? this.f.id.value : undefined))) {
        this.alertService.message(this.ct.FECHAS_INCORRECTAS_CRONOGRAMA, TYPES.ERROR);
        this.submit = false;
      }

      if (!this.submit) {
        return;
      }

    } else {
      // this.f.idSoporteProrroga.markAsTouched();
      this.submit = false;
      return;
    }

    if (this.idEmpresaT) {
      this.submit = true;
    } else if (this.f.idEmpresa.value) {
      this.idEmpresaT = this.f.idEmpresa.value;
    } else {
      this.submit = false;
      return;
    }

    const newRecord: Cronograma = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idActividadConvocatoria: this.f.idActividadConvocatoria.value,
      otroActividadConvocatoria: this.f.otroActividadConvocatoria.value,
      fechaInicial: this.f.fechaInicial.value,
      fechaFinal: this.f.fechaFinal.value,
      esProrroga: Number(this.f.esProrroga.value),
      registroActivo: Number(this.f.registroActivo.value),
      // idReferenciaProrroga: this.f.id && this.f.id.value !== '' ? this.f.idReferenciaProrroga.value : null,
      idReferenciaProrroga: null,
      idSoporteProrroga: this.f.id ? this.elementCurrent.idSoporteProrroga : null,
      idEmpresa: this.idEmpresaT
    };

    if (this.elementCurrent.id) {
      newRecord.idReferenciaProrroga = this.elementCurrent.idReferenciaProrroga;
    }
    console.log('ne', newRecord);

    if (this.f.idSoporteProrroga.value) {
      if (this.elementCurrent.idSoporteProrroga && this.elementCurrent.registroActivo == 1) {
        try {
          await this.fileS.deleteFile(this.elementCurrent.idSoporteProrroga).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.idSoporteProrroga.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.elementCurrent.convocatoria.replace(' ', ''), modulesSoports.CONVOCATORIA + C.SEPARATOR_FILE + modulesSoports.CRONOGRAMA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CRONOGRAMA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fileS.postFile(file, params).toPromise();
      newRecord.idSoporteProrroga = documentFile.id;
    }

    this.cs.saveCronograma(newRecord).toPromise()
      .then(ok => {

        if (!newRecord.id && this.elementCurrent.id) {
          this.cs.saveCronograma(this.elementCurrent).toPromise()
            .then(x => {
              this.loadDataAfterPost();
            })
            .catch(e => {
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        } else {
          this.loadDataAfterPost();
        }
      }).catch(e => {
        console.log(e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  private loadDataAfterPost() {
    this.loadDataConvocatorySelected({value: this.f.idConvocatoria.value}).then(() => {
      this.cleanForm();
      this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
        .finally(() => this.submit = false);
    });
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.f.id.setValue(undefined);
    this.f.idActividadConvocatoria.setValue('');
    this.f.otroActividadConvocatoria.setValue('');
    this.f.fechaInicial.setValue('');
    this.f.fechaFinal.setValue('');
    this.f.idSoporteProrroga.setValue(undefined);
    this.f.idSoporteProrroga.disable();
    C.setValidatorFile(false, this.f.idSoporteProrroga, this.configFile.sizeFile);
    this.f.id.updateValueAndValidity();
    this.f.idActividadConvocatoria.updateValueAndValidity();
    this.f.otroActividadConvocatoria.updateValueAndValidity();
    this.f.fechaInicial.updateValueAndValidity();
    this.f.fechaFinal.updateValueAndValidity();
    this.f.idSoporteProrroga.updateValueAndValidity();

    this.elementCurrent = {};
    this.f.idConvocatoria.enable();
    this.f.idActividadConvocatoria.enable();
    this.minDate = null;
  }

  public cleanAllForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.f.idSoporteProrroga.setValue(undefined);
    this.f.idConvocatoria.enable();
    this.f.idActividadConvocatoria.enable();
    C.setValidatorFile(false, this.f.idSoporteProrroga, this.configFile.sizeFile);
    this.minDate = null;
    this.f.idSoporteProrroga.disable();
    this.convocatoryCurrent = {};
  }

  public cleanTabla() {
    this.dataSource.data = []
  }

  public async edit(element: Cronograma) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.scrollTop();
    this.cleanForm();
    this.elementCurrent = C.cloneObject(element);
    this.convocatoryCurrent = <Convocatoria[]>(<any>await this.cs.getConvocatoriaById(element.idConvocatoria).toPromise()).datos;
    if (this.elementCurrent.esProrroga === 1) {
      this.f.idSoporteProrroga.enable();
    }

    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: element.idConvocatoria,
      idActividadConvocatoria: element.idActividadConvocatoria,
      otroActividadConvocatoria: element.otroActividadConvocatoria,
      fechaInicial: element.fechaInicial,
      fechaFinal: element.fechaFinal,
      esProrroga: element.esProrroga,
      registroActivo: element.registroActivo,
      idReferenciaProrroga: element.idReferenciaProrroga,
      idEmpresa: element.idEmpresa
      // idSoporteProrroga: this.elementCurrent.idSoporteProrroga,
      // idSoporteProrroga: element.idSoporteProrroga,
    });

    if (this.elementCurrent.esProrroga === 1) {
      // C.setValidatorFile(true, this.f.idSoporteProrroga, this.configFile.sizeFile);
      if (this.elementCurrent.idSoporteProrroga) {
        this.elementCurrent.infoSoporte = (<any>await this.fileS.getInformationFile(this.elementCurrent.idSoporteProrroga).toPromise()).datos.nombreAuxiliar;
        // C.setValidatorFile(false, this.f.idSoporteProrroga, this.configFile.sizeFile);
      }
    }
    // this.form.updateValueAndValidity();
  }

  public async prorroga(element: Cronograma) {
    this.cleanForm();
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.elementCurrent.registroActivo = 0;
    this.elementCurrent.idSoporteProrroga = undefined;
    this.elementCurrent.infoSoporte = undefined;
    this.f.idSoporteProrroga.enable();

    this.form.patchValue({
      id: undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: element.idConvocatoria,
      idActividadConvocatoria: element.idActividadConvocatoria,
      otroActividadConvocatoria: element.otroActividadConvocatoria,
      fechaInicial: element.fechaInicial,
      fechaFinal: element.fechaFinal,
      esProrroga: 1,
      registroActivo: 1,
      idReferenciaProrroga: element.id,
      // idSoporteProrroga: this.elementCurrent.idSoporteProrroga,
      // idSoporteProrroga: element.idSoporteProrroga,
    });


    this.form.controls.idConvocatoria.disable();
    this.form.controls.idActividadConvocatoria.disable();
    this.form.controls.otroActividadConvocatoria.disable();

    this.f.otroActividadConvocatoria.setValue(element.otroActividadConvocatoria);

    C.setValidatorFile(false, this.f.idSoporteProrroga, this.configFile.sizeFile);
    this.minDate = this.elementCurrent.fechaInicial;
  }

  public delete(element: Cronograma) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id === element.id) {
            this.cleanForm();
          }
          this.cs.deleteCronograma(element)
            .subscribe(o => {
              this.loadDataConvocatorySelected({value: this.f.idConvocatoria.value})
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });

            }, err => {
              console.log(err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });

  }

  public validateRangeDate(initDate: Date, endDate: Date, idCronograma?: string): boolean {

    const endDateString = this.commonService.getFormatDate(endDate);
    const initDateString = this.commonService.getFormatDate(initDate);

    // if (endDateString == initDateString) {
    //   return true;
    // }

    for (let i = 0; i < this.updateData.length; i++) {
      const e = this.updateData[i];

      if (this.f.idConvocatoria && this.f.idConvocatoria.value !== e.idConvocatoria) {
        continue;
      }

      // if (idCronograma && idCronograma === e.id || this.f.idActividadConvocatoria.value === e.idActividadConvocatoria) {
      if (idCronograma && idCronograma === e.id) {
        continue;
      }
      if (new Date(e.fechaInicial) < initDate && new Date(e.fechaFinal) > initDate) {
        return false;
      }
      if (new Date(e.fechaInicial) < endDate && new Date(e.fechaFinal) > endDate) {
        return false;
      }
      if (new Date(e.fechaInicial) > initDate && new Date(e.fechaFinal) < endDate) {
        return false;
      }
      if (this.commonService.getFormatDate(new Date(e.fechaInicial)) === endDateString) {
        return false;
      }
    }
    return true;
  }

  public deleteFileView() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.elementCurrent.idSoporteProrroga = null;
    C.setValidatorFile(false, this.f.idSoporteProrroga, this.configFile.sizeFile);
    this.f.idSoporteProrroga.setValue(null);

  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fileS.downloadFile(id).subscribe(
      res => {
        const blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public async loadDataConvocatorySelected(event) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.convocatoryCurrent = <Convocatoria>(<any>await this.cs.getConvocatoriaById(event.value).toPromise()).datos;
    this.convocatoryCurrent.fechaInicialDynamic = this.convocatoryCurrent.fechaInicial;
    this.convocatoryCurrent.fechaFinalDynamic = this.convocatoryCurrent.fechaFinal;

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatories.find((x: any) => x.id === this.f.idConvocatoria.value);
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_INACTIVA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_PUBLICADA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.ACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.EN_BORRADOR) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_ENCOSTRUCION_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_CERRADA_MSG;
    } else {
      this.estadoConvocatoria = '';
    }

    this.updateData = (await this.cs.getTodosCronograma().toPromise() as any).datos as Cronograma[];
    this.updateData = this.updateData.filter(x => x.registroActivo === 1);
    if (this.updateData.length > 0) {

      if (this.idEmpresaT) {
        this.updateData = this.updateData.filter(x => x.idEmpresa === this.idEmpresaT);
      } else if (this.f.idEmpresa.value) {
        this.updateData = this.updateData.filter(x => x.idEmpresa === this.f.idEmpresa.value);
      }

      for (let i = 0; i < this.updateData.length; i++) {
        this.lstConvocatoriesAll.forEach(g => {
          if (this.updateData[i].idConvocatoria === g.id) {
            this.updateData[i].convocatoria = g.nombreConvocatoria;
            return;
          }
        });
        this.lstActivities.forEach(g => {
          if (this.updateData[i].idActividadConvocatoria === g.id) {
            this.updateData[i].actividadaConvocatoria = this.translateField(g, 'actividadConvocatoria', this.lang) + (g.id === this.idOtraActividad ? ' (' + this.updateData[i].otroActividadConvocatoria + ')' : '');
            const c = this.lstConvocatoriesAll.find(x => x.id === this.updateData[i].idConvocatoria);
            if (c) {
              this.updateData[i].mostrarBtns = c.mostrar;
            }
            return;
          }
        });
      }
    }
    this.updateData.sort((a: Cronograma, b: Cronograma) => {
      return (a.convocatoria > b.convocatoria ? 1 : -1);
    });

    this.dataSource.data = this.updateData.filter(x => x.registroActivo === 1 && x.idConvocatoria === this.convocatoryCurrent.id);

    if (!this.f.idEmpresa.value) {
      this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
      this.f.idEmpresa.updateValueAndValidity();
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

  }

  public modConvSA(convocatoria: Convocatoria) {
    if (convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA || convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      if (this.varModificarConvSuperAdmin.valor === '1' && this.isSuperAdmin(this.user)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

}
