export interface RptHojaVidaV2Model {
    idUsuario: string;
    idConvocatoriaPerfil: string;
    idInscripcion: string;
    language?: string;
    reportTitle?: string;
    reportType?: string;
    rptFileName?: string;
    exportExtension?: string;
    dataSets?: string;
}