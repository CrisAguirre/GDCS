import { LevelStudy } from './level-study';
import { SectorExperience } from './sector-experience';
export interface DetalleUsuarioInfoAcademicaModel {
    idTipoEstudio?: string;
    idModalidadEstudio?: string;
    idNivelEstudio?: string;
    idTipoTituloObtenido?: null;// verificar de que tipo es,
    idInstitucion?: number;

    nivelEstudioModel?: LevelStudy;
}

export interface DetalleUsuarioExpLaboral {
    aniosExp?: number;
    cargo?: string;
    entidad?: string;
    idSectorExperiencia?: string;

    sectoExperienciaModel?: SectorExperience;
}
export interface DetalleUsuarioModel {
    idUsuario?: string;
    numeroDocumento?: string;
    nombre?: string;
    apellido?: string;
    tieneDiscapacidad?: string;
    discapacidad?: null; // verificar de que tipo es,
    idSexo?: string;
    edad?: number;
    idCiudad?: number;
    idDepartamento?: number;
    infoAcademica?: DetalleUsuarioInfoAcademicaModel[];
    expLaboral?: DetalleUsuarioExpLaboral[];
    expLaboralRama?: [];

    detalleNivel?: string;
}


