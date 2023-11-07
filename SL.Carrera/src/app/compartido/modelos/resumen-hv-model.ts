import { DataPersonal } from './data-personal';
import { ApproveData } from './approve-data';
import { AcademicInformation } from './academic-information';
import { WorkExperience } from './work-experience';
import { WorkExperienceRama } from './work-experience-rama';
import { ActividadPersonal } from './actividad-personal';
import { FamilyInformation } from './family-information';

export interface ResumenHVModel {
    idUsuario: string;
    datosPersonales: DataPersonal;
    datosAprobatorios: ApproveData;
    escalafon: string;
    experienciasLaborales: WorkExperience[];
    experienciasLaboralesRama: WorkExperienceRama[];
    informacionesAcademicas: AcademicInformation[];
    informacionActividades: ActividadPersonal[];
    informacionActividadObservacion: any;
    informacionFamiliares: FamilyInformation[];
    mensaje: any;
}
