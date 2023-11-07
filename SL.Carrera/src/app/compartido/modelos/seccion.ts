export interface Seccion {
    id?: string;
    idUsuarioModificacion: string;
    idConvocatoria: string;
    titulo: string;
    descripcion: string;
    idSeccion?: string;
    idEmpresa: string;

    convocatoria?: string;
    nombreConvocatoria?: string;
    nombreSeccion?: string;
    mostrarOpciones?: boolean;
}
