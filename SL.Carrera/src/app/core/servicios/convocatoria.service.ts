import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient } from '@angular/common/http';
import { ProcesoSeleccionModel } from '@app/compartido/modelos/proceso-seleccion-model';
import { CargarDespachoModel } from '../../compartido/modelos/cargar-despacho-model';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  //#region Convocatoria
  public getConvocatorias() {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatorias'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosConvocatoriasByEmpresa(idEmpresa: string) {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarTodosConvocatorias' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarConvocatoriasPermitenEdicion() {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatoriasPermitenEdicion'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarConvocatoriasPublicadas() {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatoriasPublicadas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarConvocatoriasCerradas() {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatoriasCerradas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarConvocatoriasPorEstado(estado: any) {
    const params = JSON.stringify({ estadoConvocatoria: estado });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatoriasPorEstado'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getListarConvocatoriasInactivas() {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarConvocatoriasInactivas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.convocatoriaUrl, `ModificarConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.convocatoriaUrl, `CrearConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteConvocatoria(data: any) {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `BorrarConvocatoria/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getConvocatoriaById(id: any) {
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `ObtenerConvocatoriaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCargosByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarCargosPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getPerfilesByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, 'ListarPerfilesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getPruebasByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `listarPruebasPorConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region Seccion
  public getAllSeccion() {
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarTodosSecciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public getSeccion() {
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarSecciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosSeccion() {
    const ruta = [this.ApiUrl, this.seccionUrl, 'Listar'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSeccionByEmpresa(idEmpresa: boolean) {
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarSecciones' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSeccionByConvocatory(idConvocatory: string) {
    const params = JSON.stringify({ idConvocatoria: idConvocatory });
    const ruta = [this.ApiUrl, this.seccionUrl, 'ObtenerSeccionesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getSubSeccion() {
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarSubSecciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSubSeccionByEmpresa(idEmpresa: boolean) {
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarSubSecciones' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerSubseccionesPorConvocatoria(pIdConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria: pIdConvocatoria });
    const ruta = [this.ApiUrl, this.seccionUrl, 'ObtenerSubseccionesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public getObtenerSeccionesPrincipalesPorConvocatoria(pIdConvocatoria: any, idEmpresa: boolean) {
    let params = '';
    if (idEmpresa) {
      params = JSON.stringify({ idConvocatoria: pIdConvocatoria, idEmpresa });
    } else {
      params = JSON.stringify({ idConvocatoria: pIdConvocatoria });
    }
    // const params = JSON.stringify({ idConvocatoria: pIdConvocatoria, idEmpresa });
    const ruta = [this.ApiUrl, this.seccionUrl, 'ObtenerSeccionesPrincipalesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public getListarPorIdSeccion(pIdSeccion: any) {
    const params = JSON.stringify({ idSeccion: pIdSeccion });
    const ruta = [this.ApiUrl, this.seccionUrl, 'ListarPorIdSeccion'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public saveSeccion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.seccionUrl, `ModificarSeccion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.seccionUrl, `CrearSeccion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteSeccion(data: any) {
    const ruta = [this.ApiUrl, this.seccionUrl, `BorrarSeccion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Etapa
  public getEtapa() {
    const ruta = [this.ApiUrl, this.etapaUrl, 'ListarEtapas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosEtapa() {
    const ruta = [this.ApiUrl, this.etapaUrl, 'ListarTodosEtapas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosEtapaByEmpresa(idEmpresa: boolean) {
    const ruta = [this.ApiUrl, this.etapaUrl, 'ListarTodosEtapas' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getEtapaByConvocatory(idConvocatory: string) {
    const params = JSON.stringify({ idConvocatoria: idConvocatory });
    const ruta = [this.ApiUrl, this.etapaUrl, 'ObtenerEtapasPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveEtapa(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.etapaUrl, `ModificarEtapa/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.etapaUrl, `CrearEtapa`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteEtapa(data: any) {
    const ruta = [this.ApiUrl, this.etapaUrl, `BorrarEtapa/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Equivalencia
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
  //#endregion

  //#region Cronograma
  public getCronograma() {
    const ruta = [this.ApiUrl, this.cronogramaUrl, 'ListarCronogramas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosCronograma() {
    const ruta = [this.ApiUrl, this.cronogramaUrl, 'ListarTodosCronogramas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosCronogramaByEmpresa(idEmpresa: string) {
    const ruta = [this.ApiUrl, this.cronogramaUrl, 'ListarTodosCronogramas' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCronogramaActivos(activos: boolean) {
    const ruta = [this.ApiUrl, this.cronogramaUrl, 'ListarCronogramasPorParametro?activo=' + activos].join('/');
    return this.http.post(ruta, { headers: this.headersJson });
  }

  public getCronogramaByConvocatory(idConvocatory: string) {
    const params = JSON.stringify({ idConvocatoria: idConvocatory });
    const ruta = [this.ApiUrl, this.cronogramaUrl, 'ObtenerPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveCronograma(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.cronogramaUrl, `ModificarCronograma/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.cronogramaUrl, `CrearCronograma`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCronograma(data: any) {
    const ruta = [this.ApiUrl, this.cronogramaUrl, `BorrarCronograma/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Adicionales
  public getAdicionales() {
    const ruta = [this.ApiUrl, this.adicionalUrl, 'ListarAdicionales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosAdicionalesByEmpresa(idEmpresa?: boolean) {
    const ruta = [this.ApiUrl, this.adicionalUrl, 'ListarTodosAdicionales' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerAdicionalesPorConvocatoria(id: any) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.adicionalUrl, 'ObtenerAdicionalesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public saveAdicionales(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.adicionalUrl, `ModificarAdicional/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.adicionalUrl, `CrearAdicional`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteAdicionales(data: any) {
    const ruta = [this.ApiUrl, this.adicionalUrl, `BorrarAdicional/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region ConfigAdicional
  public getConfigAdicionales() {
    const ruta = [this.ApiUrl, this.configAdicionalUrl, 'ListarTodosConfigAdicionales'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  public getObtenerConfigAdicionalesPorConvocatoria(id: any) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.configAdicionalUrl, 'ObtenerConfigAdicionalesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public getObtenerConfigAdicionalesPorAdicional(id: any) {
    const params = JSON.stringify({ idAdicional: id });
    const ruta = [this.ApiUrl, this.configAdicionalUrl, 'ObtenerConfigAdicionalesPorAdicional'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  public saveConfigAdicionales(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.configAdicionalUrl, `ModificarConfigAdicional/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.configAdicionalUrl, `CrearConfigAdicional`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteConfigAdicionales(data: any) {
    const ruta = [this.ApiUrl, this.configAdicionalUrl, `BorrarConfigAdicional/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Combinacion Etapa
  public getCombinacionEtapa() {
    const ruta = [this.ApiUrl, this.combinacionEtapaUrl, 'ListarTodosCombinacionEtapas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveCombinacionEtapa(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.combinacionEtapaUrl, `ModificarCombinacionEtapa/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.combinacionEtapaUrl, `CrearCombinacionEtapa`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteCombinacionEtapa(data: any) {
    const ruta = [this.ApiUrl, this.combinacionEtapaUrl, `BorrarCombinacionEtapa/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getCombinacionEtapaByEtapa(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.combinacionEtapaUrl, `ObtenerCombinacionEtapasPorEtapa`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getCombinacionEtapaByConvocatoria(idConvocatoria: string) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.combinacionEtapaUrl, `ObtenerCombinacionEtapasPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion Combinacion Etapa

  //#region AcuerdoConvocatoria
  public getListarAcuerdoConvocatoria() {
    const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, `ListarAcuerdoConvocatoria`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getAcuerdosConvocatoria(idEmpresa: boolean) {
    const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, 'ListarTodosAcuerdoConvocatoria' + `?idEmpresa=${idEmpresa}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveAcuerdoConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, `ModificarAcuerdoConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, `CrearAcuerdoConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteAcuerdoConvocatoria(data: any) {
    const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, `BorrarAcuerdoConvocatoria/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getAcuerdoConvocatoriaByConvocatoria(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.acuerdoConvocatoriaUrl, `ObtenerAcuerdoConvocatoriaPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region ConvocatoriaPerfil
  public getConvocatoriaPerfilById(id: string) {
    const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, 'ObtenerConvocatoriaPerfilPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getConvocatoriaPerfil() {
    const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, 'ListarTodosConvocatoriaPerfil'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveConvocatoriaPerfil(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `ModificarConvocatoriaPerfil/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `CrearConvocatoriaPerfil`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteConvocatoriaPerfil(id: string) {
    const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `BorrarConvocatoriaPerfil/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getConvocatoriaPerfilByConvocatoria(id: string) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `ListarConvocatoriaPerfilPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getConvocatoriaPerfilByPerfil(id: string) {
    const params = JSON.stringify({ idPerfil: id });
    const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `ListarConvocatoriaPerfilPorPerfil`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  // public getConvocatoriaPerfilById(id: string) {
  //   const ruta = [this.ApiUrl, this.ConvocatoriaPerfilUrl, `ObtenerConvocatoriaPerfilPorId/${id}`].join('/');
  //   return this.http.get(ruta, { headers: this.headersJson });
  // }
  //#endregion

  //#region Favoritos convocatoria
  public getListarByUsuario(idUsuario: string) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `ListarPorUsuario`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getListarByConvocatoriaUsuario(idConvocatoria: string, idUsuario: string) {
    const params = JSON.stringify({ idConvocatoria, idUsuario });
    const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `ListarPorConvocatoriaUsuario`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getListarByConvocatoriaUsuarioPerfil(idConvocatoria: string, idUsuario: string, idConvocatoriaPerfil: string) {
    const params = JSON.stringify({ idConvocatoria, idUsuario, idConvocatoriaPerfil });
    const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `ListarPorConvocatoriaUsuarioPerfil`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveFavoritoConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `ModificarFavoritoConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `CrearFavoritoConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteFavoritoConvocatoria(id: string) {
    const ruta = [this.ApiUrl, this.favoritoConvocatoriaUrl, `BorrarFavoritoConvocatoria/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region CategoriaAdmintidoModel
  public getCategoriaAdmitidoById(id: string) {
    const ruta = [this.ApiUrl, this.categoriaAdmitidosUrl, 'ObtenerCategoriaAdmitidosPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCategoriaAdmitidos() {
    const ruta = [this.ApiUrl, this.categoriaAdmitidosUrl, `ListarTodosCategoriaAdmitidos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveCategoriaAdmitido(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.categoriaAdmitidosUrl, `ModificarCategoriaAdmitidos/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.categoriaAdmitidosUrl, `CrearCategoriaAdmitidos`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteCategoriaAdmitido(id: string) {
    const ruta = [this.ApiUrl, this.categoriaAdmitidosUrl, `BorrarCategoriaAdmitidos/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregionnd

  //#region AspirantesAdmitidos
  public getAspiranteAdmitidoById(id: string) {
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, 'ObtenerAspirantesAdmitidosPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getAspiranteAdmitidos() {
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `ListarTodosAspirantesAdmitidos`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveAspiranteAdmitido(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `ModificarAspirantesAdmitidos/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `CrearAspirantesAdmitidos`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteAspiranteAdmitido(id: string) {
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `BorrarAspirantesAdmitidos/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getAspiranteAdmitidoByIdConvocatoria(id: string) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `ObtenerAspirantesPorConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getAspiranteAdmitidoByIdUsuario(id: string) {
    const params = JSON.stringify({ idUsuario: id });
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `ObtenerAspirantesPorUsuario`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getAspiranteAdmitidoByIdInscripcion(id: string) {
    const params = JSON.stringify({ idInscripcionAspirante: id });
    const ruta = [this.ApiUrl, this.aspiranteAdmitidosUrl, `ObtenerAspirantesPorInscripcion`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion

  //#region ValidacionAdjunto
  public getValidacionAdjuntoById(id: string) {
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, 'ObtenerValidacionAdjuntoPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getValidacionAdjuntos() {
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `ListarTodosValidacionAdjunto`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveValidacionAdjunto(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `ModificarValidacionAdjunto/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `CrearValidacionAdjunto`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteValidacionAdjunto(id: string) {
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `BorrarValidacionAdjunto/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getValidacionAdjuntoByConvocatoriaUser(idInscripcionAspi: string, idUser: string) {
    const params = JSON.stringify({ idInscripcionAspirante: idInscripcionAspi, idUsuario: idUser });
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `ObtenerValidacionAdjuntos`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getValidacionAdjuntosByConvocatoria(idConvocatoria: string) {
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, `ObtenerValidacionAdjuntosPorConvocatoria/${idConvocatoria}`].join('/');
    return this.http.post(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Lugar de pruebas
  public getgetlugarPruebaById(id: string) {
    const ruta = [this.ApiUrl, this.validacionAdjuntoUrl, 'ObtenerLugarPruebaPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getlugarPrueba() {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, 'ListarTodosLugarPruebas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosLugarPruebas() {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, `ListarTodosLugarPruebas/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getlugarPruebaUsuario(idUser: string) {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, `ListarPorUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerlugarPruebaPorConvocatoria(id: any) {
    const params = JSON.stringify({ idConvocatoria: id });
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, 'ObtenerLugarPruebasPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public savelugarPrueba(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.lugarPruebaUrl, `ModificarlugarPrueba/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.lugarPruebaUrl, `CrearlugarPrueba`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deletelugarPrueba(data: any) {
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, `BorrarlugarPrueba/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getLugarPruebasByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.lugarPruebaUrl, `ObtenerLugarPruebasPorConvocatoria/`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#region

  //#region Citacion pruebas aspirantes
  public saveCitacionAspirante(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `ModificarCitacionAspirante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `CrearCitacionAspirante`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public getTodosCitacionAspirante() {
    const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `ListarTodosCitacionAspirante/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCitacionByConvocatoria(idConvocatoria: any) {
    const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `ListarCitacionesPorConvocatoria/${idConvocatoria}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getCitacionAspiranteById(id: any) {
    const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `ObtenerCitacionAspirantePorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public deleteCitacionAspirante(id: any) {
    const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `BorrarCitacionAspirante/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public validarInformacionRegistro(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.citacionAspiranteUrl, `ValidarInformacionRegistro`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion Citacion pruebas aspirantes

  //#region RequisitosConvocatoria
  public getRequisitosConvocatoria() {
    const ruta = [this.ApiUrl, this.requisitosConvocatoriaUrl, 'ListarApoyoValidacionReq'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getRequisitosByConvocatory(idConvocatory: string) {
    const params = JSON.stringify({ idConvocatoria: idConvocatory });
    const ruta = [this.ApiUrl, this.requisitosConvocatoriaUrl, 'ObtenerApoyoValidacionReqPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveRequisitosConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.requisitosConvocatoriaUrl, `ModificarApoyoValidacionReq/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.requisitosConvocatoriaUrl, `CrearApoyoValidacionReq`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteRequisitosConvocatoria(id: string) {
    const ruta = [this.ApiUrl, this.requisitosConvocatoriaUrl, `BorrarApoyoValidacionReq/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Publicar Convocatoria
  public publicarConvocatoria(idUsuario: string, idConvocatoria: string) {
    const params = JSON.stringify({ idUsuario, idConvocatoria });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `PublicarConvocatoria`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  //cerrar Convocatoria
  public cerrarConvocatoria(idUsuario: string, idConvocatoria: string) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.convocatoriaUrl, `ModificarEstadoConvocatoriaCerrada/${idConvocatoria}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }



  //#endregion

  //#region Resultado pruebas
  public getTodosResultadoPruebas() {
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ListarTodosResultadoPruebas/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getResultadoPruebasByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getResultadoByUsuarioCargo(idUsuario: string, idConvocatoriaPerfil: string, idConvocatoria: string) {
    const params = JSON.stringify({ idUsuario, idConvocatoriaPerfil, idConvocatoria });
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, 'ListarPorUsuarioCargo'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getResultadoPruebasById(id: string) {
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ObtenerResultadoPruebasPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveResultadoPruebas(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ModificarResultadoPruebas/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `CrearResultadoPruebas`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteResultadoPruebas(id: string) {
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `BorrarResultadoPruebas/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public validarInformacionRegistroResultadoPruebas(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ValidarInformacionRegistro`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getResultadoPruebasByConvocatoria(idConvocatoria: string) {
    const ruta = [this.ApiUrl, this.resultadoPruebasUrl, `ListarPorConvocatoria/${idConvocatoria}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Solicitud Recalificación
  public getTodosSolicitudRecalificacion() {
    const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `ListarTodosSolicitudRecalificacion/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSolicitudRecalificacionById(id: string) {
    const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `ObtenerSolicitudRecalificacionPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSoporteAnterior(idConvocatoria: string, idUsuario: string) {
    const params = JSON.stringify({ idConvocatoria, idUsuario });
    const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `ObtenerSoporteAnterior`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveSolicitudRecalificacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `ModificarSolicitudRecalificacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `CrearSolicitudRecalificacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public actualizarEstadoSolicitudRecalificacionCreacion(idSolicitudRecalificacion: string, idInscripcionAspirante: string) {
    const param = { idSolicitudRecalificacion, idInscripcionAspirante };
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarEstadoSolicitudCreacion`].join('/');
    return this.http.post(ruta, { headers: this.headersJson });
  }

  public actualizarEstadoSolicitudRecalificacionRevision(idSolicitudRecalificacion: string, idInscripcionAspirante: string) {
    const param = { idSolicitudRecalificacion, idInscripcionAspirante };
    const ruta = [this.ApiUrl, this.inscripcionAspiranteUrl, `ActualizarEstadoSolicitudRevision`].join('/');
    return this.http.post(ruta, param, { headers: this.headersJson });
  }

  public deletSolicitudRecalificacion(id: string) {
    const ruta = [this.ApiUrl, this.solicitudRecalificacionUrl, `BorrarSolicitudRecalificacion/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Lugar de dias recalificacion
  public getDiasRecalificacion() {
    const ruta = [this.ApiUrl, this.diasRecalificacionUrl, 'ListarDiasRecalificaciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosDiasRecalificacion() {
    const ruta = [this.ApiUrl, this.diasRecalificacionUrl, `ListarTodosDiasRecalificaciones`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerDiasRecalificacionPorConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.diasRecalificacionUrl, 'ObtenerDiasRecalificacionesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveDiasRecalificacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.diasRecalificacionUrl, `ModificarDiasRecalificacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.diasRecalificacionUrl, `CrearDiasRecalificacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteDiasRecalificacion(data: any) {
    const ruta = [this.ApiUrl, this.diasRecalificacionUrl, `BorrarDiasRecalificacion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Lugar de dias habiles vacantes
  public getDiasHabilesVacantes() {
    const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, 'ListarDiasHabilesVacantes'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosDiasHabilesVacantes() {
    const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, `ListarTodosDiasHabilesVacantes`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerDiasHabilesVacantesPorConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, 'ObtenerDiasHabilesVacantesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveDiasHabilesVacantes(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, `ModificarDiasHabilesVacantes/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, `CrearDiasHabilesVacantes`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteDiasHabilesVacantes(data: any) {
    const ruta = [this.ApiUrl, this.diasHabilesVacantesUrl, `BorrarDiasHabilesVacantes/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  //#endregion

  //#region Vacantes
  public getVacantes() {
    const ruta = [this.ApiUrl, this.vacanteUrl, 'ListarVacantes'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosVacante() {
    const ruta = [this.ApiUrl, this.vacanteUrl, `ListarTodosVacante`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getVacantesPublicadasUsuarios(idConvocatoriaPerfil: any) {
    const params = JSON.stringify({ idConvocatoriaPerfil });
    const ruta = [this.ApiUrl, this.vacanteUrl, `ListarVacantesPublicadasUsuarios`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getObtenerVacante(id: string) {
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

  public saveModificarEstadoVacantePorId(data: any) {
    const params = JSON.stringify(data.estadoVacante);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vacanteUrl, `ModificarEstadoVacante/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteVacante(data: any) {
    const ruta = [this.ApiUrl, this.vacanteUrl, `BorrarVacante/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getObtenerVacantesPorConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.vacanteUrl, 'ObtenerVacantesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  //#endregion

  // EscalafonRama

  public getEscalafonRama() {
    const ruta = [this.ApiUrl, this.escalafonRamaUrl, 'ListarEscalafonRama'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosEscalafonRama() {
    const ruta = [this.ApiUrl, this.escalafonRamaUrl, `ListarTodosEscalafonRama`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getObtenerEscalafonRama(id: string) {
    const ruta = [this.ApiUrl, this.escalafonRamaUrl, `ObtenerEscalafonRamaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveEscalafonRama(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.escalafonRamaUrl, `ModificarEscalafonRama/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.escalafonRamaUrl, `CrearEscalafonRama`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public saveEscalafonRamaFechas(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.escalafonRamaUrl, `ModificarEscalafonRama/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.escalafonRamaUrl, `CrearEscalafonRamaFechas`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteEscalafonRama(data: any) {
    const ruta = [this.ApiUrl, this.escalafonRamaUrl, `BorrarEscalafonRama/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //#endregion

  //#region Resultado curso formación
  public getTodosResultadoCursoFormacion() {
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ListarTodosResultadoCursoFormacion/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getResultadoCursoFormacionByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getResultadoCursoFormacionByConvocatoria(idConvocatoria: string) {
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ListarPorConvocatoria/${idConvocatoria}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getResultadoCursoFormacionByUsuarioConvocatoria(idConvocatoria: string, idUsuario: string) {
    const params = JSON.stringify({ idConvocatoria, idUsuario });
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ListarPorUsuarioConvocatoria`].join('/');
    // const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ObtenerResultadoPruebasPorId`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getResultadoCursoFormacionById(id: string) {
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ListarPorConvocatoria/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveResultadoCursoFormacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ModificarResultadoCursoFormacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `CrearResultadoCursoFormacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteResultadoCursoFormacion(id: string) {
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `BorrarResultadoCursoFormacion/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public validarInformacionRegistroResultadoCursoFormacion(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.resultadoCursoFormacionUrl, `ValidarInformacionRegistro`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  //#endregion



  //#region ProcesoSeleccion
  public getTodosProcesoSeleccion() {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ListarTodosProcesoSeleccion/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getProcesoSeleccionByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getProcesoSeleccionByConvocatoria(idConvocatoria: string) {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ListarPorConvocatoria/${idConvocatoria}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getProcesoSeleccionByInscripcionAspirante(idInscripcionAspirante: string) {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ListarPorInscripcionAspirante/${idInscripcionAspirante}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }


  public getProcesoSeleccionById(id: string) {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ListarPorConvocatoria/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveProcesoSeleccion(data: ProcesoSeleccionModel) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ModificarProcesoSeleccion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `CrearProcesoSeleccion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteProcesoSeleccion(id: string) {
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `BorrarProcesoSeleccion/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public updateEstadoProcesoSeleccion(idInscripcionAspirante: string, idConvocatoria: string) {
    const params = JSON.stringify({
      idInscripcionAspirante,
      idConvocatoria
    });
    const ruta = [this.ApiUrl, this.procesoSeleccionUrl, `ActualizarEstadoProcesoSeleccion`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  //#endregion

  //Despachos

  public getTodosDespachos() {
    const ruta = [this.ApiUrl, this.despachoUrl, `ListarTodosDespacho/`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveDespachos(data: any, esEdicion: boolean) {
    const params = JSON.stringify(data);
    if (esEdicion) {
      const ruta = [this.ApiUrl, this.despachoUrl, `ModificarDespacho/${data.codigoDespacho}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.despachoUrl, `CrearDespacho`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteDespachos(data: any) {
    const ruta = [this.ApiUrl, this.despachoUrl, `BorrarDespacho/${data.codigoDespacho}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //Carge masivo Despacho
  public saveCargeDespachos(data: CargarDespachoModel) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.despachoUrl, `CrearDespacho`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  public saveCargeDespachosMasivos(json: String) {
    //const params = JSON.stringify('"json":'+ json);
    const params = '{"json":"' + json + '"}';
    const ruta = [this.ApiUrl, this.despachoUrl, `Sincronizar`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public updateCargeDespachos(data: CargarDespachoModel) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.despachoUrl, `ModificarDespacho/${data.codigoDespacho}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public getDespachoByCodigo(codigoDespacho: any) {
    const ruta = [this.ApiUrl, this.despachoUrl, `ObtenerDespachoPorCodigo/${codigoDespacho}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  //#endregion Despachos

  //#AspiranteExcluido
  public getAspiranteExcluido() {
    const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, 'ListarAspiranteExcluido'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosAspiranteExcluido() {
    const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, `ListarTodosAspiranteExcluido`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getAspiranteExcluidoByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, 'ObtenerAspirantesPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public postAspiranteExcluido(numeroDocumento: string, idConvocatoria: string,) {
    const params = JSON.stringify({ numeroDocumento, idConvocatoria });
    const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, `ValidarUsuario`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveAspiranteExcluido(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, `ModificarAspiranteExcluido/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, `CrearAspiranteExcluido`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteAspiranteExcluido(data: any) {
    const ruta = [this.ApiUrl, this.AspiranteExcluidoUrl, `BorrarAspiranteExcluido/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //#ResolucionesCF
  public getResolucionesCF() {
    const ruta = [this.ApiUrl, this.ResolucionesCFUrl, 'ListarResolucionesCF'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getTodosResolucionesCF() {
    const ruta = [this.ApiUrl, this.ResolucionesCFUrl, `ListarTodosResolucionesCF`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getAResolucionesCFByConvocatoria(idConvocatoria: any) {
    const params = JSON.stringify({ idConvocatoria });
    const ruta = [this.ApiUrl, this.ResolucionesCFUrl, 'ObtenerResolucionesCFPorConvocatoria'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveResolucionesCF(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.ResolucionesCFUrl, `ModificarResolucionesCF/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.ResolucionesCFUrl, `CrearResolucionesCF`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteResolucionesCF(data: any) {
    const ruta = [this.ApiUrl, this.ResolucionesCFUrl, `BorrarResolucionesCF/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
}
