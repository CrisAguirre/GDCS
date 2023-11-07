import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class TrasladosService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  //#region Tipo documento traslado
  public getTodosTipoDocumentoTraslado() {
    const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, 'ListarTodosTipoDocumentoTraslados'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosByTipoTraslado(idTipoTraslado: string) {
    const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, `ListarTodosPorTipoTraslado/${idTipoTraslado}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoDocumentoTrasladoById(id: string) {
    const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, `ListarTodosPorTipoTraslado/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoDocumentoTraslado(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, `ModificarTipoDocumentoTraslado/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, 'CrearTipoDocumentoTraslado'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteTipoDocumentoTraslado(data: any) {
    const ruta = [this.ApiUrl, this.tipoDocumentoTrasladoUrl, `BorrarTipoDocumentoTraslado/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Tipo traslado
  public getTodosTipoTraslados() {
    const ruta = [this.ApiUrl, this.tipoTrasladoUrl, 'ListarTodosTipoTraslados'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoTrasladoById(id: string) {
    const ruta = [this.ApiUrl, this.tipoTrasladoUrl, `ObtenerTipoTrasladoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoTraslado(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoTrasladoUrl, `ModificarTipoTraslado/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoTrasladoUrl, 'CrearTipoTraslado'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteTipoTraslado(data: any) {
    const ruta = [this.ApiUrl, this.tipoTrasladoUrl, `BorrarTipoTraslado/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Traslados CSJ
  public getTodosTrasladoCSJ() {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, 'ListarTodosTrasladoCSJ'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosByTipoTrasladoCSJ(idTipoTraslado: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ListarTodosPorTipoTraslado/${idTipoTraslado}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ListarTodosPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTrasladoCSJById(id: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerTrasladoCSJPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDespachosConVacantes() {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerDespachosConVacantes`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTrasladoCSJ(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ModificarTrasladoCSJ/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.trasladoCSJUrl, 'CrearTrasladoCSJ'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteTrasladoCSJ(data: any) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `BorrarTrasladoCSJ/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getInformacionUsuarioParaPermuta() {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerInformacionDeUsuariosParaPermuta`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public existeEmpleadoByNumDocumento(idUsuario: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ExisteEmpleadoPorNumDocumento/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getInformacionByNumDocumento(numDocumento: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerInformacionPorNumDocumento/${numDocumento}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getInformacionByCodEmpleado(codEmpleado: string) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerInformacionPorCodEmpleado/${codEmpleado}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getFechasHabilesParaTraslado(mes: number) {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerFechasHabilesParaTraslado/${mes}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCargosConDespachos() {
    const ruta = [this.ApiUrl, this.trasladoCSJUrl, `ObtenerCargosConDespachos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Soporte X Traslado
  public getTodosSoporteXTraslado() {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, 'ListarTodosSoporteXTraslado'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosSoporteByTraslado(idTipoTraslado: string) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, `ListarTodosPorTraslado/${idTipoTraslado}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSoporteXTrasladoById(id: string) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, `ObtenerSoporteXTrasladoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveSoporteXTraslado(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, `ModificarSoporteXTraslado/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, 'CrearSoporteXTraslado'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteSoporteXTraslado(data: any) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUrl, `BorrarSoporteXTraslado/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Soporte X Traslado Usuario
  public getTodosSoporteXTrasladoUsuario() {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, 'ListarTodosSoporteXTraslado'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosSoporteByTrasladoUsuario(idTipoTraslado: string) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, `ListarTodosPorTraslado/${idTipoTraslado}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSoporteXTrasladoUsuarioById(id: string) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, `ObtenerSoporteXTrasladoPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveSoporteXTrasladoUsuario(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, `ModificarSoporteXTraslado/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, 'CrearSoporteXTraslado'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteSoporteXTrasladoUsuario(data: any) {
    const ruta = [this.ApiUrl, this.soporteXTrasladoUsuarioUrl, `BorrarSoporteXTraslado/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion
}
