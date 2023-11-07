export interface RolVista {
    id?: string;
    permiteCrear: number;
    permiteLectura: number;
    permiteActualizar: number;
    permiteEliminar: number;
    persmisosEspeciales: string;
    idVista: string;
    idRol: number;

    nombreRol?: string;
    nombreRuta?: string;
    nombreVista?: string;
    idEmpresa?: string;
    nombreEmpresa?: string;
}