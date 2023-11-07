export interface RptHojaVidaModel {
    idUsuario: string;
    idConvocatoriaPerfil: string;
    language?: string;
    reportTitle?: string;
    reportType?: string;
    rptFileName?: string;
    exportExtension?: string;
    dataSets?: string;
}