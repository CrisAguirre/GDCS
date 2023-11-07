import { CategoriaAdmintidoModel } from './categoria-admitido-model';
import { InscripcionAspiranteModel } from './inscripcion-aspirante-model';
import { User } from './user';

export interface AspiranteAdmintidoModel {
    id?: string;
    idInscripcionAspirante: string;
    idUsuario: string;
    idUsuarioModificacion: string;
    idCategoriaNoAdmitidos: string;
    otraCategoria: string;
    aspiranteAdmitido: number;
    observacion: string;

    // aux
    idConvocatoria?: string;
    usuario?: User;
    nombreCompletoUsuario?: string;
    lstCategoriaAdmitidos?: CategoriaAdmintidoModel[];
    inscripcionAspirante?: InscripcionAspiranteModel;
}
