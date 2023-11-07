import { TipoCargo } from './tipo-cargo';
import { TypeSede } from './type-sede';
import { TypeConvocatory } from './type-convocatory';
import { TypePlace } from './type-place';

export interface Convocatoria {
    id?: string;
    idUsuarioModificacion: string;
    nombreConvocatoria: string;
    numeroConvocatoria: string;
    idTipoConvocatoria: number;
    idTipoSede: string;
    idTipoCargo: string;
    idTipoLugar: string;
    numeroCargosAplicar: number;
    numeroCargos?: number;
    codigoAcuerdo: string;
    fechaAcuerdo: string;
    idSoporteAcuerdo: string;
    idSoporteInstructivoInscripcion?: string;
    estadoConvocatoria: number;
    idEmpresa: string;
    fechaInicial: string;
    fechaFinal: string;
    tipoModelo: number;
    // idSoporteProrroga: string;

    // atributos auxiliares
    nombreTipoConvocatoria?: string;
    nombreTipoSede?: string;
    nombreTipoCargo?: string;
    nombreTipoLugar?: string;
    nombreSoporteAcuerdo?: string;
    nombreEmpresa?: string;

    mostrar?: boolean;

    // relaciones auxiliares
    tipoCargo?: TipoCargo;
    tipoSede?: TypeSede;
    tipoConvocatoria?: TypeConvocatory;
    lstTipoLugar?: TypePlace[];

    // campos auxiliares para inscripcion
    porcentaje?: string;
    porcentajeTotal?: number;
    porcentajeInsHV?: number;
    tieneInscripciones?: number;
    cronogramaInscripcion?: any[];

    fechaInicioRecalificacion?: string;
    fechaFinRecalificacion?: string;


    //retiro magistrado

    nombresServidorRetirado?: string;
    apellidosServidorRetirado?: string;
    cedulaServidorRetirado?: string;
    observacionesServidorRetirado?: string;
    idSoporteInvitacionPublica?: string;

}
