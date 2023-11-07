export interface Cronograma {
    id?: string;
    idUsuarioModificacion: string;
    idConvocatoria: string;
    idActividadConvocatoria: string;
    otroActividadConvocatoria: string;
    fechaInicial: string;
    fechaFinal: string;
    esProrroga: number;
    registroActivo: number;
    idReferenciaProrroga: string;
    idSoporteProrroga: string;
    idEmpresa: string;

    convocatoria?: string;
    actividadaConvocatoria?: string;
    referenciaProrroga?: string;
    infoSoporte?: string;

    mostrarBtns?: boolean;
    nombreEmpresa?: string;
}