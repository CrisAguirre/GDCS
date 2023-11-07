import { Convocatoria } from './convocatoria';
import { Empresa } from './empresa';
import { TituloObtenido } from './titulo-obtenido';
import { User } from './user';
export interface RequisitosConvocatoriaModel {
    id?: string;
    nacionalidad: string;
    idTitulosAcademicos: string;
    experienciaAnios: number;
    experienciaMeses: number;
    edadMin: number;
    edadMax: number;
    idConvocatoria: string;
    idEmpresa: string;
    idUsuario: string;
    idUsuarioModificacion: string;

    // auxiliares
    convocatoria?: Convocatoria;
    empresa?: Empresa;
    usuario?: User;
    lstTituloAcademicos?: TituloObtenido[];
}
