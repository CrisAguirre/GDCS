import { ReportModel } from "./report-model";

export interface ReporteTrasladosModel extends ReportModel {
    fechaInicial?: string;
    fechaFinal?: string;
}