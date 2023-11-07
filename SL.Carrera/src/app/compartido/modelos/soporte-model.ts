import { User } from './user';

export interface SoporteModel {
    id?: string;
    nombreSoporte: string;
    modulo: string;
    nombreAuxiliar: string;
    idUsuarioModificacion: string;
    ruta: string;

    usuarioModifica?: User;
}
