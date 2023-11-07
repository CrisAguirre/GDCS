import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
export interface CargarCitacionModel {
    idConvocatoria: string;
    idEmpresa?: string;
    idLugarPrueba: string;
    fechaPrueba: string;
    horaPrueba: string;
    idTipoPrueba: string;
    identificacionAspirante: string;
    idUsuarioAspirante: string;
    idUsuarioAdmin: string;
    idInscripcionAspirante: string;
    codigoAlternoPerfil: string;

    msgError?: string;
    idInscripcionConvocatoria?: string;
    idPerfilConvocatoria?: string;
    tipoPrueba?: TipoPrueba;
    
    // aux
    fechaPruebaStr?: string;
}
