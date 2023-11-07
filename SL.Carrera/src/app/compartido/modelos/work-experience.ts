import { SectorExperience } from './sector-experience';
import { TipoExperienciaLaboralModel } from './tipo-experiencia-laboral-model';
export interface WorkExperience {
    idUsuarioModificacion: string;
    cargo: string;
    entidad: string;
    idSectorExperiencia: string;
    idCiudad: number;
    fechaIngreso: string;
    fechaRetiro: string;
    soporte: string;
    esTrabajoActual: number;
    idTipoExperienciaLaboral: string;

    esTrabajoDocencia: number;
    catedra?: string;
    id?: string;
    municipality?: string;
    sector?: string;
    nameSoport?: string;
    archivoSoporte?: any;
    idUsuario?: string;


    sectorExperiencia?: SectorExperience;
    ciudad?: any;
    tipoExperienciaLaboralModel?: TipoExperienciaLaboralModel;
}
