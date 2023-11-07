import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
export interface TipoDocumentoTrasladoModel {
    id?: string;
    idTipoTraslado: string;
    tipoDocumento: string;
    esObligatorio: number;
    codAlterno?: string;

    // Campos aux
    tipoTraslado?: TipoTrasladoModel;
    nombreTipoTraslado?: string;
}
