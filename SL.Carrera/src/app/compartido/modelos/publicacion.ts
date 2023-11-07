export interface Publicacion {
    id?: string;
    idUsuarioModificacion: string;
    idCategoria: string;
    nombre: string;
    area: string;
    editorial: string;
    otraCategoria: string;

    nombreCategoria?: string;
}