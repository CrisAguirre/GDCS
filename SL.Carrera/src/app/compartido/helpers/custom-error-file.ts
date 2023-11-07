import { ErrorStateMatcher } from "@angular/material";
import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

export class CustomErrorFile implements ErrorStateMatcher {

    private ext: string[];
    private sizeFile: number;
    private translate:CustomTranslateService;
    constructor(ext: string[], sizeFile: number, translate: CustomTranslateService) {
        this.ext = ext;
        this.sizeFile = sizeFile;
        this.translate = translate;
    }

    public isErrorState(control: FormControl, _: NgForm | FormGroupDirective): boolean {
        if (control && this.validateRequired(control)) {
            return true;
        }
        else if (control && control.value && control.value._fileNames && this.validateSize(control)) {
            return true;
        }
        else if (control && control.value && control.value._fileNames && this.containsExt(control.value._fileNames)) {
            control.setErrors({
                badExtension: this.translate.INVALID_FILE_FORMAT
            });
            return true;
        } else {
            return false;
        }
    }

    public validateRequired(control: any) {
        if (control.touched && control.hasError('required')) {
            return true
        }
        return false;
    }

    public validateSize(control: any) {
        if (control.hasError('maxContentSize')) {
            return true
        }
        return false;
    }

    public containsExt(value: string) {
        let endsWith = true;
        for (let index = 0; index < this.ext.length; index++) {
            const e = this.ext[index];
            if (value.endsWith(e)) {
                endsWith = false;
                break;
            }
        }
        return endsWith;
    }
}