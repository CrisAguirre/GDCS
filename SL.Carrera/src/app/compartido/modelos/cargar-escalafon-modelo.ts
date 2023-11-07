export interface CargarEscalafonModel {
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








    nombreSeccional?: string;
    nombreCargo?: string;
    nameTypeFileAux?: string;

    idUsuarioAspirante: string;
    idUsuarioAdmin: string;
    msgError?: string;
}
