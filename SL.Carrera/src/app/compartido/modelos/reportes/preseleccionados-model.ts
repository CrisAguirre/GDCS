import { ReportModel } from './report-model';

export interface PreseleccionadoModel extends ReportModel {
    idConvocatoria?: string;
    detalle1?: string;
    detalle2?: string;
    nombreFirma?: string;
    cargoFirma?: string;
    despachoFirma?: string;
    nombreCreador?: string;
    tituloCreador?: string;    
    ciudadPiePagina?: string;
}