import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient } from '@angular/common/http';
import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';

@Injectable({
  providedIn: 'root'
})

export class AdministracionConvocatoriaService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  //#region TipoConvocatoria
  public getTipoConvocatoria() {
    const ruta = [this.ApiUrl, this.tipoConvocatoriaUrl, 'ListarTodosTipoConvocatorias'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoConvocatoriaById(id: number) {
    const ruta = [this.ApiUrl, this.tipoConvocatoriaUrl, 'ObtenerTipoConvocatoriaPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoConvocatoriaUrl, `ModificarTipoConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoConvocatoriaUrl, `CrearTipoConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoConvocatoria(data: any) {
    const ruta = [this.ApiUrl, this.tipoConvocatoriaUrl, `BorrarTipoConvocatoria/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoCurso
  public getTipoCurso() {
    const ruta = [this.ApiUrl, this.tipoCursoUrl, 'ListarTodosTiposCursos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoCurso(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoCursoUrl, `ModificarTipoCurso/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoCursoUrl, `CrearTipoCurso`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoCurso(data: any) {
    const ruta = [this.ApiUrl, this.tipoCursoUrl, `BorrarTipoCurso/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoDocumento
  public getTipoDocumento() {
    const ruta = [this.ApiUrl, this.tipoDocumentoUrl, 'ListarTodosTipoDocumentos'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoDocumento(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoDocumentoUrl, `ModificarTipoDocumento/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoDocumentoUrl, `CrearTipoDocumento`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoDocumento(data: any) {
    const ruta = [this.ApiUrl, this.tipoDocumentoUrl, `BorrarTipoDocumento/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoLugar
  public getTipoLugar() {
    const ruta = [this.ApiUrl, this.tipoLugarUrl, 'ListarTodosTipoLugares'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoLugarById(id: any) {
    const ruta = [this.ApiUrl, this.tipoLugarUrl, `ObtenerTipoLugarPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoLugar(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoLugarUrl, `ModificarTipoLugar/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoLugarUrl, `CrearTipoLugar`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteTipoLugar(data: any) {
    const ruta = [this.ApiUrl, this.tipoLugarUrl, `BorrarTipoLugar/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public existeTipoLugarEnConvocatoria(idLugar: string) {
    const params = JSON.stringify({ idTipoLugar: idLugar });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `ValidarIdTipoLugar`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  //#endregion

  //#region TipoSede
  public getTipoSede() {
    const ruta = [this.ApiUrl, this.tipoSedeUrl, 'ListarTodosTipoSedes'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosTipoSedeByEmpresa(idEmpresa?: any) {
    const ruta = [this.ApiUrl, this.tipoSedeUrl, 'ListarTodosTipoSedes' + `?IdEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoSedeById(id: string) {
    const ruta = [this.ApiUrl, this.tipoSedeUrl, 'ObtenerTipoSedePorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoSede(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoSedeUrl, `ModificarTipoSede/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoSedeUrl, `CrearTipoSede`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoSede(data: any) {
    const ruta = [this.ApiUrl, this.tipoSedeUrl, `BorrarTipoSede/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region ActividadConvocatoria
  public getActividadConvocatoria() {
    const ruta = [this.ApiUrl, this.actividadConvocatoriaUrl, 'ListarTodosActividadesConvocatorias'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveActividadConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.actividadConvocatoriaUrl, `ModificarActividadConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.actividadConvocatoriaUrl, `CrearActividadConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteActividadConvocatoria(data: any) {
    const ruta = [this.ApiUrl, this.actividadConvocatoriaUrl, `BorrarActividadConvocatoria/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoAdicional
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
  //#endregion

  //#region TipoCalificacion
  public getTipoCalificaciones() {
    const ruta = [this.ApiUrl, this.tipoCalificacionUrl, 'ListarTodosTipoCalificaciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoCalificacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoCalificacionUrl, `ModificarTipoCalificacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoCalificacionUrl, `CrearTipoCalificacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoCalificacion(data: any) {
    const ruta = [this.ApiUrl, this.tipoCalificacionUrl, `BorrarTipoCalificacion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoPrueba
  public getTipoPruebas() {
    const ruta = [this.ApiUrl, this.tipoPruebaUrl, 'ListarTodosTipoPruebas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoPrueba(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoPruebaUrl, `ModificarTipoPrueba/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoPruebaUrl, `CrearTipoPrueba`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoPrueba(data: any) {
    const ruta = [this.ApiUrl, this.tipoPruebaUrl, `BorrarTipoPrueba/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoEtapa
  public getTipoEtapas() {
    const ruta = [this.ApiUrl, this.tipoEtapaUrl, 'ListarTodosTipoEtapas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoEtapa(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoEtapaUrl, `ModificarTipoEtapa/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoEtapaUrl, `CrearTipoEtapa`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoEtapa(data: any) {
    const ruta = [this.ApiUrl, this.tipoEtapaUrl, `BorrarTipoEtapa/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region TipoSubEtapa
  public getTipoSubEtapas() {
    const ruta = [this.ApiUrl, this.tipoSubEtapaUrl, 'ListarTodosTipoSubEtapas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoSubEtapa(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoSubEtapaUrl, `ModificarTipoSubEtapa/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoSubEtapaUrl, `CrearTipoSubEtapa`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoSubEtapa(data: any) {
    const ruta = [this.ApiUrl, this.tipoSubEtapaUrl, `BorrarTipoSubEtapa/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  // #estadoAspirante
  public getTipoEstadoAspirante() {
    const ruta = [this.ApiUrl, this.tipoEstadoAspiranteUrl, 'ListarTipoEstadoAspirante'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoEstadoAspirante(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoEstadoAspiranteUrl, `ModificarTipoEstadoAspirante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoEstadoAspiranteUrl, `CrearTipoEstadoAspirante`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoEstadoAspirante(data: any) {
    const ruta = [this.ApiUrl, this.tipoEstadoAspiranteUrl, `BorrarTipoEstadoAspirante/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // #endEstadoAspirante

  // TipoAjusteAcuerdo
  public getTipoAjusteAcuerdo() {
    const ruta = [this.ApiUrl, this.tipoAjusteAcuerdoUrl, 'ListarTipoAjusteAcuerdo'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoAjusteAcuerdo(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoAjusteAcuerdoUrl, `ModificarTipoAjusteAcuerdo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoAjusteAcuerdoUrl, `CrearTipoAjusteAcuerdo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoAjusteAcuerdo(data: any) {
    const ruta = [this.ApiUrl, this.tipoAjusteAcuerdoUrl, `BorrarTipoAjusteAcuerdo/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // TipoAjusteAcuerdo

  //#region TipoCargo
  public getTipoCargo() {
    const ruta = [this.ApiUrl, this.TipoCargoUrl, 'ListarTipoCargo'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoCargo(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.TipoCargoUrl, `ModificarTipoCargo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.TipoCargoUrl, `CrearTipoCargo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoCargo(data: any) {
    const ruta = [this.ApiUrl, this.TipoCargoUrl, `BorrarTipoCargo/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion


  //#region TipoDependenciaHija
  public getTipoDependenciaHija() {
    const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, 'ListarTodosTipoDependenciaHijas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoDependenciaHijaById(id: string) {
    const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, 'ObtenerTipoDependenciaHijaPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public saveTipoDependenciaHija(data: TipoDependenciaHija) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, `ModificarTipoDependenciaHija/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, `CrearTipoDependenciaHija`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteTipoDependenciaHija(id: string) {
    const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, `BorrarTipoDependenciaHija/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }


  public getTipoDependenciaHijaPorIdLugar(idLugar: string) {
    const params = JSON.stringify({ idLugar: idLugar });
    const ruta = [this.ApiUrl, this.tipoDependenciaHijaUrl, 'ObtenerListaPorIdLugar'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  //#endregion


  //#region TipoFase
  public getTipoFases() {
    const ruta = [this.ApiUrl, this.tipoFaseUrl, 'ListarTodosTipoFase'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoFaseById(id: number) {
    const ruta = [this.ApiUrl, this.tipoFaseUrl, 'ObtenerTipoFasePorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoFase(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoFaseUrl, `ModificarTipoFase/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoFaseUrl, `CrearTipoFase`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoFase(data: any) {
    const ruta = [this.ApiUrl, this.tipoFaseUrl, `BorrarTipoFase/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion


  //#region TipoFasePrueba
  public getTipoFasePrueba() {
    const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, 'ListarTodosTipoFasePrueba'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoFasePruebaById(id: number) {
    const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, 'ObtenerTipoFasePruebaPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoFasePrueba(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, `ModificarTipoFasePrueba/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, `CrearTipoFasePrueba`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoFasePrueba(data: any) {
    const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, `BorrarTipoFasePrueba/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getTipoFasePruebaByIdConvocatoria(id: string) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, 'ObtenerPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region LugarPrueba
  public getlugarPrueba() {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, 'ListarTodosLugarPruebas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getlugarPruebabaById(id: number) {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, 'ObtenerLugarPruebaPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savelugarPrueba(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.lugarPruebaUrl, `ModificarLugarPrueba/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.lugarPruebaUrl, `CrearLugarPrueba`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deletelugarPrueba(data: any) {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, `BorrarLugarPrueba/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getlugarPruebaByIdConvocatoria(id: string) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.tipoFasePruebaUrl, 'ObtenerLugarPruebasPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion


  //#region TipoExperienciaLaboral
  public getTipoExperienciaLaboral() {
    const ruta = [this.ApiUrl, this.tipoExperienciaLaboralUrl, 'ListarTodosTipoExperienciaLaboral'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTipoExperienciaLaboralById(id: number) {
    const ruta = [this.ApiUrl, this.tipoExperienciaLaboralUrl, 'ObtenerTipoExperienciaLaboralPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveTipoExperienciaLaboral(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoExperienciaLaboralUrl, `ModificarTipoExperienciaLaboral/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoExperienciaLaboralUrl, `CrearTipoExperienciaLaboral`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoExperienciaLaboral(data: any) {
    const ruta = [this.ApiUrl, this.tipoExperienciaLaboralUrl, `BorrarTipoExperienciaLaboral/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion



}
