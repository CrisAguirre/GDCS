export interface CuentaUsuarioAdmin {
    id?: string;
    nombres: string;
    apellidos: string;
    idTipoDocumento: number;
    documento: string;
    fechaNacimiento: string;
    telefono?: string;
    direccion?: string;
    idUsuarioModificacion: string;
    idUsuario: string;
}