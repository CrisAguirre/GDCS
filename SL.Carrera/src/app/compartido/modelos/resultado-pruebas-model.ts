import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { TipoPrueba } from './tipo-prueba';
export interface ResultadoPruebasModel {
    id?: string;
    idConvocatoria: string;
    idTipoPrueba?: string;
    cargo: string;
    resultadoFinal: number;
    idUsuarioAspirante: string;
    idInscripcionAspirante: string;
    idUsuarioModificacion: string;
    idConvocatoriaPerfil?: string;
    /* pruebaActitud?: number;
    pruebaConocimientos?: number;
    pruebaConocimientosEsp?: number; */

    // Nuevos campos
    numeroRegistro?: string;
    puntajeDirecto?: number;
    media?: number;
    desviacion?: number;
    z?: number;
    mayor_0_5?: number;
    aprueba_Mayor_0_5?: number;
    mayor_1?: number;
    aprueba_Mayor_1?: number;
    mayor_1_5?: number;
    aprueba_Mayor_1_5?: number;
    mayor_2?: number;
    aprueba_Mayor_2?: number;


    // aux
    inscripcionAspiranteModel?: InscripcionAspiranteModel;
    convocatoria?: string;
    nombreAspirante?: string;
    identificacionAspirante?: string;
    tipoPrueba?: string;
    apruebaPuntaje?: string;
    tipoPruebaModel?: TipoPrueba;
}
