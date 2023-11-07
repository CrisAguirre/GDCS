export class TipoFormulario {
    id: string;
    descripcion: string;
    descripcion_En: string;

    constructor( id: string, descripcion: string, descripcion_En: string ){
        this.id =id;
        this.descripcion= descripcion;
        this.descripcion_En= descripcion_En;
        
    }
} 