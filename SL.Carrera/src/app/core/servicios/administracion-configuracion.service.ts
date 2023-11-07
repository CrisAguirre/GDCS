import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})


export class AdministracionConfiguracionService extends BaseService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  // CONFIGURACION
  public saveConfigInformation(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.configUrl, `ModificarConfiguracion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.configUrl, `CrearConfiguracion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  // Nivel de estudio
  public saveLevelStudy(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.levelStudyUrl, `ModificarNivelEstudio/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.levelStudyUrl, `CrearNivelEstudio`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteLevelStudy(data: any) {
    const ruta = [this.ApiUrl, this.levelStudyUrl, `BorrarNivelEstudio/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Modalidad Estudio
  public saveModalidadEstudio(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.modalidadEstudioUrl, `ModificarModalidadEstudio/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.modalidadEstudioUrl, `CrearModalidadEstudio`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public deleteModalidadEstudio(data: any) {
    const ruta = [this.ApiUrl, this.modalidadEstudioUrl, `BorrarModalidadEstudio/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // ector Experiencia
  public saveSectorExperience(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.sectorExperienceUrl, `ModificarSectorExperiencia/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.sectorExperienceUrl, `CrearSectorExperiencia`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteSectorExperience(data: any) {
    const ruta = [this.ApiUrl, this.sectorExperienceUrl, `BorrarSectorExperiencia/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // Actividad personal
  public savePersonalActivity(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.personalActivityUrl, `ModificarActividadPersonal/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.personalActivityUrl, `CrearActividadPersonal`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deletePersonalActivity(data: any) {
    const ruta = [this.ApiUrl, this.personalActivityUrl, `BorrarActividadPersonal/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Area conocimiento
  public saveKnowledgeArea(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.areaKnowledgeUrl, `ModificarAreaConocimiento/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.areaKnowledgeUrl, `CrearAreaConocimiento`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteKnowledgeArea(data: any) {
    const ruta = [this.ApiUrl, this.areaKnowledgeUrl, `BorrarAreaConocimiento/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
  // Frecuencia Actividad
  public saveFrequencyActivity(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.frecuentlyActivityUrl, `ModificarFrecuenciaActividad/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.frecuentlyActivityUrl, `CrearFrecuenciaActividad`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteFrequencyActivity(data: any) {
    const ruta = [this.ApiUrl, this.frecuentlyActivityUrl, `BorrarFrecuenciaActividad/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Instituciones
  public saveInstitution(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.institutionUrl, `ModificarInstitucion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.institutionUrl, `CrearInstitucion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteInstitution(data: any) {
    const ruta = [this.ApiUrl, this.institutionUrl, `BorrarInstitucion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Usuarios
  public saveUser(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.userUrl, `ModificarUsuario/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.userUrl, `CrearUsuario`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }

  public saveInfoUsuario(data: any) {
    const params = JSON.stringify(data);
    const ruta = [this.ApiUrl, this.userUrl, `ModificarInfoUsuario/${data.id}`].join('/');
    return this.http.put(ruta, params, { headers: this.headersJson });
  }

  public deleteUser(data: any) {
    const ruta = [this.ApiUrl, this.userUrl, `BorrarUsuario/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // TipoArchivoAnexo
  public saveTipoArchivoAnexo(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.typeFileAnexedUrl, `ModificarTipoArchivoAnexo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.typeFileAnexedUrl, `CrearTipoArchivoAnexo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoArchivoAnexo(data: any) {
    const ruta = [this.ApiUrl, this.typeFileAnexedUrl, `BorrarTipoArchivoAnexo/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // TipoDiscapacidad
  public saveTipoDiscapacidad(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.tipoDiscapacidadUrl, `ModificarTipoDiscapacidad/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.tipoDiscapacidadUrl, `CrearTipoDiscapacidad`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteTipoDiscapacidad(data: any) {
    const ruta = [this.ApiUrl, this.tipoDiscapacidadUrl, `BorrarTipoDiscapacidad/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  //Categoria publicacion
  public saveCategoriaPublicacion(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.categoriaPublicacionUrl, `ModificarCategoriaPublicacion/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.categoriaPublicacionUrl, `CrearCategoriaPublicacion`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCategoriaPublicacion(data: any) {
    const ruta = [this.ApiUrl, this.categoriaPublicacionUrl, `BorrarCategoriaPublicacion/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Estado aspirante convocatoria
  public saveEstadoAspiranteConvocatoria(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, `ModificarEstadoAspiranteConvocatoria/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, `CrearEstadoAspiranteConvocatoria`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteEstadoAspiranteConvocatoria(data: any) {
    const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, `BorrarEstadoAspiranteConvocatoria/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  public getEstadoAspiranteConvocatoriaById(id: any) {
    const ruta = [this.ApiUrl, this.aspiranteConvocatoriaUrl, `ObtenerEstadoAspiranteConvocatoriaPorId/${id}`].join('/');
    return this.http.get(ruta, { headers: this.headersJson });
  }

  // TipoInstructivo
  public saveInstructivo(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.instructivoUrl, `ModificarInstructivo/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.instructivoUrl, `CrearInstructivo`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteInstructivo(data: any) {
    const ruta = [this.ApiUrl, this.instructivoUrl, `BorrarInstructivo/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // CategoriaFaq
  public saveCategoriaFaq(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.categoriaFaqUrl, `ModificarCategoriaFaq/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.categoriaFaqUrl, `CrearCategoriaFaq`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCategoriaFaq(data: any) {
    const ruta = [this.ApiUrl, this.categoriaFaqUrl, `BorrarCategoriaFaq/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // preguntaFaq
  public savePreguntaFaq(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.faqUrl, `ModificarFaq/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.faqUrl, `CrearFaq`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deletePreguntaFaq(data: any) {
    const ruta = [this.ApiUrl, this.faqUrl, `BorrarFaq/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // respuestaFaq
  public saveRespuestaFaq(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.faqUrl, `ModificarFaq/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.faqUrl, `CrearFaq`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteRespuestaFaq(data: any) {
    const ruta = [this.ApiUrl, this.faqUrl, `BorrarFaq/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Categoria video tutorial
  public saveCategoriaVideoTutorial(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.categoriaVideoTutorialUrl, `ModificarCategoriaVideoTutorial/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.categoriaVideoTutorialUrl, `CrearCategoriaVideoTutorial`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteCategoriaVideoTutorial(data: any) {
    const ruta = [this.ApiUrl, this.categoriaVideoTutorialUrl, `BorrarCategoriaVideoTutorial/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }

  // Video tutorial
  public saveVideoTutorial(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.videoTutorialUrl, `ModificarVideoTutorial/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.videoTutorialUrl, `CrearVideoTutorial`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteVideoTutorial(data: any) {
    const ruta = [this.ApiUrl, this.videoTutorialUrl, `BorrarVideoTutorial/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }


  // Vista
  public saveVista(data: any) {
    const params = JSON.stringify(data);
    if (data.id) {
      const ruta = [this.ApiUrl, this.vistaUrl, `ModificarVista/${data.id}`].join('/');
      return this.http.put(ruta, params, { headers: this.headersJson });
    } else {
      const ruta = [this.ApiUrl, this.vistaUrl, `CrearVista`].join('/');
      return this.http.post(ruta, params, { headers: this.headersJson });
    }
  }
  public deleteVista(data: any) {
    const ruta = [this.ApiUrl, this.vistaUrl, `BorrarVista/${data.id}`].join('/');
    return this.http.delete(ruta, { headers: this.headersJson });
  }
}
