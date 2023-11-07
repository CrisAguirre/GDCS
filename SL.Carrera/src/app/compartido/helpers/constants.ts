import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from './format-datepicker';
import { Validators, ValidationErrors, FormGroup } from '@angular/forms';
import { FileValidator } from 'ngx-material-file-input';
import { MessageEmitter } from '../modelos/interfaces';
import { Vista } from '../modelos/vista';
import { ReportModel } from '../modelos/reportes/report-model';
import { TiposArchivos } from './enums';

export class Constants {

  public static KEY_USER_SESSION = "user_current";
  public static TOKEN = "jwt-token";
  public static KEY_SESSION_EXPIRED = "session_expired";

  public static VISIBLE = 1;
  public static INVISIBLE = 0;

  public static PATTERN_EMAIL_CTRL = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,5}";
  public static PATTERN_PASSWORD_CTRL = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";
  public static MIN_LENGTH_PASSWORD = 8;
  public static APPAREANCE = "fill";//standard, legacy, fill, outline

  public static SIZE_BITE = 1000000;
  public static PRIMARIA = "Primaria";
  public static BACHILLER = "Bachiller";
  public static ACCEPT = 1;
  public static NOT_ACCEPT = 0;
  public static replaceNamePortal = /{NombrePortal}/gi;
  public static SEPARATOR_FILE = "_";
  public static SEPARATOR_FILE_PATH = "/";
  public static FORMAT_DATE_VIEW = 'dd/MM/yyyy';
  public static FORMAT_TIME_VIEW = 'hh:mm a';
  public static FORMAT_DATETIME_VIEW = 'dd/MM/yyyy HH:mm:ss';
  public static replaceSpace = /\s+/g;

  public static MODELO_1 = 1;
  public static MODELO_2 = 2;

  public static tipoModelos = [
    {
      id: 1,
      name: 'Modelo 1',
      name_EN: 'Model 1'
    },
    {
      id: 2,
      name: 'Modelo 2',
      name_EN: 'Model 2'
    }
  ]

  public static range = (start, end) => Array.from({ length: (end - start) }, (v, k) => k + start);
  public static byteToMb = (mb) => (mb * Constants.SIZE_BITE);
  public static generateNameFile = (nameFile, identification, nameModule, typeDocument, dateString) => {
    const ext = nameFile.split('.');
    return [identification, nameModule, typeDocument, dateString + '' + (new Date().getTime()) + '.' + ext[ext.length - 1]].join(Constants.SEPARATOR_FILE);
  }

  public static compareDate = (date1: Date, date2: Date): number => {
    let d1 = new Date(date1); let d2 = new Date(date2);
    let same = d1.getTime() === d2.getTime();
    if (same) return 0;
    if (d1 > d2) return 1;
    if (d1 < d2) return -1;
  }

  public static getPathComplete = (vista: Vista): string => {
    let path: string = vista.nombreRuta;
    if (vista.referenciaPadre) {
      path = Constants.getPathComplete(vista.referenciaPadre) + ' / ' + path;
    }
    return path;
  }


  public static viewFile(pBlob) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //let blob: any = new Blob([pBlob], { type: 'application/pdf' });
      window.navigator.msSaveOrOpenBlob(pBlob, "output.pdf");
      return;
    }
    else {
      //let blob: any = new Blob([pBlob], { type: 'application/pdf; charset=utf-8' });
      const url = window.URL.createObjectURL(pBlob);
      window.open(url);
    }

    //window.location.href = res.url;
    //fileSaver.saveAs(blob, 'employees.json');
  }


  public static getTime(date?: Date) {
    return date != null ? date.getTime() : 0;
  }

  public static PROVIDER_DATEPICKER = [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ];

  public static setValidatorFile = (required: boolean, controll: any, sizeFile): void => {
    controll.clearValidators();
    const validations = [];
    if (required) {
      validations.push(Validators.required);
    }
    validations.push(FileValidator.maxContentSize(sizeFile));
    controll.setValidators(validations);
    controll.updateValueAndValidity();
  };

  public static getFormValidationErrors(form: any) {
    Object.keys(form.controls).forEach(key => {
      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }

  public static cloneObject(object: any) {
    //this.elementCurrent = { ...element };
    //this.elementCurrent = Object.create(element);
    return Object.assign({}, object);
  }

  public static cloneList(lst: any) {
    return Object.assign([], lst);
  }

  public static sendMessage(show: boolean, emmiter: any) {
    const msg: MessageEmitter = {
      showProggressBar: show,
    }
    emmiter.emit(msg);
  }

  /**
   * Retorna undefined si el objeto es valido de lo contrario retorna el mismo objeto
   * @param data Objeto a validar
   */
  public static validateData(data: any) {
    if (data !== undefined && data && data !== '') {
      return data;
    }
    return undefined;
  }

  /**
   * Retorna undefined si la lista no es valida de lo contrario retorna la misma lista
   * @param data Lista a validar
   */
  public static validateList(data: any[]) {
    if (data !== undefined && data && data.length > 0) {
      return data;
    }
    return undefined;
  }

  public static filterTable(dataCompare: any[], filter: string) {
    let text = dataCompare.join(' ');
    text = text.replace(Constants.replaceSpace, ' ');
    return text.toLowerCase().indexOf(filter.toLowerCase()) != -1;
  }

  public static updateControls(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).updateValueAndValidity();
    }
  }


  public static initReportModel() {
    const dataReport: ReportModel = {
      dataSetName: '',
      exportExtension: '',
      isHasParams: true,
      reportTitle: '',
      reportType: '',
      rptFileName: '',
      language: ''
    };

    return dataReport;
  }

  public static getExtensionFile(infoFile) {
    if (infoFile && infoFile.datos && infoFile.datos.nombreAuxiliar) {
      const extFile = '.' + String(infoFile.datos.nombreAuxiliar).split('.')[1];
      return extFile;
    }
    return '.pdf';
  }

  public static getMimeType(infoFile) {
    const extFile = Constants.getExtensionFile(infoFile);
    const tipoArchivo = TiposArchivos.find(t => t.extension === extFile);
    return tipoArchivo
  }

}