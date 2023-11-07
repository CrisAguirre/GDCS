import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { PerfilEquivalencia } from '@app/compartido/modelos/perfil-equivalencia';
import { PerfilExperiencia } from '@app/compartido/modelos/perfil-experiencia';
import { PerfilTitulo } from '@app/compartido/modelos/perfil-titulo';
import { identity } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  /* #Equivalencia */
  public getEquivalencia() {
    const ruta = [this.ApiUrl, this.equivalenciaUrl, 'ListarTodosEquivalencias'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getEquivalenciaByConvocatory(idConvocatory: string) {
    const params = JSON.stringify({ idConvocatoria: idConvocatory });
    const ruta = [this.ApiUrl, this.equivalenciaUrl, 'ObtenerEquivalenciasPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveEquivalencia(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.equivalenciaUrl, `ModificarEquivalencia/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.equivalenciaUrl, `CrearEquivalencia`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteEquivalencia(data: any) {
    const ruta = [this.ApiUrl, this.equivalenciaUrl, `BorrarEquivalencia/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  /* #end */

  /* #TipoAdicional */
  public getTipoAdicionales() {
    const ruta = [this.ApiUrl, this.tipoAdicionalUrl, 'ListarTodosTipoAdicionales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public getTipoAdicionalesPorIdReferencia(id: any) {//pasar id de capacitacion, configurarlo en una variable de sistema
    const params = JSON.stringify({ idReferencia: id });
    const ruta = [this.ApiUrl, this.tipoAdicionalUrl, 'ListarPorIdReferencia'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public saveTipoAdicional(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoAdicionalUrl, `ModificarTipoAdicional/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoAdicionalUrl, `CrearTipoAdicional`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoAdicional(data: any) {
    const ruta = [this.ApiUrl, this.tipoAdicionalUrl, `BorrarTipoAdicional/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  /* #end */

  /* #Perfil */
  public getPerfiles(idEmpresa?: string) {
    let ruta: string;
    if (idEmpresa) {
      ruta = [this.ApiUrl, this.perfilUrl, `ListarTodosPerfil?idEmpresa=${idEmpresa}`].join('/');
    } else {
      ruta = [this.ApiUrl, this.perfilUrl, 'ListarTodosPerfil'].join('/');
    }
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarPerfilesCodAlterno() {
    const ruta = [this.ApiUrl, this.perfilUrl, `ListarPerfilesConCodAlterno`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getPerfilById(id: string) {
    const ruta = [this.ApiUrl, this.perfilUrl, 'ObtenerPerfilPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savePerfil(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.perfilUrl, `ModificarPerfil/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.perfilUrl, `CrearPerfil`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deletePerfil(data: any) {
    const ruta = [this.ApiUrl, this.perfilUrl, `BorrarPerfil/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public activarPerfil(data: any) {
    const ruta = [this.ApiUrl, this.perfilUrl, `ActivarPerfil/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public inactivarPerfil(idPerfil: any) {
    const ruta = [this.ApiUrl, this.perfilUrl, `InactivarPerfil/${idPerfil}`].join('/');
    return this.http.put(ruta, { headers: this.headersJson });
  }

  public getPerfilByCargo(id: string) {
    const params = JSON.stringify({ idCargo: id });
    const ruta = [this.ApiUrl, this.perfilUrl, 'ListarPerfilPorCargo'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getPerfilByCargoHumano(id: string) {
    const params = JSON.stringify({ idCargoHumano: id });
    const ruta = [this.ApiUrl, this.perfilUrl, 'ListarPerfilPorCargoHumano'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getInformacionPorPerfil(idPerfil: any) {
    const params = JSON.stringify({ idPerfil });
    const ruta = [this.ApiUrl, this.perfilUrl, 'ObtenerInformacionPorPerfil'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  /* #end */

  /* #Perfil Titulo */
  public getPerfilTitulo() {
    const ruta = [this.ApiUrl, this.perfilTituloUrl, 'ListarTodosPerfilTitulo'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savePerfilTitulo(data: PerfilTitulo) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.perfilTituloUrl, `ModificarPerfilTitulo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.perfilTituloUrl, `CrearPerfilTitulo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deletePerfilTitulo(id: string) {
    const ruta = [this.ApiUrl, this.perfilTituloUrl, `BorrarPerfilTitulo/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getPerfilTituloByPerfil(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.perfilTituloUrl, `ObtenerPerfilTituloPorPerfil`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  /* #end */

  /* #Perfil Equivalencia */
  public getPerfilEquivalencia() {
    const ruta = [this.ApiUrl, this.perfilEquivalenciaUrl, 'ListarTodosPerfilEquivalencia'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savePerfilEquivalencia(data: PerfilEquivalencia) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.perfilEquivalenciaUrl, `ModificarPerfilEquivalencia/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.perfilEquivalenciaUrl, `CrearPerfilEquivalencia`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deletePerfilEquivalencia(id: string) {
    const ruta = [this.ApiUrl, this.perfilEquivalenciaUrl, `BorrarPerfilEquivalencia/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getPerfilEquivalenciaByPerfil(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.perfilEquivalenciaUrl, `ObtenerPerfilEquivalenciaPorPerfil`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  /* #end */

  /* Perfil Experiencia */
  public getPerfilExperiencia() {
    const ruta = [this.ApiUrl, this.perfilExperienciaUrl, 'ListarTodosPerfilExperiencia'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savePerfilExperiencia(data: PerfilExperiencia) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.perfilExperienciaUrl, `ModificarPerfilExperiencia/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.perfilExperienciaUrl, `CrearPerfilExperiencia`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deletePerfilExperiencia(id: string) {
    const ruta = [this.ApiUrl, this.perfilExperienciaUrl, `BorrarPerfilExperiencia/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getPerfilExperienciaByPerfil(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.perfilExperienciaUrl, `ObtenerPerfilExperienciaPorPerfil`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  /* #end */

  /* Cargos Locales */
  public getCargos() {
    const ruta = [this.ApiUrl, this.cargoUrl, `ListarCargos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosCargos() {
    const ruta = [this.ApiUrl, this.cargoUrl, `ListarTodosCargos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCargosTodos(idEmpresa?: string) {
    let ruta: string;
    if (idEmpresa) {
      ruta = [this.ApiUrl, this.cargoUrl, `ListarTodosCargos?idEmpresa=${idEmpresa}`].join('/');
    } else {
      ruta = [this.ApiUrl, this.cargoUrl, `ListarTodosCargos`].join('/');
    }
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveCargo(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.cargoUrl, `ModificarCargo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.cargoUrl, `CrearCargo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteCargo(data: any) {
    const ruta = [this.ApiUrl, this.cargoUrl, `BorrarCargo/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getCargoByPerfil(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.cargoUrl, `ObtenerCargo`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  /* #end */

  /* Cargos Humano servicios viejos */
  // public getListarCargosHumano() {
  //   const ruta = [this.ApiUrl, this.cargoUrl, `ListarCargosHumano`].join('/');
  //   return this.http.get(ruta, { headers: this.headersJson });
  // }

  // public getObtenerCargoHumano(data: any) {
  //   const ruta = [this.ApiUrl, this.cargoUrl, `ObtenerCargoHumano/${data.codigo}`].join('/');
  //   return this.http.get(ruta, { headers: this.headersJson });
  // }

  /* Cargos Humano servicios nuevos */
  public getCargosHumano() {
    const ruta = [this.ApiUrl, this.cargoHumanoUrl, `ListarTodos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCargoHumanoByCod(data: any) {
    const ruta = [this.ApiUrl, this.cargoHumanoUrl, `ObtenerCargoHumano/${data.codigo}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public syncCargosHumano() {
    const ruta = [this.ApiUrl, this.cargoHumanoUrl, `Sincronizar`].join('/');
    return this.http.post(ruta, null, { headers: this.headersJson });
  }

  public deleteCargosHumano() {
    const ruta = [this.ApiUrl, this.cargoHumanoUrl, `Limpiar`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
}
