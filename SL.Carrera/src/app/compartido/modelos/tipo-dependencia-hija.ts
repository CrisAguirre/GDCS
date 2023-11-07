import { TypePlace } from './type-place';

export interface TipoDependenciaHija {
    id?: string;
    nombre: string;
    nombre_En: string;
    codAlterno: string;
    idLugar: string;

    //relaciones auxiliares
    tipoLugar?: string;
}