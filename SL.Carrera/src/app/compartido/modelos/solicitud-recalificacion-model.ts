export interface SolicitudRecalificacionModel {
    id?: string;
    idConvocatoria: string;
    idUsuario: string;
    fechaSolicitud?: Date;
    idSoporteAnterior: string;
    idSoporteNuevo: string;
    // estadoSolicitado: number;
}
