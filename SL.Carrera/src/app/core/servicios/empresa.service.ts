import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  /* Servicios Empresas */
  public getListarEmpresas() {
    const ruta = [this.ApiUrl, this.empresaUrl, 'ListarTodosEmpresas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getListarEmpresasToken(token: string) {
    /* const ruta = [this.ApiUrl, this.empresaUrl, 'ListarEmpresas'].join('/');
    return this.http.get(ruta, { headers: this.headersJson }); */

    const ruta = [this.ApiUrl, this.empresaUrl, `ListarEmpresas`].join('/');
    const header = {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('accept', '*/*')
    };
    return this.http.get(ruta, header);
  }

  public getObtenerEmpresaPorId(id: string) {
    const ruta = [this.ApiUrl, this.empresaUrl, `ObtenerEmpresaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveEmpresa(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.empresaUrl, `ModificarEmpresa/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.empresaUrl, `CrearEmpresa`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteEmpresa(data: any) {
    const ruta = [this.ApiUrl, this.empresaUrl, `BorrarEmpresa/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  /* End Servicios Empresa */
}
