import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class administracionPerfilService extends BaseService {

    constructor(
        protected http: HttpClient) {
        super(http);
    }

    //TipoGrupo
    public getTipoGrupo() {
        const ruta = [this.ApiUrl, this.tipoGrupoUrl, 'ListarTipoGrupo'].join('/');
        return this.http.get(ruta, { headers: this.headersJson });
    }

    public saveTipoGrupo(data: any) {
        const params = JSON.stringify(data);
        if (data.id) {
            const ruta = [this.ApiUrl, this.tipoGrupoUrl, `ModificarTipoGrupo/${data.id}`].join('/');
            return this.http.put(ruta, params, { headers: this.headersJson });
        } else {
            const ruta = [this.ApiUrl, this.tipoGrupoUrl, `CrearTipoGrupo`].join('/');
            return this.http.post(ruta, params, { headers: this.headersJson });
        }
    }
    public deleteTipoGrupo(data: any) {
        const ruta = [this.ApiUrl, this.tipoGrupoUrl, `BorrarTipoGrupo/${data.id}`].join('/');
        return this.http.delete(ruta, { headers: this.headersJson });
    }

    //TipoFuncion
    public getTipoFuncion() {
        const ruta = [this.ApiUrl, this.tipoFuncionUrl, 'ListarTipoFuncion'].join('/');
        return this.http.get(ruta, { headers: this.headersJson });
    }

    public saveTipoFuncion(data: any) {
        const params = JSON.stringify(data);
        if (data.id) {
            const ruta = [this.ApiUrl, this.tipoFuncionUrl, `ModificarTipoFuncion/${data.id}`].join('/');
            return this.http.put(ruta, params, { headers: this.headersJson });
        } else {
            const ruta = [this.ApiUrl, this.tipoFuncionUrl, `CrearTipoFuncion`].join('/');
            return this.http.post(ruta, params, { headers: this.headersJson });
        }
    }
    public deleteTipoFuncion(data: any) {
        const ruta = [this.ApiUrl, this.tipoFuncionUrl, `BorrarTipoFuncion/${data.id}`].join('/');
        return this.http.delete(ruta, { headers: this.headersJson });
    }

    //TipoCompetencia
    public getTipoCompetencia() {
        const ruta = [this.ApiUrl, this.tipoCompetenciaUrl, 'ListarTipoCompetencia'].join('/');
        return this.http.get(ruta, { headers: this.headersJson });
    }

    public saveTipoCompetencia(data: any) {
        const params = JSON.stringify(data);
        if (data.id) {
            const ruta = [this.ApiUrl, this.tipoCompetenciaUrl, `ModificarTipoCompetencia/${data.id}`].join('/');
            return this.http.put(ruta, params, { headers: this.headersJson });
        } else {
            const ruta = [this.ApiUrl, this.tipoCompetenciaUrl, `CrearTipoCompetencia`].join('/');
            return this.http.post(ruta, params, { headers: this.headersJson });
        }
    }
    public deleteTipoCompetencia(data: any) {
        const ruta = [this.ApiUrl, this.tipoCompetenciaUrl, `BorrarTipoCompetencia/${data.id}`].join('/');
        return this.http.delete(ruta, { headers: this.headersJson });
    }

    
}