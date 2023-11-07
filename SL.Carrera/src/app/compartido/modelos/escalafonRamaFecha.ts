export interface EscalafonRamaFecha {
    id?: string;
    idUsuarioModificacion: string;
    numDocumento: string;
    nombreCompleto: string;
    idSeccional: string;
    novedad: string;
    resolucion: string;
    codigoAlternoPerfil: string;
    despacho: string;
    orden: string;
    sede: string;
    radicadoSigobius: string;
    
    ///Resolucion
    anioFechaResolucion: number;
    mesFechaResolucion: number;
    diaFechaResolucion: number;
    
    ///Posesion
    anioFechaPosesion: number;
    mesFechaPosesion: number;
    diaFechaPosesion: number;

    ///Retiro
    anioFechaRetiro: number;
    mesFechaRetiro: number;
    diaFechaRetiro: number;

    ///FechaRadicado
    anioFechaRadicadoSigobius: number;
    mesFechaRadicadoSigobius: number;
    diaFechaRadicadoSigobius: number;

    ///FechaGrabacion
    anioFechaGrabacion: number;
    mesFechaGrabacion: number;
    diaFechaGrabacion: number;

    idSoporte?: string;

    msgError?: string;
}