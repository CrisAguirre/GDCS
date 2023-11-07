import { ConfigAdicional } from './configuracion-adicional';
import { Convocatoria } from './convocatoria';
import { InscripcionAspiranteModel } from './inscripcion-aspirante-model';
import { SoporteModel } from './soporte-model';
import { User } from './user';

export interface ValidacionAdjuntoModel {
    id?: string;
    idInscripcionAspirante: string;
    idUsuario: string;
    idUsuarioModificacion: string;
    idConfigAdicional?: string;
    idConvocatoria: string;
    idSoporte: string;
    validaSoporte: number;
    aplicaAdicional: number;
    observacion: string;

    //aux
    usuario?: User;
    inscripcionAspirante?: InscripcionAspiranteModel;
    soporte?: SoporteModel;
    configAdicional?: ConfigAdicional;
    convocatoria?: Convocatoria;
}

