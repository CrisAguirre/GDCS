import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';

export interface LevelStudy {
    id?: string;
    modalidad: string;
    nivelEstudio: string;
    nivelEstudio_En: string;
    codTipoEstudio: string;
    codModalidadAcademica: number;
    codNivelEducacion: number;
    tipoEstudio: string;
    orden: number;
    aplicaTarjetaProfesional: number;
    idModalidad: string;
    modalidadEstudio: string;

    nombreModalidad?: string;
    nombreTipoEstudio?: string;

}