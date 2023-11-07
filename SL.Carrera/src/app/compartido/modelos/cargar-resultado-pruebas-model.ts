import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
export interface CargarResultadoPruebasModel {
    idConvocatoria: string;
    idTipoPrueba: string;
    numeroRegistro?: string;
    cedula?: string;
    codigoAlternoPerfil?: string;
    puntajeDirecto?: number;
    media?: number;
    desviacion?: number;
    z?: number;
    mayor_0_5?: number;
    aprueba_0_5?: number;
    mayor_1?: number;
    aprueba_1?: number;
    mayor_1_5?: number;
    aprueba_1_5?: number;
    mayor_2?: number;
    aprueba_2?: number;
    resultadoFinal: number;

    idEmpresa?: string;
    idUsuarioAspirante: string;
    idUsuarioAdmin: string;
    msgError?: string;
    idInscripcionConvocatoria?: string;
    idPerfilConvocatoria?: string;
    tipoPrueba?: TipoPrueba;
}
