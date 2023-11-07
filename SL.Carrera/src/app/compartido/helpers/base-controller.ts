import { Constants } from './constants';
import { LangModel } from '../modelos/lang-model';
import { FormControl, AbstractControl } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { User } from '../modelos/user';
import { Configuration } from '../modelos/configuration';

export class BaseController {
    appearanceInput: string = Constants.APPAREANCE;
    // readonly maxSize = 104857600;
    configFile = { allowExtensions: '.pdf', sizeFile: 1000000 };
    formatDateView = Constants.FORMAT_DATE_VIEW;
    formatTimeView = Constants.FORMAT_TIME_VIEW;
    formatDatetimeView = Constants.FORMAT_DATETIME_VIEW;
    lang: string = '';//es el campo saber el lenguaje actual de la aplicacion

    public static lang: string;

    public applyFilter(event: Event, dataSource: any) {
        let filterValue = (event.target as HTMLInputElement).value;
        filterValue = filterValue.trim().toLowerCase();
        dataSource.filter = filterValue;
    }

    public compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    public openDialogFile(identifitor) {
        document.querySelector(identifitor).click();
    }

    public scrollTop() {
        const time = 10;
        let pos = window.pageYOffset;
        const rest = (pos / time)
        let scrollToTop = window.setInterval(() => {
            let posCurrent = window.pageYOffset;
            if (posCurrent > 0) {
                window.scrollTo(0, posCurrent - rest);
            } else {
                window.clearInterval(scrollToTop);
            }
        }, time);


    }


    public scrollToView(src: ElementRef) {
        // const element: HTMLElement = document.getElementById('idTipoTituloAcademicoView');
        const element: HTMLElement = src.nativeElement;
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    public isSelectedTable(elementCurrent, id: any) {
        if (elementCurrent && elementCurrent.id && id) {
            return elementCurrent.id == id;
        }
        return false;
    }

    public isSelectedTableCustom(elementCurrent, atri: string, id: any) {
        if (elementCurrent && elementCurrent[atri] && id) {
            return elementCurrent[atri] === id;
        }
        return false;
    }


    public print(data: any, title?: string) {
        console.log(title ? title : '>>', data);
    }

    public areEquals(value1: string, value2: string): boolean {
        if (!value1 || !value2) {
            return false;
        }
        value1 = this.replaceTildes(value1.replace(/\s/g, '').toUpperCase());
        value2 = this.replaceTildes(value2.replace(/\s/g, '').toUpperCase());

        if (value1 == value2) {
            return true;
        }
        return false;
    }

    public replaceTildes = (value: string): string => {
        value = value.normalize('NFD')
            .replace(/([aeio])\u0301|(u)[\u0301\u0308]/gi, "$1$2")
            .normalize();
        return value;
    };


    public areEqualsID(id: AbstractControl, id2: string): boolean {
        if ((id && id2 !== id.value) || !id) {
            return true;
        }
        return false;
    }

    public areEqualsValues(val1: string, val2: string): boolean {
        if (val1 && val2 && val1 === val2) {
            return true;
        }
        return false;
    }

    public cleanJSON(objJSON: any): any {
        for (let x in objJSON) {
            if (typeof objJSON[x] === "string") {
            }
        }
        return objJSON;
    }

    public translateField(record: any, nameField: string, lang: string) {
        try {
            if (lang === '') {
                return record[nameField];
            } else if (record[nameField + lang]) {
                return record[nameField + lang];
            } else {
                return record[nameField];
            }
        } catch (err) {
            return '';
        }
    }

    public static translateField(record: any, nameField: string, lang: string) {
        if (lang == '') {
            return record[nameField];
        } else if (record[nameField + lang]) {
            return record[nameField + lang];
        } else {
            return record[nameField];
        }
    }

    public clearInputFile(soportFile: any) {
        if (soportFile) {
            soportFile.clear(null);
        }
    }


    public downloadBlob(blob: Blob, nameFileDownload: string) {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const fileName = nameFileDownload;
        link.download = fileName;
        link.click();
    }

    public isSuperAdmin(user: User) {
        return Number(user.idRol) === 1;
    }

    public getVar(vars: Configuration[], name: string): Configuration {
        return vars.find(x => x.nombre === name);
    }

    public setJson(varConf: Configuration) {
        varConf.valorObj = JSON.parse(varConf.valor);
    }

    public areEqualsIdGuid(id1: string, id2: string): boolean {
        if (id1 && id2 && id1.toUpperCase() === id2.toUpperCase()) {
            return true;
        }
        return false;
    }

}
