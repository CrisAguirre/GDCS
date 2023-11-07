import { Convocatoria } from './convocatoria';
import { TipoFaseModel } from './tipo-fase-model';
import { TipoPrueba } from './tipo-prueba';

export interface TipoFasePruebaModel {
    id?: string;
    idConvocatoria: string;
    idFase: string;
    idPrueba: string;

    //aux
    fase?: TipoFaseModel;
    convocatoria?: Convocatoria;
    prueba?: TipoPrueba;
}

