import { ReportModel } from './report-model';

export interface AspiranteConvocatoriaReportModel extends ReportModel {
    idConvocatoria?: string;
    idEstado?: string;
}