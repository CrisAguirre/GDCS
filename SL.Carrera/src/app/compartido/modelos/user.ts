import { EmpresaUsuario } from './empresa-usuario';
import { UsuarioRol } from './usuario-rol';
export class User {
    id?: string;
    email: string;
    contrasenia?: string;
    token?: string;
    estadoUsuario: number;
    fechaCreacion?: string;
    fechaModificacion?: string;
    fechaUltimoAcceso?: string;
    cantidadIntentosLogin?: number;
    cuentaSuspendida?: number;
    fechaSuspension?: number;

    // auxiliares
    entradaAdmin?: boolean;
    idEmpresa?: string;
    empresa?: string;
    rol?: string;
    stateUser?: string;
    idRol?: number;

    usuarioRol?: UsuarioRol;
    empresaUsuario?: EmpresaUsuario;

    // campos aux aspirante
    existeEmpleadoTraslado?: boolean;
    numDocumento?: string;
}