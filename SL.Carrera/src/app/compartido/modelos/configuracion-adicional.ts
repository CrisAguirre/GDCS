import { TipoAdicional } from './tipo-adicional';

export interface ConfigAdicional {
    idUsuarioModificacion: string;
    idConvocatoria: string;
    idAdicional: string;
    idTipoAdicional: string;
    puntajeMaximo: number;

    id?: string;
    convocatoria?: string;
    tipoAdicional?: string;
    tipoAdicionalModel?: TipoAdicional;
}
