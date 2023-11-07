import { TipoCalificacion } from './tipo-calificacion';
import { TipoEtapa } from './tipo-etapa';
import { TipoPrueba } from './tipo-prueba';
import { TipoFaseModel } from './tipo-fase-model';
import { Etapa } from './etapa';

export interface TipoPruebaEtapaModel {

    etapa: Etapa;
    tipoPrueba?: TipoPrueba;
    tipoFase: TipoFaseModel;
    tipoEtapa?: TipoEtapa;
    tipoCalificacion?: TipoCalificacion;

    idTipoPrueba?: string;
    nombreTipoPrueba?: string;
    nombreTipoPrueba_En?: string;

    idTipoFase?: string;
    nombreFase?: string;
    nombreFase_En?: string;

    idTipoEtapa?: string;
    nombreTipoEtapa?: string;
    nombreTipoEtapa_En?: string;

    idTipoCalificacion?: string;
    nombreTipoCalificacion?: string;
    nombreTipoCalificacion_En?: string;
}
