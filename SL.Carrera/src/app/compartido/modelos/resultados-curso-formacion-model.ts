import { ProcesoSeleccionModel } from '@app/compartido/modelos/proceso-seleccion-model';
import { DataPersonal } from './data-personal';
import { InscripcionAspiranteModel } from './inscripcion-aspirante-model';

export interface ResultadosCursoFormacionModel {
    id?: string;
    idConvocatoria: string;
    idUsuarioModificacion: string;
    idUsuarioAspirante: string;

    // nuevos campos
    totalCFJI_100?: number;
    pierdeXInasistencia?: number;   // Aspirante pierde por inasistencia
    pierdeXNota?: number;   // Aspirante pierde por nota
    noInscrito?: number;    // Aspirante no inscrito al curso de formación
    esHomologado?: number;  // Aspirante Homologado
    resolucion?: string;    // Resolución
    fechaResolucion?: string;   // Fecha de resolución
    notaConsolidadaHomologacion?: number; // Nota consolidada de homologación
    retiroVoluntario?: number;  // Aspirante retiro voluntario

    // Totales
    /* totalParteGeneral_50?: number;
    totalParteEspecializada_30?: number;
    trabajoInvestigacion_20?: number;
    generalTotalMesa1?: number;
    generalTotalMesa2?: number;
    generalTotalMesa3?: number;
    generalTotalMesa4?: number;
    generalTotalMesa5?: number;
    generalTotalMesa6?: number;
    espTotalMesa7?: number;
    espTotalMesa8?: number;
    espTotalMesa9?: number;
    espTotalMesa10?: number;
    resolucionHomologacion?: string; */

    // Campos auxiliares
    idProcesoSeleccion?: string;
    procesoSeleccionModel?: ProcesoSeleccionModel;
    inscripcionAspiranteModel?: InscripcionAspiranteModel;
    datosPersonales?: DataPersonal;
    idInscripcionAspirante?: string;
    aprueba?: number;   // Aspirante aprueba
    nombres?: string;
    apellidos?: string;
    numeroDocumento?: string;
    /* pierdeNotaGeneral?: number; // Parte general
    pierdeNotaEspecializada?: number;   // Parte especializada */
}
