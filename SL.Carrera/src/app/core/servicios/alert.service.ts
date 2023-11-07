import { Injectable, Input } from '@angular/core';
import swal from 'sweetalert2';
import * as $ from "jquery";
import { CustomTranslateService } from './custom-translate.service';

export enum TYPES {
  SUCCES = <any>{ title: "Éxito", icon: "success" },
  INFO = <any>{ title: "Información", icon: "info" },
  ERROR = <any>{ title: "Error", icon: "error" },
  WARNING = <any>{ title: "Advertencia", icon: "warning" },
  QUESTION = <any>{ title: "Pregunta", icon: "question" },
}


@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private ct: CustomTranslateService) { }

  message(message: string, type: any, allowCloseDialog = false) {
    return swal.fire({
      title: this.getTitle(type.title),
      position: 'center',
      icon: type.icon,
      text: message,
      showConfirmButton: true,
      confirmButtonText: this.ct.BTN_ACCEPT,
      allowOutsideClick: allowCloseDialog,
      allowEscapeKey: allowCloseDialog,
      allowEnterKey: allowCloseDialog,
    });
  }

  messageHtml(message: string, type: any, allowCloseDialog = false) {
    return swal.fire({
      title: this.getTitle(type.title),
      position: 'center',
      icon: type.icon,
      html: message,
      showConfirmButton: true,
      confirmButtonText: this.ct.BTN_ACCEPT,
      allowOutsideClick: allowCloseDialog,
      allowEscapeKey: allowCloseDialog,
      allowEnterKey: allowCloseDialog,
    });
  }

  comfirmation(message: string, type: any) {
    return swal.fire({
      title: this.getTitle(type.title),
      position: 'center',
      icon: type.icon,
      text: message,
      showConfirmButton: true,
      confirmButtonText: this.ct.BTN_ACCEPT,
      showCancelButton: true,
      cancelButtonText: this.ct.BTN_CANCEL,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
  }

  comfirmationRedirect(message: string, type: any) {
    return swal.fire({
      title: this.getTitle(type.title),
      position: 'center',
      icon: type.icon,
      text: message,
      showConfirmButton: true,
      confirmButtonText: this.ct.BTN_ACCEPT,
      showCancelButton: true,
      cancelButtonText: this.ct.BTN_VALIDATE,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: true,
      allowEnterKey: false,
      showCloseButton: true
    });
  }

  loading() {
    swal.fire({
      footer: `<b><h2>${this.ct.LOADING} ...</h2></b>`,
      position: 'center',
      showConfirmButton: false,
      html: `<img width="200" src="./assets/imagenes/loading.gif"></img>`,
      background: "rgba(0, 0, 0, 0)",
      backdrop: "rgba(0, 0, 0, 0.83)",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
  }


  //inputText(msg: string, type: any, textBtnOptional?: string, callback?: Function) {
  public getTokenValidation(email: string) {
    const idBtn = 'sw_butt1';
    const type: any = TYPES.INFO;
    let html = $('<div>').append(this.createMessage(this.ct.VERIFY_CODE1, this.ct.VERIFY_CODE2, email));
    // if (textBtnOptional) {
    //   html = html.append(this.createButton(textBtnOptional, idBtn));
    // }

    const swal2 = swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'hover-hand-blue',
      },
      buttonsStyling: false,
    })

    return swal2.fire({
      title: this.getTitle(type.title),
      icon: type.icon,
      //text: msg,
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: this.ct.DIGIT_CODE_ACTIVATION,
        required: "true",
      },
      inputValidator: (value) => {
        if (!value) {
          return this.ct.DIGIT_CODE_ACTIVATION
        }
      },
      html: html,
      showCancelButton: true,
      confirmButtonText: this.ct.BTN_VALIDATE,
      cancelButtonText: `${this.ct.BTN_RESEND_CODE} <i class="fa fa-refresh"></i>`,
      //showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showCloseButton: true,
      // onOpen: function (dObj) {
      //   $('#' + idBtn).on('click', function () {
      //   callback("hola");
      //   });
      // }
    });
  }

  createButton(text, id) {
    return $('<p class="mt-4 hover-hand-blue"><a id="' + id + '">' + text + '</a></p>');
  }

  createMessage(text, text2, email) {
    return $('<div class="swal2-content" style="display: block;">' + text + '<br><small>' + email + '</small><br><br><small style="font-size: 15px;color: #adadad;">' + text2 + '</small></div>');
  }

  close() {
    swal.close();
  }

  private getTitle(title: string): string {
    switch (title) {
      case (<any>TYPES.SUCCES).title:
        return this.ct.SUCCESS;

      case (<any>TYPES.WARNING).title:
        return this.ct.WARNING;

      case (<any>TYPES.INFO).title:
        return this.ct.INFORMATION;

      case (<any>TYPES.ERROR).title:
        return this.ct.ERROR;

      case (<any>TYPES.QUESTION).title:
        return this.ct.QUESTION;
    }
    return "null";
  }



  showError(err: any, msgErrorCt: string = this.ct.ERROR_MSG) {
    if (err.error && err.error.Error && err.error.Error[0]) {
      const msgError = err.error.Error[0];
      if (this.errorDeleteConstraint(msgErrorCt)) {
        return this.message(this.ct.MSG_DELETE_RECORD_CONSTRAINT, TYPES.WARNING);
      }
    }

    if (err.error && err.error.datos) {
      const d = err.error.datos;
      if (d.modelStateDetail && d.modelStateDetail.Error && d.modelStateDetail.Error.errors && d.modelStateDetail.Error.errors.length > 0) {
        const msgError = d.modelStateDetail.Error.errors[0].errorMessage;
        if (this.errorDeleteConstraint(msgError)) {
          return this.message(this.ct.MSG_DELETE_RECORD_CONSTRAINT, TYPES.WARNING);
        }
      }
    }

    if (err.error && err.error.datos) {
      const d = err.error.datos;
      if (d.codError && d.codError.indexOf('InvalidSamePassword') != -1) {
        return this.message(this.ct.WE_ARE_SORRY_PASSWORD_DIFERENT_CURRENT, TYPES.WARNING);
      } else if (d.codError && d.error.indexOf('contraseña') != -1 && d.error.indexOf('actual') != -1 && d.error.indexOf('incorrecta') != -1) {
        return this.message(this.ct.PASSWORD_WRONG, TYPES.ERROR);
      }
    }

    return this.message(msgErrorCt, TYPES.ERROR);
  }


  private errorDeleteConstraint = (msgError: string): boolean => {
    return (msgError.indexOf('DELETE') != -1 && msgError.indexOf('statement') != -1 && msgError.indexOf('constraint')) != -1;
  };







  /**
   * Obtener el tipo y el titulo del mensaje para sweetalert2
   * @param pTipo tipo del mensaje 
   */
  darTiposMensaje(pTipo) {

    let titulo = 'Error';
    let tipo = 'error';

    if (pTipo != null && pTipo != '') {
      let miTipo = pTipo.toLowerCase();
      if (miTipo == 's' || miTipo == 'success') {
        titulo = 'Éxito';
        tipo = 'success';
      } else if (miTipo == 'w' || miTipo == 'warning') {
        titulo = 'Advertencia';
        tipo = 'warning';
      } else if (miTipo == 'e' || miTipo == 'error') {
        titulo = 'Error';
        tipo = 'error';
      } else if (miTipo == 'i' || miTipo == 'info') {
        titulo = 'Información';
        tipo = 'info';
      } else if (miTipo == 'q' || miTipo == 'question') {
        titulo = 'Pregunta';
        tipo = 'question';
      }
    }

    let mensaje = {
      titulo: titulo,
      tipo: tipo
    }

    return mensaje;
  }


  /**
   * Metodo que genera un preloader de sweetalert2
   * @param title Titulo del preloader se establece como procesando por defecto
   * @param allowOutsideClick 
   */
  procesando(title = 'Procesando', allowOutsideClick = false) {
    swal.fire({
      title: title,
      html: 'Por favor espere un momento mientras procesamos su solicitud.',
      //type: type,
      allowOutsideClick: allowOutsideClick,
      onOpen: () => {
        swal.showLoading()
      }
    })
  }

  /**
   * Cierra el swet alert
   */
  cerrarMensaje() {
    swal.close();
  }


  /**
   * Metodo general de envio de mensajes
   * @param pTitulo Titulo del alert
   * @param pText Cuerpo del alert
   * @param pTipo Tipo de alert
   * @param allowOutsideClick Si desea que se cierre haciendo clic en cuaquier lado de la pantalla
   * @param time tiempo de retardo en mostrar el mensaje
   */
  // enviarMensaje(pTitulo, pText, pTipo, allowOutsideClick = false, time = 250) {
  //   let rTipoMensaje = <any>this.darTiposMensaje(pTipo);
  //   let htmlText: string = `
  //       <div style='text-align: center;'>`+ pText + ` </div>
  //   `;
  //   setTimeout(() => {
  //     swal.fire({
  //       title: pTitulo != null && pTitulo != '' ? pTitulo : rTipoMensaje.titulo,
  //       html: htmlText,
  //       type: rTipoMensaje.tipo,
  //       allowOutsideClick: allowOutsideClick,
  //       // animation: false,
  //       // customClass: 'animated rollIn'
  //     })
  //   }, time);
  // }

  // enviarMensajeFuncion(pTitulo, pText, pTipo, funcionEvento, allowOutsideClick = false, time = 250, ) {
  //   let rTipoMensaje = <any>this.darTiposMensaje(pTipo);
  //   setTimeout(() => {
  //     swal({
  //       title: pTitulo != null && pTitulo != '' ? pTitulo : rTipoMensaje.titulo,
  //       html: pText,
  //       type: rTipoMensaje.tipo,
  //       allowOutsideClick: allowOutsideClick,
  //       // animation: false,
  //       // customClass: 'animated rollIn'
  //     }).then(function () {
  //       funcionEvento();
  //     })
  //   }, time);
  // }


  /**
   * Metodo que renderiza mensajes de error enviados desde el servidor
   * @param error JSON en formato { 'error': 'Mi error' }
   * @param time tiempo de retardo en mostrar el mensaje
   */
  // mensajeErrorServidor(error, time = 250) {

  //   let titulo = 'Error';
  //   let message = this.darMensajeErrorServidor();

  //   if (error != null && error.error != null) {
  //     let errorValor = error.error;
  //     if (errorValor.titulo != null && errorValor.titulo != '') {
  //       titulo = errorValor.titulo;
  //     }

  //     if (errorValor.error != null && errorValor.error != '') {
  //       message = errorValor.error
  //     }
  //   }

  //   setTimeout(() => {
  //     swal(titulo, message, 'error');
  //   }, time);
  // }


  /**
   * Metodo que renderiza mensajes enviados desde el servidor que no sean errores
   * @param data se recibe un JSON { msj:{titulo:'Mi titulo', mensaje:'Mi mensaje'} }
   * @param pTipo se recibe el tipo de alert
   * @param time tiempo de retardo en mostrar el mensaje
   */
  // mensajeServidor(data, pTipo, time = 250) {

  //   let titulo = '';
  //   let message = '';

  //   let tipoMensaje = <any>this.darTiposMensaje(pTipo);

  //   if (data != null && data.msj != null) {
  //     let dataMensaje = data.msj;
  //     if (dataMensaje.titulo != null && dataMensaje.titulo != '') {
  //       titulo = dataMensaje.titulo;
  //     }

  //     if (dataMensaje.mensaje != null && dataMensaje.mensaje != '') {
  //       message = dataMensaje.mensaje
  //     }
  //   }

  //   setTimeout(() => {
  //     swal({
  //       title: titulo,
  //       html: message,
  //       type: tipoMensaje.tipo,
  //     })
  //   }, time);
  // }


  // mensajeConfirmacion(mensajeTitulo, mensaje) {
  //   return new Promise((res, rej) => {
  //     swal({
  //       title: mensajeTitulo,
  //       text: mensaje,
  //       type: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       cancelButtonText: 'Cancelar',
  //       confirmButtonText: 'Aceptar'
  //     }).then((result) => {
  //       res(result.value);
  //     });
  //   });


  // }

}

