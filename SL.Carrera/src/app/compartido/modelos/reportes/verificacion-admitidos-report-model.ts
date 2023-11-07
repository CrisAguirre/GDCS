import { ReportModel } from './report-model';

export interface VerficicacionAdmitidosReportModel extends ReportModel {
    idUsuario?: string;
    idConvocatoria?: string;
}
