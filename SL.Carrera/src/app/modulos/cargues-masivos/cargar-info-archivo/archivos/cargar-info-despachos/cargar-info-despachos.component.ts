import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input, ElementRef, ɵConsole } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { EventEmitter } from '@angular/core';
import { Constants as C } from '@app/compartido/helpers/constants';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { FilesService } from '@app/core/servicios/files.service';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';

import { DatePipe } from '@angular/common';
import { configMsg } from '@app/compartido/helpers/enums';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import * as XLSX from 'xlsx';
import { CargarDespachoModel } from '@app/compartido/modelos/cargar-despacho-model';
import { Constants } from '@app/compartido/helpers/constants';

@Component({
  selector: 'app-cargar-info-despachos',
  templateUrl: './cargar-info-despachos.component.html',
  styleUrls: ['./cargar-info-despachos.component.scss']
})
export class CargarInfoDespachosComponent extends BaseController implements OnInit, AfterViewChecked {

  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' };
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;


  public displayedColumns: string[] = ['codigoDespacho', 'despacho', 'codigoMunicipio', 'sede', 'codigoSeccional', 'seccional', 'codigoEspecialidad', 'ordenDespacho', 'error'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public lstEscalafon: any[] = [];
  public elementCurrent: any = {};

  public showTable = false;
  public cargaRealizada = false;
  public showButtonExport = false;
  public matcher: any;

  public data: any[] = [];
  public lstDataAValidar: CargarDespachoModel[] = [];
  public lstDataValidos: CargarDespachoModel[] = [];
  public lstDataAll: CargarDespachoModel[] = [];
  public lstDataNoValidos: any[] = [];

  private user = this.commonService.getVar(configMsg.USER);

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;

  @Input() fileTypeName: string;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private convocatoryServices: ConvocatoriaService,
    private fs: FilesService,
    private cs: ConvocatoriaService,
    public datepipe: DatePipe,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;

    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngOnInit() {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });


    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.loadForm();
    this.loadExtensions();
    this.dataSource.data = [];
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadData() {
    this.dataSource.data = this.lstEscalafon;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idArchivoCargue: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async loadExtensions() {
    const exten = (await this.commonService.getMessageByName(configMsg.ALLOW_EXTENSIONS_UPLOAD_FILE_INFO).toPromise() as any).datos.valor as any;
    this.configFile.allowExtensions = exten;
    this.configFile.sizeFile = C.byteToMb(Number(this.commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  public onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = (evt.target) as DataTransfer;
    if (target.files.length !== 1) { throw new Error('Cannot use multiple files'); }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = ((XLSX.utils.sheet_to_json(ws, { header: 1 })) as any);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  public loadInfoFile(event) {
    if (event) {
      this.file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(this.file);
      fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        const data = new Uint8Array(this.arrayBuffer);
        const arr = new Array();

        // tslint:disable-next-line: triple-equals
        for (let i = 0; i != data.length; i++) { arr[i] = String.fromCharCode(data[i]); }
        const bstr = arr.join('');
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        this.lstDataAValidar = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        this.lstDataNoValidos = [];
        const lstDataValida = this.lstDataAValidar.filter(x => {
          let msgError = '';
          let existeError = false;

          if (Constants.validateData(x.codigoDespacho) == undefined) {
            msgError += ' - No existe el código de despacho';
            existeError = true;
          }

          if (Constants.validateData(x.despacho) == undefined) {
            msgError += ' - No existe el despacho';
            existeError = true;
          }

          if (Constants.validateData(x.codigoMunicipio) == undefined) {
            msgError += ' - No existe el código del municipio';
            existeError = true;
          }

          if (Constants.validateData(x.sede) == undefined) {
            msgError += ' - No existe la sede';
            existeError = true;
          }

          if (Constants.validateData(x.codigoSeccional) == undefined) {
            msgError += ' - No existe el código seccional';
            existeError = true;
          }

          if (Constants.validateData(x.seccional) == undefined) {
            msgError += ' - No existe el seccional';
            existeError = true;
          }

          if (Constants.validateData(x.codigoEspecialidad) == undefined) {
            msgError += ' - No existe el código especialidad';
            existeError = true;
          }

          if (Constants.validateData(x.ordenDespacho) == undefined) {
            msgError += ' - No existe el orden de despacho';
            existeError = true;
          }

          x.msgError = msgError;
          if (!existeError) {
            msgError = 'Exitoso';
            x.msgError = msgError;
            return true;
          } else {
            this.lstDataNoValidos.push(x);
            return false;
          }
        });

        this.dataSource.data = lstDataValida;
        this.lstDataAValidar = lstDataValida;        
        this.submit = false;
      };
    }
  }

  public saveInfoFile() {
    if (this.lstDataAValidar.length > 0) {
      this.alertService.comfirmation(this.ct.MSG_LOAD_INFO_CONFIRMATION, TYPES.INFO)
        .then(ok1 => {
          if (ok1.value) {
            this.alertService.loading();
            let contadorRegistro = 0;

            /* this.lstDataAValidar.forEach(async d => {
              const newDespachos: CargarDespachoModel = {
                idUsuarioModificacion: this.user.id,
                codigoDespacho: d.codigoDespacho.toString(),
                despacho: d.despacho,
                codigoMunicipio: d.codigoMunicipio,
                sede: d.sede,
                codigoSeccional: d.codigoSeccional,
                seccional: d.seccional,
                codigoEspecialidad: d.codigoEspecialidad,
                ordenDespacho: d.ordenDespacho,
                especialidad: ''       
              };              
                await this.cs.saveCargeDespachos(newDespachos)
                  .toPromise()
                  .catch(error => {
                    this.lstDataNoValidos.push(d);
                    //this.alertService.showError(error);
                  }).finally(() => {
                    contadorRegistro++;
                    if (contadorRegistro === this.lstDataAValidar.length) {
                      this.alertService.close();
                      this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                        .finally(() => {
                          this.submit = true;
                          this.cargaRealizada = true;
                          this.exportUnregisteredData(this.lstDataNoValidos);
                        });
                    }
                  });
            }); */

            const strJson = JSON.stringify(this.lstDataAValidar);       
            this.cs.saveCargeDespachosMasivos(btoa(strJson)).toPromise().then(respuesta =>{
            })
            .finally(() => {                       
                this.alertService.close();
                this.alertService.message(this.ct.MSG_CARGUE_EXITOSO, TYPES.SUCCES)
                  .finally(() => {
                    this.submit = true;
                    this.cargaRealizada = true;
                    this.exportUnregisteredData(this.lstDataNoValidos);
                  });              
            });



          } else {
            this.alertService.message(this.ct.MSG_ERROR_LOAD_INFO_FILE, TYPES.ERROR)
              .finally(() => {
                this.submit = true;
                this.cargaRealizada = true;
                this.exportUnregisteredData(this.lstDataNoValidos);
              });
          }
        });
    }
  }

  public exportUnregisteredData(lstNoValidos: any) {
    if (this.cargaRealizada) {
      this.dataSource.data = lstNoValidos;
      this.showButtonExport = true;
    }
  }


  public formatearValor(value: any) {
    return isNaN(value) ? value : parseFloat(value).toFixed(2);
  }

  public clean() {
    this.submit = false;
    this.formV.resetForm();
    this.lstDataAValidar = [];
    this.data = [];
    this.dataSource.data = [];

    this.clearInputFile(this.inputFileView);
  }

  public deletFeile() {
    this.f.idArchivoCargue.setValue(null);
    this.f.idArchivoCargue.markAsUntouched();
    this.lstDataAValidar = [];
    this.data = [];
    this.dataSource.data = [];
  }

  public deleteFile() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.idArchivoCargue, this.configFile.sizeFile);
    this.f.idArchivoCargue.setValue(null);
  }

}
