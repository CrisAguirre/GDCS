import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CurriculumVitaeService extends BaseService {
  
  constructor(protected http: HttpClient) {
    super(http);
  }

  // DATOS PERSONAL
  public getPersonalData(idUsuario: string) {
    const ruta = [this.ApiUrl, this.personalDataUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public validateIdentification(data: any, id?: string) {
    const params = JSON.stringify(data);
    let ruta;
    if (id) {
      ruta = [this.ApiUrl, this.personalDataUrl, `ValidarDocumentoConId/${id}`].join('/');
    } else {
      ruta = [this.ApiUrl, this.personalDataUrl, `ValidarDocumento`].join('/');
    }
    return this.http.post(ruta, params, { headers: this.headersJson });
  }

  public saveDataPersonal(dataPersona: any) {
    const params = JSON.stringify(dataPersona);
    if (dataPersona.id) {
      const ruta = [this.ApiUrl, this.personalDataUrl, `ModificarDatosPersonales/${dataPersona.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.personalDataUrl, `CrearDatosPersonales`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }


  // INFORMACION FAMILIAR
  public getFamilyInformation(idUsuario: string) {
    const ruta = [this.ApiUrl, this.familyInformationUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveFamilyInformation(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.familyInformationUrl, `ModificarInformacionFamiliar/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.familyInformationUrl, `CrearInformacionFamiliar`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteInformationFamily(data: any) {
    const ruta = [this.ApiUrl, this.familyInformationUrl, `BorrarInformacionFamiliar/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });

  }

  // INFORMACION ACADEMICA
  public getAcademicInformation(idUsuario: string) {
    const ruta = [this.ApiUrl, this.academicInformationUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveAcademicInformation(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.academicInformationUrl, `ModificarInformacionAcademica/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.academicInformationUrl, `CrearInformacionAcademica`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteAcademicInformation(data: any) {
    const ruta = [this.ApiUrl, this.academicInformationUrl, `BorrarInformacionAcademica/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });

  }

  // EXPERIENCIA LABORAL 
  public getWorkExperience(idUsuario: string) {
    const ruta = [this.ApiUrl, this.workExperienceUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveWorkExperience(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.workExperienceUrl, `ModificarExperienciaLaboral/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.workExperienceUrl, `CrearExperienciaLaboral`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteWorkExperience(data: any) {
    const ruta = [this.ApiUrl, this.workExperienceUrl, `BorrarExperienciaLaboral/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }


  // EXPERIENCIA LABORAL RAMA
  public getWorkExperienceRama(idUsuario: string) {
    const ruta = [this.ApiUrl, this.workExperienceRamaUrl, `ListarPorUsuario/${idUsuario}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveWorkExperienceRama(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.workExperienceRamaUrl, `ModificarExperienciaLaboralRama/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.workExperienceRamaUrl, `CrearExperienciaLaboralRama`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteWorkExperienceRama(data: any) {
    const ruta = [this.ApiUrl, this.workExperienceRamaUrl, `BorrarExperienciaLaboralRama/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }



  //INFORMACION ACTIVIDADES
  public getActivityInformationByUser(idUser: string) {
    const ruta = [this.ApiUrl, this.activityInformationUrl, 'ListarPorUsuario', idUser].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveActivityInformation(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.activityInformationUrl, `ModificarInformacionActividad/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.activityInformationUrl, `CrearInformacionActividad`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteActivityInformation(data: any) {
    const ruta = [this.ApiUrl, this.activityInformationUrl, `BorrarInformacionActividad/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //ANEXOS
  public getAnnexesByUser(idUser): Observable<any> {
    const ruta = [this.ApiUrl, this.annexedUrl, `ListarPorUsuario/${idUser}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveAnnexed(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.annexedUrl, `ModificarAnexo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.annexedUrl, `CrearAnexo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteAnexo(id: any) {
    const ruta = [this.ApiUrl, this.annexedUrl, `BorrarAnexo/${id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //OBSERVACION ACTIVIDAD
  public getObervatioActivityInformationByUser(idUser: string) {
    const ruta = [this.ApiUrl, this.activityObservationUrl, 'ListarPorUsuario', idUser].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  public saveObervatioActivityInformation(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.activityObservationUrl, `ModificarInformacionActividadObservacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.activityObservationUrl, `CrearInformacionActividadObservacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

}
