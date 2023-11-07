import { TipoFaseModel } from './tipo-fase-model';
import { BaseModel } from './base-model';
export interface Etapa extends BaseModel {
    id?: string;
    idUsuarioModificacion: string;
    idConvocatoria: string;
    idTipoCalificacion: string;
    idTipoEtapa: string;
    idTipoPrueba: string;
    //idTipoSubEtapa: string;
    puntajeMaximo: number;
    valorMinimo: number;
    valorMaximo: number;
    idEmpresa: string;
    idTipoFase: string;

    nombreConvocatoria?: string;
    tipoCalificacion?: string;
    tipoPrueba?: string;
    tipoEtapa?: string;
    tipoSubEtapa?: string;
    tipoFase?: TipoFaseModel;

    mostrarBtns?: boolean;
}
