import { LevelStudy } from './level-study';
import { AreaConocimiento } from './area-conocimiento';
export interface AcademicInformation {
    idUsuarioModificacion: string;
    idAreaConocimiento: number;
    idNivelEstudio: string;
    idInstitucion: number;
    numSemestresAprobados: number;
    esGraduado: number;
    idTipoTituloObtenido: string;
    fechaGrado: string;
    tarjetaProfesional: string;
    anio: string;
    horas: string;
    soporte: string;
    fechaExpedicionTarjeta: string;
    tituloFueraPais:number;
    idSoporteTituloFueraPais: string;

    id?: string;
    educationLevel?: string;
    institution?: string;
    grade?: number;
    areaKnowledge?: string;
    nameSoport?: string;
    tipoTituloObtenido?: string;

    idModalidadEstudio?: string;
    modalidadEstudio?: string;
    modalidadEstudio_En?: string;

    idTipoEstudio?: string;
    tipoEstudio?: string;
    tipoEstudio_En?: string;

    idUsuario?: string;
    nivelEstudio?: LevelStudy;
    areaConocimiento?: AreaConocimiento;

    tituloObtenidoInformal: string;
    soporteTituloFueraPaisModel?:any;


}

