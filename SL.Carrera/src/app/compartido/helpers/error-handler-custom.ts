import { ErrorHandler } from '@angular/core';

export class ErrorHandlerCustom implements ErrorHandler {
    handleError(error: any): void {
        console.log('handleError', error);
    }

}