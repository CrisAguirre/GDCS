import { Cargo } from './cargo';
import { Perfil } from './perfil';
export interface DataDialogCargos {
    lstPerfiles?: Perfil[];
    lstPerfilesSelected?: Perfil[];
    resultDataSelected?: Perfil[];
    cargoHumano?: boolean;
}