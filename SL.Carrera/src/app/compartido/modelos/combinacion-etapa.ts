import { BaseModel } from './base-model';

export interface CombinacionEtapa extends BaseModel {
    id?: string;
    idConvocatoria: string;
    idUsuarioModificacion: string;
    idEtapa: string;
    idTipoPrueba: string;
    //idTipoSubEtapa: string;
    valorMinimo: number;
    valorMaximo: number;

    nombreTipoPrueba?: string;
    //nombreTipoSubEtapa?: string;
    idFake?: number;

}