import { User } from './user';
import { Perfil } from './perfil';
import { Convocatoria } from './convocatoria';

export interface ConvocatoriaPerfil {
    id?: string;
    idUsuario: string;
    idConvocatoria: string;
    idPerfil: string;
    lugar: string;
    detallePerfil: string; // guarda el modelo de perfil con las relaciones en formato json

    usuario?: User;
    perfil?: Perfil;
    convocatoria?: Convocatoria;
}