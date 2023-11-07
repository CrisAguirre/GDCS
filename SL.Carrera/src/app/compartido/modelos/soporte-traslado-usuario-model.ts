import { TipoDocumentoTrasladoModel } from '@app/compartido/modelos/tipo-documento-traslado-model';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { TrasladoCSJModel } from '@app/compartido/modelos/trasladoCSJ-model';
import { SoporteModel } from '@app/compartido/modelos/soporte-model';
export interface SoporteTrasladoUsuarioModel {
    id?: string;
    idTraslado: string;
    idTipoTraslado?: string;
    idSoporte: string;
    idUsuario: string;

    // Campos auxiliares
    soporte?: SoporteModel;
    traslado?: TrasladoCSJModel;
    tipoTraslado?: TipoTrasladoModel;
    
    idTipoDocumentoTraslado?: string;
    tipoDocumentoTraslado?: TipoDocumentoTrasladoModel;
    nombreTipoDocumentoTraslado?: string;
}