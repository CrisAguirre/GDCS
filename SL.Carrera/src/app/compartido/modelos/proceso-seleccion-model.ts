import { Adicional } from '@app/compartido/modelos/adicional';
import { InscripcionAspiranteModel } from './inscripcion-aspirante-model';
import { Convocatoria } from './convocatoria';
import { BaseModel } from './base-model';
import { TipoPrueba } from './tipo-prueba';
import { ConvocatoriaPerfil } from './convocatoria-perfil-model';
export interface ProcesoSeleccionModel extends BaseModel {
    id?: string;
    idUsuario: string;
    idInscripcionAspirante: string;
    idTipoPrueba: string;
    idConvocatoria: string;
    idConvocatoriaPerfil: string;
    resultadoFinal: number;
    aprobo?: number;
    aplicaCursoFormacion?: number;
    apruebaCursoFormacion?: number;
    pasaEtapaClasificacion?: number;
    puntajeClasificacion?: number;
    pasaListaElegibles?: number;
    puntajeCursoFormacion?: number;
    puntajeClasificacionCursoFormacion?: number;

    // aux
    inscripcionAspiranteModel?: InscripcionAspiranteModel;
    convocatoriaModel?: Convocatoria;
    tipoPruebaModel?: TipoPrueba;
    convocatoriaPerfilModel?: ConvocatoriaPerfil;

    // nuevos campos
    puntajeRecomendadoCap?: number;
    puntajeRecomendadoExp?: number;
    valorRealAdicional?: number;
    valorRealAdicionalCapacitacion?: number;
    totalPuntos?: number;
    adicional?: Adicional;
}
