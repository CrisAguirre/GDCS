import { TipoCargo } from './tipo-cargo';
import { Empresa } from './empresa';

export interface Cargo {
    id?: string;
    idUsuarioModificacion: string;
    codAlterno?: string;
    cargo: string;
    cargo_En: string;
    nivelJerarquico?: string;
    idTipoCargo?: string;
    idEmpresa: string;

    // relaciones auxiliares
    tipoCargo?: TipoCargo;
    empresa?: Empresa;
    nombreCargo?: string;
}
