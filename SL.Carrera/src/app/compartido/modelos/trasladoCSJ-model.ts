import { SoporteTrasladoUsuarioModel } from "./soporte-traslado-usuario-model";

export interface TrasladoCSJModel {
    id?: string;
    idUsuario?: string;
    numDocumentoUsuario?: string;
    numRadicado?: string;
    idTipoTraslado: string;
    fechaSolicitud: string;
    motivoTraslado?: string;
    codigoCargo?: string;
    cargo?: string;
    codigoDespacho?: string;
    despacho?: string;
    codAlternoDependencia?: string;
    modalidad?: string;
    dictamenMedico?: string;
    idUsuarioReciproco?: string;
    numDocumentoUsuarioReciproco?: string;
    calificacionServicioReciproco?: number;
    calificacionServCarrera?: number;
    calificacionServicios?: number;
    idSoportes: string[];

    // campos auxiliares
    soportes?: SoporteTrasladoUsuarioModel[];
    tipoTraslado?: string;
}