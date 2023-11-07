import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class ProducionService extends BaseService {
  constructor(protected http: HttpClient) {
    super(http);
  }

  //Registrar publicacion
  public getPublicacion() {
    const ruta = [this.ApiUrl, this.publicacionUrl, 'ListarTodosPublicaciones'].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public getPublicacionUsuario(idUser: string) {
    const ruta = [this.ApiUrl, this.publicacionUrl, `ListarPorUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public savePublicacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.publicacionUrl, `ModificarPublicacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.publicacionUrl, `CrearPublicacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deletePublicacion(data: any) {
    const ruta = [this.ApiUrl, this.publicacionUrl, `BorrarPublicacion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

}