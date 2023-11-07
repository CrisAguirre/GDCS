export interface LugarPruebas {
    id?: string;
    idUsuarioModificacion: string;
    idEmpresa: string;
    idConvocatoria: string;
    idDepartamento: number;
    idCiudad: number;
    sitio: string;
    direccion: string;
    aula: string;


    /* Campos auxiliares */
    nombreConvocatoria?: string;
    nombreDepartamento?: string;
    nombreCiudad?: string;

    ciudad?: string;
    departamento?: string;
    lugarPrueba?: string;
}
