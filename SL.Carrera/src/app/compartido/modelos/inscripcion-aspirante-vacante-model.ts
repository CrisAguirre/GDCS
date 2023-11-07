export interface InscripcionAspiranteVacanteModel {
    id?: string;
    idConvocatoria: string;
    idUsuarioInscrito: string;
    idVacante: string;
    idUsuarioModificacion: string;
    estadoConvocatoria?: number;

    // campos aux
    observaciones?: string;
}
