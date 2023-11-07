import { ConfigAdicional } from './configuracion-adicional';
export interface Adicional {
    idUsuarioModificacion: string;
    idConvocatoria:	string;
    idTipoAdicional: string;
    puntajeMaximo: number;
    idTipoEtapa: string;
    idEmpresa: string;

    id?: string;
    convocatoria?: string;
    tipoAdicional?: string;
    mostrarOpciones?: boolean;
    tipoEtapa?: string;
    nombreEmpresa?: string;
}
