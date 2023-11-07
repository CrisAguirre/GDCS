import { ErrorStateMatcher } from '@angular/material';

export class CustomErrorStateMatch implements ErrorStateMatcher {
    isErrorState(control: import("@angular/forms").FormControl, form: import("@angular/forms").FormGroupDirective | import("@angular/forms").NgForm): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));

    }
}