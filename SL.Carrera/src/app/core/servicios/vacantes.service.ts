import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class VacantesService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  //#region Vacantes
  public getListarTodosVacantes() {
    const ruta = [this.ApiUrl, this.vacanteUrl, 'ListarTodosVacante'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getVacantesPublicadasUsuarios(idConvocatoriaPerfil: any) {
    const params = JSON.stringify({ idConvocatoriaPerfil });
    const ruta = [this.ApiUrl, this.vacanteUrl, `ListarVacantesPublicadasUsuarios`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getObtenerVacantePorId(id: string) {
    const ruta = [this.ApiUrl, this.vacanteUrl, `ObtenerVacantePorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveVacante(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vacanteUrl, `ModificarVacante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.vacanteUrl, `CrearVacante`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public saveVacanteAnioMesDia(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vacanteUrl, `ModificarVacante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.vacanteUrl, `CrearVacanteAnioMesDia`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public modificarEstadoVacantePorId(id: string, estado: string) {
    const params = JSON.stringify({ estado });
    if (id) {
      const ruta = [this.ApiUrl, this.vacanteUrl, `ModificarEstadoVacante/${id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    }
  }

  public modificarEstadoVacantePosesion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vacanteUrl, `ModificarEstadoPosesion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    }
  }

  public liberarVacanteEnPosesion(id: string) {
    const ruta = [this.ApiUrl, this.vacanteUrl, `LiberarPosesion/${id}`].join('/');
    return this.http.put(ruta, { headers: this.headersJson });
  }

  public deleteVacante(data: any) {
    const ruta = [this.ApiUrl, this.vacanteUrl, `BorrarVacante/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getObtenerVacantesByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.vacanteUrl, `ObtenerVacantesPorConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public validarInformacionRegistroVacante(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.vacanteUrl, `ValidarInformacionRegistro`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public enviarCorreosAspirantes(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.vacanteUrl, `EnviarCorreos`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region Inscripción aspirante vacante
  public getTodosInscripcionAspiranteVacante() {
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, 'ListarTodosInscripcionAspiranteVacante'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerInscripcionAspiranteVacanteById(id: string) {
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `ObtenerInscripcionAspiranteVacantePorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerInscripcionesUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `ObtenerInscripcionesUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getInscripcionesByConvocatoria(idConvocatoria: string) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `ObtenerInscripcionesPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInscripcionesByVacante(idVacante: string) {
    const params = JSON.stringify({ idVacante });
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `ObtenerInscripcionesPorVacante`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveInscripcionAspiranteVacante(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `ModificarInscripcionAspiranteVacante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `CrearInscripcionAspiranteVacante`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteInscripcionAspiranteVacante(data: any) {
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `BorrarInscripcionAspiranteVacante/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public eliminarDeLista(id: string, data: string) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.inscripcionAspiranteVacanteUrl, `EliminarDeLista/${id}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region Declinar a vacante
  public getTodosDeclinacionVacante() {
    const ruta = [this.ApiUrl, this.declinacionUrl, 'ListarTodosDeclinacion'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDeclinacionById(id: string) {
    const ruta = [this.ApiUrl, this.declinacionUrl, `ObtenerDeclinacionPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDeclinacionesByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.declinacionUrl, `ObtenerDeclinacionesPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDeclinacionesByConvocatoriaUsuario(idConvocatoria: string, idUsuario: string) {
    const ruta = [this.ApiUrl, this.declinacionUrl, `ObtenerDeclinacionesPorConvocatoriaUsuario/${idConvocatoria}/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getDeclinacionesByConvocatoria(idConvocatoria: string) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.declinacionUrl, `ObtenerDeclinacionesPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getDeclinacionesVacante(idVacante: string) {
    const params = JSON.stringify({ idVacante });
    const ruta = [this.ApiUrl, this.declinacionUrl, `ObtenerDeclinacionesPorVacante`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveDeclinacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.declinacionUrl, `ModificarDeclinacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.declinacionUrl, `CrearDeclinacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteDeclinacion(data: any) {
    const ruta = [this.ApiUrl, this.declinacionUrl, `BorrarDeclinacion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion
}
