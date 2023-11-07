import { SoporteModel } from '@app/compartido/modelos/soporte-model';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
export interface SoporteTrasladoModel {
    id?: string;
    idTipoTraslado: string;
    idSoporte: string;

    tipoTraslado?: TipoTrasladoModel;
    soporte?: SoporteModel;
    nombreSoporte?: string;
}
