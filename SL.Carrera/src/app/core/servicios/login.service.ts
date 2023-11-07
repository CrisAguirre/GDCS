import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base-service';
import { statesUser } from '@app/compartido/helpers/enums';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  public registerUser(newUser: any) {
    const params = JSON.stringify(newUser);
    const ruta = [this.ApiUrl, this.userUrl, 'CrearUsuario'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public registerUserAdmin(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.userUrl, `ModificarUsuario/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.userUrl, 'CrearUsuarioAdministrativo'].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public loginUser(user: any) {
    const params = JSON.stringify(user);
    const ruta = [this.ApiUrl, this.userUrl, 'IniciarSesion'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public loginUserAdmin(user: any) {
    const params = JSON.stringify(user);
    const ruta = [this.ApiUrl, this.userUrl, 'IniciarSesionAdministrativos'].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public reactivarCuentaUsuario(id: any, data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.userUrl, `ReactivarCuenta/${id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public verifyCodeRegister(id: string, code: string) {
    const params = JSON.stringify({ token: code });
    const ruta = [this.ApiUrl, this.userUrl, `ValidarToken/${id}`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public changePassword(id: string, previusPassword: string, newPassword: string) {
    try {
      const params = JSON.stringify({
        contraseniaAnterior: previusPassword,
        contraseniaNueva: newPassword
      });
      const ruta = [this.ApiUrl, this.userUrl, `ModificarContrasenia/${id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } catch (e) {
      console.log(e);
      return null;
    }

  }

  public updateStateUser(id: string, status: Number) {
    let methodStatusUser = "";
    switch (status) {
      case statesUser.ACTIVE:
        methodStatusUser = 'ModificarEstadoUsuarioActivo';
        break;
      case statesUser.INACTIVE:
        methodStatusUser = 'ModificarEstadoUsuarioInactivo';
        break;
      case statesUser.PENDING_ACTIVATION:
        methodStatusUser = 'ModificarEstadoUsuarioPendienteActivacion';
        break;
    }
    const params = [];
    const ruta = [this.ApiUrl, this.userUrl, `${methodStatusUser}/${id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public recoveryPassword(email: string) {
    const params = JSON.stringify({
      email: email
    });
    const ruta = [this.ApiUrl, this.userUrl, `RecuperarContrasenia`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public resendTokenValidation(email: string) {
    const params = JSON.stringify({
      email: email
    });
    const ruta = [this.ApiUrl, this.userUrl, `reenviarTokenValidacion`].join('/');
    return this.http.post(ruta, params, { headers: this.headersJson });
  }


  public validateReCaptcha(token: string, secretKey: string) {
    const params = JSON.stringify({
      secret: secretKey,
      response: token
    });
    const ruta = 'https://www.google.com/recaptcha/api/siteverify';
    return this.http.post(ruta, params, { headers: this.headersCaptcha });
    // const ruta = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + token;
    // console.log(ruta);
    // return this.http.get(ruta, { headers: this.headersCaptcha });
    // return this.http.get(ruta);
  }
}
