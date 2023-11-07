import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';
import { RptHojaVidaModel } from '@app/compartido/modelos/rpt-hoja-vida-model';
import { RptGeneralCargosRequisitosModel } from '@app/compartido/modelos/reportes/rpt-general-cargos-requisitos-model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  /* Reporte inscripcion */
  public getResumenByUsuario(data: RptHojaVidaModel): Observable<any> {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerResumenPorUsuario`].join('/');
    // return this.http.post(ruta, params, { headers: this.headersJson });
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* Reporte verificación admitidos y no admitidos */
  public getVerficacionAdmitidos(idConvocatoria: string, language: string): Observable<any> {
    const params = JSON.stringify({ idConvocatoria, language });
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerVerficacionAdmitidos`].join('/');
    // return this.http.post(ruta, params, { headers: this.headersJson });
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* Reporte verificación admitidos y no admitidos */
  public getGeneralCargosYRequisitos(rpt: RptGeneralCargosRequisitosModel): Observable<any> {
    const params = JSON.stringify(rpt);
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerGeneralCargosYRequisitos`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: this.headersJson });
  }

  public getListadoCitacion(rpt: any): Observable<any> {
    const params = JSON.stringify(rpt);
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerListadoCitacion`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: this.headersJson });
  }

  /* Reporte aspirante aprobados curso formacion */
  public ObtenerAspiranteAprobadosCursoFormacion(idConvocatoria: string, language: string): Observable<any> {
    const params = JSON.stringify({ idConvocatoria, language });
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerAspiranteAprobadosCursoFormacion`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* Reporte inscripcion */
  public getResumenValidacionDocumentosByUsuario(data: RptHojaVidaModel): Observable<any> {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerResumenValidacionDocumentosPorUsuario`].join('/');
    // return this.http.post(ruta, params, { headers: this.headersJson });
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* Reporte de Aspirantes por sedes */
  public getAspirantesSedes(idConvocatoria: string, language: string): Observable<any> {
    const params = JSON.stringify({ idConvocatoria, language });
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerAspirantesSedes`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* Reporte de aspirantes elegibles para cargos */
  public getAspirantesElegiblesCargos(idConvocatoria: string, language: string): Observable<any> {
    const params = JSON.stringify({ idConvocatoria, language });
    const ruta = [this.ApiUrl, this.reporteUrl, `ObtenerAspirantesElegiblesParaCargos`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }
}
