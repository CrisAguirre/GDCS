import { DetallePerfilModel } from './detalle-perfil-model';
export interface PerfilPorConvocatoriaModel {
    inicioInscripciones: string;
    cierreInscripciones: string;
    idConvocatoria: string;
    idConvocatoriaPerfil: string;
    idPerfil: string;
    lugar?: string;
    nombreConvocatoria: string;
    numeroCargos: number;
    numeroCargosAplicar: number;
    detallePerfil: string;
    detallePerfilModel?: DetallePerfilModel;

    /* Campos auxiliares */
    esFavorito?: number;
    idFavoritoConvocatoria?: string;
    iconoFavorito?: string;

    tieneInscripciones?: number;
}
