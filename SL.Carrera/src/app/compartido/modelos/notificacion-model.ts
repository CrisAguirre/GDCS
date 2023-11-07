import { User } from './user';

export interface NotificacionModel {
    id?: string;
    asunto: string;
    mensaje: string;
    esLeido: number;
    idUsuarioDestinatario: string;
    idUsuarioRemitente: string;
    idConvocatoria?: string;
    idEmpresa?: string;
    copiaACorreo?: number;
    fechaRegistro?: string;

    nombreAspirante?: string;
    aspirante?: User;
    nombreConvocatoria?: string;

}
