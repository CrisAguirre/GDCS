export interface Empresa {
    id?: string;
    idReferencia?: string;
    nombreEmpresa: string;
    nit: string;
    sLogan?: string;
    email?: string;
    telefono?: number;
    idCiudad?: number;
    direccion?: string;
    logo?: string;
    idUsuarioModificacion: string;
    codAlterno?: string;

    /* Representante legal */
    nombreRepresentante?: string;
    tipoDocumentoRepresentante?: number;
    documentoRepresentante?: number;

    /* Opcionales */
    ciudad?: string;
    idDepartamento?: number;
    departamento?: string;
    idPais?: number;
    pais?: string;
    nombreLogo?: string;

}
