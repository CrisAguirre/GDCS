import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilterDetalleUsuario } from '../../compartido/modelos/filter-detalle-usuario';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
@Injectable({
  providedIn: 'root'
})
export class FilesService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  //#region MANEJO DE ARCHIVOS ARCHIVOS
  public getSoporteById(id: string) {
    const ruta = [this.ApiUrl, this.soportsUrl, `ObtenerSoportePorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getSoporteByUsuario(idUsuario: string) {
    const ruta = [this.ApiUrl, this.soportsUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public postFile(file: any, params: any) {
    let formData: FormData = new FormData();
    formData.append(file.name, file);
    const ruta = [this.ApiUrl, this.soportsUrl, 'CrearSoporte'].join('/');
    return this.http.post(
      ruta,
      formData,
      {
        headers: {
          "Content-Disposition": 'multipart/form-data'
        },
        params: params,
        //reportProgress: true, observe: 'events'
      });

  }

  downloadFile(idFile): Observable<any> {
    //  const ruta = [this.ApiUrl, this.soportsUrl, `ObtenerSoportePorId/${idFile}`].join('/');
    const ruta = [this.ApiUrl, this.soportsUrl, `DescargarSoportePorId/${idFile}`].join('/');
    // return this.http.get(ruta, { responseType: 'blob' });
    //return this.http.get('http://localhost:8080/employees/download', { responseType: ResponseContentType.Blob });
    return this.http.get(ruta, { responseType: 'arraybuffer' });
  }

  //Descargar filtro hoja de vida
  public DescargarFiltro(paramsFilter: FilterDetalleUsuario) {

    let cadena: string[] = [];
    for (let i in paramsFilter) {
      //console.log(i ,paramsFilter[i]);
      if (paramsFilter[i]) {
        cadena.push(i + '=' + paramsFilter[i]);
      }
    }

    const cadenaString = cadena.join('&');
    const params = JSON.stringify(paramsFilter);
    const ruta = [this.ApiUrl, this.reporteUrl, `ExportarInformacionPorUsuario?${cadenaString}`].join('/');
    return this.http.post(ruta, params, { responseType: 'arraybuffer' });
  }

  getInformationFile(idFile): Observable<any> {
    const ruta = [this.ApiUrl, this.soportsUrl, `ObtenerSoportePorId/${idFile}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  getInformationFilePath(idFile): Observable<any> {
    const ruta = [this.ApiUrl, this.soportsUrl, `ObtenerPathSoportePorId/${idFile}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  deleteFile(idFile) {
    const ruta = [this.ApiUrl, this.soportsUrl, `BorrarSoporte/${idFile}`].join('/');
    return this.http.delete(ruta);
  }

  getAnnexedByUser(idUser): Observable<any> {
    const ruta = [this.ApiUrl, this.soportsUrl, `ListarPorUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }


  getReport(reportModel: ReportModel): Observable<any> {
    const params = JSON.stringify(reportModel);
    console.log(params);
    const ruta = [this.ApiUrl, this.reporteUrl, `ReportePruebaConfig`].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  getGenericReport(reportModel: any, serviceName: string): Observable<any> {
    const params = JSON.stringify(reportModel);
    console.log(params);
    const ruta = [this.ApiUrl, this.reporteUrl, serviceName].join('/');
    return this.http.post(ruta, params, { responseType: 'blob', headers: { 'Content-Type': 'application/json', 'Accept': '*/*', 'Access-Control-Allow-Origin': '*' } });
  }

  /* ReporteGeneracion */
  public getReporteGeneracionById(id: string) {
    const ruta = [this.ApiUrl, this.reporteGeneracionUrl, 'ObtenerReporteGeneracionPorId', id].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getReporteGeneracion() {
    const ruta = [this.ApiUrl, this.reporteGeneracionUrl, `ListarTodosReporteGeneracion`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveReporteGeneracion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.reporteGeneracionUrl, `ModificarReporteGeneracion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.reporteGeneracionUrl, `CrearReporteGeneracion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteReporteGeneracion(id: string) {
    const ruta = [this.ApiUrl, this.reporteGeneracionUrl, `BorrarReporteGeneracion/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  /* End ReporteGeneracion */



  //CARGAR ARCHIVOS
  //public postFile(file: File, params: any) {
  // const formData: FormData = new FormData();
  // formData.append('file', file, file.name);
  // formData.forEach(e => //console.log(e));

  //const formData = new FormData();
  //formData.append('file1', file, file.name);

  //const ruta = [this.ApiUrl, this.classSoportsUrl, 'CrearSoporte'].join('/');
  //const ruta = 'https://fileloggs.free.beeceptor.com';
  // return this.http.post(
  // ruta,
  //formData,
  //{
  //headers: { "Content-Type": file.type },
  //headers: {
  // "Content-Type": 'multipart/form-data',
  //  "Content-Disposition": 'multipart/form-data', 
  // 'accept': '*/*'
  //},
  //params: { clientFilename: file.name, mimeType: file.type }
  //params: params,
  //formData:formData
  // });

  // const formData = new FormData();
  // formData.append(file.name, file);
  // const uploadReq = new HttpRequest('POST', ruta, formData, {
  //   reportProgress: false,
  //   params: params
  // });
  // return this.http.request(uploadReq);

  //}
}
