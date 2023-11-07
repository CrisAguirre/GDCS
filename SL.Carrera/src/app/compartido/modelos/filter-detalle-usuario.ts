export interface FilterDetalleUsuario {
    IdSexos?: string [];
    EdadMin?: number;
    EdadMaxima?: number;
    IdDepartamento?: number;
    IdCiudades?: string [];
    TipoEstudio?: string;
    ModalidadEstudio?: string;
    NivelesEstudio?: string [];
    TitulosObtenidos?: string [];
    IdInstitucion?: number;
    ExpMinima?: number;
    ExpMaxima?: number;
    Cargo?: string;
    Entidad?: string;
    IdSectorExperiencia?: string;
    Page?: number;
    PageSize?: number;
}