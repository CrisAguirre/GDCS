import { ReportModel } from './report-model';

export interface ElegiblesAltasCortesModel extends ReportModel {
    idConvocatoria?: string;
    acuerdo?: string;
    fechaAcuerdo?: string;
    informacionElegible?: string;
    informacionAcuerdo?: string;
    articuloPrincipal?: string;
    articuloSecundario?: string;
    informacionPublicacion?: string;
    nombreFirma?: string;
    cargoFirma?: string;    
}