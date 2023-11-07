export interface Faq {
    id?: string;
    idCategoria: string;
    idReferencia: string;
    descripcion: string;
    descripcion_En: string;

    nombreCategoria?: string;
    nombrePregunta?: string;
    lstRespuestas?: Faq[];
}