import { ResumenHVModel } from './resumen-hv-model';
import { ConvocatoriaPerfil } from './convocatoria-perfil-model';
import { EstadoAspiranteComvocatoria } from './estado-aspirante-convocatoria';
import { CargoHumano } from './cargo-humano';
import { Convocatoria } from './convocatoria';
import { DetallePerfilModel } from './detalle-perfil-model';
import { Cargo } from './cargo';
import { SolicitudRecalificacionModel } from './solicitud-recalificacion-model';
import { ValidacionAdjuntoModel } from './validacion-adjunto-model';
export interface InscripcionAspiranteModel {
    id?: string;
    idConvocatoria: string;
    idUsuario: string;
    idConvocatoriaPerfil: string;
    resumenHV: string;
    idSoporte: string;
    idUsuarioModificacion: string;
    idEstadoAspirante?: string;
    resumenRecalificacionHV?: string;
    idSolicitudRecalificacion?: string;
    idSoporteRecalificacionHV?: string;
    fechaRecalificacionHV?: string;

    /* Campos auxiliares */
    resumenHVModel?: ResumenHVModel;
    resumenRecalificacionHVModel?: ResumenHVModel;
    convocatoriaPerfilModel?: ConvocatoriaPerfil;
    estadoAspiranteModel?: EstadoAspiranteComvocatoria;
    convocatoria?: Convocatoria;
    convocatoriaPerfil?: ConvocatoriaPerfil;
    estadoAspirante?: string;
    fechaRegistro?: string;
    fechaModificacion?: string;
    soporte?: string;
    idSoporteAclaracionesModificaciones?: string;
    detallePerfilModel?: DetallePerfilModel;
    /* cargo?: Cargo;
    cargoHumano?: CargoHumano; */
    cargo?: string;
    cargoHumano?: string;
    solicitudRecalificacionModel?: SolicitudRecalificacionModel;
    estadoSolicitudRecalificacion?: string;
    estadoSolicitudRecalificacionNum?: number;

    fechasRecalificacion?: any[];
    fechaInicioRecalificacion?: string;
    fechaFinRecalificacion?: string;
    lstFechasRecalificacion?: string[];

    fechasSeleccionVacantes?: any[];
    fechaInicioInscripcionVacante?: string;
    fechaFinInscripcionVacante?: string;
    enPosesion?: number;
    pasaListaElegibles?: number;
    orden?: number;

    // campos para declinación
    existeDeclinacion?: boolean;
    fechaDeclinacion?: string;
    tieneInscripcionAVacante?: boolean;

    verificado?: ValidacionAdjuntoModel;
    esVerificado?: boolean;
}
