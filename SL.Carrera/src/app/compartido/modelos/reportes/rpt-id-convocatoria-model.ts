import { ReportModel } from './report-model'
export interface RptIdConvocatoriaModel extends ReportModel {
    idConvocatoria?: string;
}

export interface RptEstadisticaConvocatoriaModel extends ReportModel {
    idConvocatoria?: string;
    fechaInicio?: string;
    fechaFin?: string;
}