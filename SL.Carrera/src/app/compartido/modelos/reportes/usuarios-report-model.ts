import { ReportModel } from './report-model';

export interface UsuariosReportModel extends ReportModel {
    idUsuario?: string;
    idConvocatoria?: string;
}