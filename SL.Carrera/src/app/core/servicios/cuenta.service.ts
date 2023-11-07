import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class CuentaService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  // ACCOUNT SERVICES
  public getTokenUser(idUser: string, email: string) {
    const params = JSON.stringify({ email });
    const ruta = [this.ApiUrl, this.userUrl, `EnviarTokenDesactivarUsuario/${idUser}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public getDeactivateUser(idUser: string, token: string) {
    const params = JSON.stringify({ token });
    const ruta = [this.ApiUrl, this.userUrl, `DesactivarUsuario/${idUser}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
  // END ACCOUNT SERVICES

  public verifyCode(id: string, code: string) {
    const params = JSON.stringify({ token: code });
    const ruta = [this.ApiUrl, this.userUrl, `ValidarToken/${id}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  /* CUENTA USUARIO ADMIN */
  public saveCuentaUsuarioAdmin(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.cuentaUsuarioAdminUrl, `ModificarCuentaUsuarioAdmin/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.cuentaUsuarioAdminUrl, `CrearCuentaUsuarioAdmin`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public getCuentaUsuarioAdminPorUsuario(idUsuario: any) {
    const params = JSON.stringify({ idUsuario });
    const ruta = [this.ApiUrl, this.cuentaUsuarioAdminUrl, `ObtenerCuentaUsuarioAdminPorIdUsuario`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }
}
