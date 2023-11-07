import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { EventEmitter } from '@angular/core';
import { Constants as C } from '@app/compartido/helpers/constants';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { FilesService } from '@app/core/servicios/files.service';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';

import { DatePipe } from '@angular/common';
import { configMsg } from '../../../../../compartido/helpers/enums';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import * as XLSX from 'xlsx';
import { forkJoin, Observable } from 'rxjs';
import { CargarEscalafonModel } from '@app/compartido/modelos/cargar-escalafon-modelo';
import { EscalafonRamaFecha } from '@app/compartido/modelos/escalafonRamaFecha';
import { Constants } from '../../../../../compartido/helpers/constants';



@Component({
  selector: 'app-cargar-info-escalafon',
  templateUrl: './cargar-info-escalafon.component.html',
  styleUrls: ['./cargar-info-escalafon.component.scss']
})
export class CargarInfoEscalafonComponent extends BaseController implements OnInit, AfterViewChecked {

  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' }; 
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;

  public displayedColumns: string[] = ['numDocumento', 'nombreCompleto', 'idSeccional', 'novedad', 'resolucion', 'fechaResolucion', 'codigoAlternoPerfil', 'despacho', 'orden', 'sede', 'fechaPosesion', 'fechaRetiro', 'radicadoSigobius', 'fechaRadicadoSigobius', 'fechaGrabacion', 'error'];
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
  public lstDataAValidar: CargarEscalafonModel[] = [];
  public lstDataValidos: CargarEscalafonModel[] = [];
  public lstDataAll: CargarEscalafonModel[] = [];
  public lstDataNoValidos: any[] = [];



  private user = this.commonService.getVar(configMsg.USER);


  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  // @Input('path') path: string;
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
        const lstDataValida= this.lstDataAValidar.filter(x =>{
          let msgError = '';
              let existeError = false;

              if (Constants.validateData(x.numDocumento) == undefined) {
                msgError += ' - No existe el documento';
                existeError = true;
              }
              
              if (Constants.validateData(x.nombreCompleto) == undefined) {
                msgError += ' - No existe el Nombre completo';
                existeError = true;
              }

              if (Constants.validateData(x.idSeccional) == undefined) {
                msgError += ' - No existe la seccional';
                existeError = true;
              }

              if (Constants.validateData(x.novedad) == undefined) {
                msgError += ' - No existe la novedad';
                existeError = true;
              }

              if (Constants.validateData(x.resolucion) == undefined) {
                msgError += ' - No existe la resoluccion';
                existeError = true;
              }
              
              if (Constants.validateData(x.codigoAlternoPerfil) == undefined) {
                msgError += ' - No existe el cargo';
                existeError = true;
              }      

              if (Constants.validateData(x.despacho) == undefined) {
                msgError += ' - No existe el despacho';
                existeError = true;
              }   

              if (Constants.validateData(x.sede) == undefined) {
                msgError += ' - No existe la sede';
                existeError = true;
              } 
              
              ///fechaResolucion
              if (Constants.validateData(x.anioFechaResolucion) == undefined) {
                msgError += ' - No existe fecha Resolucion';
                existeError = true;
              }
             
              if (Constants.validateData(x.mesFechaResolucion) == undefined) {
                msgError += '';
                existeError = true;
              }

              if (Constants.validateData(x.diaFechaResolucion) == undefined) {
                msgError += '';
                existeError = true;
              }

              ///fechaposesion
              if (Constants.validateData(x.anioFechaPosesion) == undefined) {
                msgError += ' - No existe la fecha posesion';
                existeError = true;
              }
             
              if (Constants.validateData(x.mesFechaPosesion) == undefined) {
                msgError += '';
                existeError = true;
              }

              if (Constants.validateData(x.diaFechaPosesion) == undefined) {
                msgError += '';
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
            let contadorRegistro = 0;
            const lstPost: Observable<any>[] = [];
            this.lstDataAValidar.forEach(async d => {              

              const newResultadoEscalafon: EscalafonRamaFecha = {
                id: undefined,
                idUsuarioModificacion: this.user.id,
                numDocumento: d.numDocumento,
                nombreCompleto: d.nombreCompleto,
                idSeccional: d.idSeccional,
                novedad: d.novedad,
                resolucion: d.resolucion,
                codigoAlternoPerfil: d.codigoAlternoPerfil,
                despacho: d.despacho,
                orden: d.orden,
                sede: d.sede,
                radicadoSigobius: d.radicadoSigobius,

                anioFechaResolucion: Number(d.anioFechaResolucion),
                mesFechaResolucion: Number(d.mesFechaResolucion),
                diaFechaResolucion: Number(d.diaFechaResolucion),

                anioFechaPosesion: Number(d.anioFechaPosesion) ? Number(d.anioFechaPosesion) : null,
                mesFechaPosesion: Number(d.mesFechaPosesion) ? Number(d.mesFechaPosesion) : null,
                diaFechaPosesion: Number(d.diaFechaPosesion) ? Number(d.diaFechaPosesion) : null,

                anioFechaRetiro: Number(d.anioFechaRetiro) ? Number(d.anioFechaRetiro) : null,
                mesFechaRetiro: Number(d.mesFechaRetiro) ? Number(d.mesFechaRetiro) : null,
                diaFechaRetiro: Number(d.diaFechaRetiro) ? Number(d.diaFechaRetiro) : null,

                anioFechaRadicadoSigobius: Number(d.anioFechaRadicadoSigobius) ? Number(d.anioFechaRadicadoSigobius) : null,
                mesFechaRadicadoSigobius: Number(d.mesFechaRadicadoSigobius) ? Number(d.mesFechaRadicadoSigobius) : null,
                diaFechaRadicadoSigobius: Number(d.diaFechaRadicadoSigobius) ? Number(d.diaFechaRadicadoSigobius) : null,

                anioFechaGrabacion: Number(d.anioFechaGrabacion) ? Number(d.anioFechaGrabacion) : null,
                mesFechaGrabacion: Number(d.mesFechaGrabacion) ? Number(d.mesFechaGrabacion) : null,
                diaFechaGrabacion: Number(d.diaFechaGrabacion) ? Number(d.diaFechaGrabacion) : null,

              };

              lstPost.push(this.cs.saveEscalafonRamaFechas(newResultadoEscalafon));
              /*try{              
              await this.cs.saveEscalafonRamaFechas(newResultadoEscalafon)
                .toPromise()
                .catch(error => {
                  this.lstDataNoValidos.push(d);
                  this.alertService.showError(error);
                }).finally(() => contadorRegistro++);             
                this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => {
                    this.submit = true;
                    this.cargaRealizada = true;
                    this.exportUnregisteredData(this.lstDataNoValidos);
                  });
                }catch (error) {
                  this.lstDataNoValidos.push(d);
                  console.log('error catch', error);
                  this.alertService.showError(error);
                }*/
            });   
            
            forkJoin(lstPost).subscribe({
              next: (res: any) => {                
                this.alertService.message(this.ct.MSG_CARGUE_EXITOSO, TYPES.SUCCES)
                  .finally(() => {
                    this.submit = true;
                    this.cargaRealizada = true;
                    this.exportUnregisteredData(this.lstDataNoValidos);
                  });
              },
              error: (error) => {            
                //this.lstDataNoValidos.push(d);                
                this.alertService.showError(error);
              }
            });
            
          }else {
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


  public getFechaResolucionAnioMesDia(element: any) {
    if (element.diaFechaResolucion && element.mesFechaResolucion && element.anioFechaResolucion) {
      const fechaResolucion = [
        element.diaFechaResolucion,
        element.mesFechaResolucion,
        element.anioFechaResolucion
      ].join('/');
      return fechaResolucion;
    } else {
      return '';
    }
  }

  public getFechaPosesionAnioMesDia(element: any) {
    if (element.diaFechaPosesion && element.mesFechaPosesion && element.anioFechaPosesion) {
      const fechaPosesion = [
        element.diaFechaPosesion,
        element.mesFechaPosesion,
        element.anioFechaPosesion
      ].join('/');
      return fechaPosesion;
    } else {
      return '';
    }
  }


  public getFechaRetiroAnioMesDia(element: any) {
    if (element.diaFechaRetiro && element.mesFechaRetiro && element.anioFechaRetiro) {
      const fechaRetiro = [
        element.diaFechaRetiro,
        element.mesFechaRetiro,
        element.anioFechaRetiro
      ].join('/');
      return fechaRetiro;
    } else {
      return '';
    }
  }

  public getFechaRadicadoAnioMesDia(element: any) {
    if (element.diaFechaRadicadoSigobius && element.mesFechaRadicadoSigobius && element.anioFechaRadicadoSigobius) {
      const fechaRadicado = [
        element.diaFechaRadicadoSigobius,
        element.mesFechaRadicadoSigobius,
        element.anioFechaRadicadoSigobius
      ].join('/');
      return fechaRadicado;
    } else {
      return '';
    }
  }

  public getFechaGrabacionAnioMesDia(element: any) {
    if (element.diaFechaGrabacion && element.mesFechaGrabacion && element.anioFechaGrabacion) {
      const fechaRadicado = [
        element.diaFechaGrabacion,
        element.mesFechaGrabacion,
        element.anioFechaGrabacion
      ].join('/');
      return fechaRadicado;
    } else {
      return '';
    }
  }


  public deleteFile() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.idArchivoCargue, this.configFile.sizeFile);
    this.f.idArchivoCargue.setValue(null);
  }
}
