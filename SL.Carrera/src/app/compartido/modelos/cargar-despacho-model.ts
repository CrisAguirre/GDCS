export interface CargarDespachoModel {
    idUsuarioModificacion: string;
    codigoDespacho: string;
    despacho: string;
    codigoMunicipio: string;
    sede: string;
    codigoSeccional: string;
    seccional: string;
    codigoEspecialidad: string;
    ordenDespacho: number
    especialidad: string;
    codAlterno?: string;
    msgError?: string;
}
