export interface CargoConvocatoria {
    codCargo: string;
    cargo: string;
    nivelJerarquico: string;
    grado: string;
    idTipoLugar: string;
    tipoLugar: string;
    idDependenciaLugar?: string;
    dependenciaLugar?: string;
    numeroCargosAplicar: number;
    cierreInscripciones: string;
    idPerfil: string;

    /* Campos auxiliares */

    /* Favorito */
    idFavoritoConvocatoria?: string;
    iconoFavorito?: string;

    /* Convocatoria */
    idConvocatoria?: string;
    nombreConvocatoria?: string;
    numeroCargos?: number;

    /* Perfil */
    idTipoCargo?: string;
    idTipoCargoHumano?: string;
    mision?: string;
    idConvocatoriaPerfil?: string;
}
