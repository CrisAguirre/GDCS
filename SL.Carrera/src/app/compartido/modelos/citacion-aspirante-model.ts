import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { DetalleUsuarioModel } from '@app/compartido/modelos/detalle-usuario-model';
export interface CitacionAspiranteModel {
    id?: string;
    idEmpresa: string;
    idConvocatoria: string;
    idTipoPrueba: string;
    idLugarPrueba: string;
    fechaCitacion: string;
    horaCitacion?: string;
    idUsuarioAspirante: string;
    idUsuarioAdmin: string;
    idInscripcionAspirante: string;

    // Campos auxiliares
    inscripcionAspiranteModel?: InscripcionAspiranteModel;
    nombreConvocatoria?: string;
    pruebas?: string;
    ciudad?: string;
    lugarPrueba?: string;
    tipoPrueba?: string;
    usuarioAspirante?: string;
    numeroDocumento?: string;
    detalleUsuario?: DetalleUsuarioModel;
}
