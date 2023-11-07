export interface CargarResultadoCursoFormacionModel {
    idConvocatoria: string;
    cedula: string;
    nombres?: string;
    apellidos?: string;
    totalCFJI_100?: number;
    pierdePorInasistencia?: number;
    pierdePorNota?: number;
    esHomologado?: number;
    noInscrito?: number;
    retiroVoluntario?: number;
    resolucion?: string;
    fechaResolucion?: string;
    notaConsolidadaHomologacion?: number;
    
    // Campos aux
    idEmpresa?: string;
    idUsuario?: string;
    msgError?: string;
    idResultadoCursoFormacion?: string;
    fechaResolucionStr?: string;
}