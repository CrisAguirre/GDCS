import { CategoriaAdmintidoModel } from './categoria-admitido-model';
import { InscripcionAspiranteModel } from './inscripcion-aspirante-model';
import { User } from './user';

export interface AdmitidoAltasCortesModel {
    id?: string;
    idInscripcionAspirante: string;
    idUsuario: string;
    idUsuarioModificacion: string;
    aspiranteAdmitido: number;
    codigoAlterno: string;
    soporte: string;

    // aux
    usuario?: User;
    inscripcionAspirante?: InscripcionAspiranteModel;
}
