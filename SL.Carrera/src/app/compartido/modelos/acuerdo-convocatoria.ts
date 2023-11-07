export interface AcuerdoConvocatoria {
    id?: string;
    idUsuarioModificacion: string;
    idConvocatoria: string;
    idTipoAjusteAcuerdo: string;
    numeroAcuerdo: string;
    fechaAcuerdo: string;
    idSoporteAcuerdo?:	string;
    observaciones?:	string;
    vigente?: number;
    idEmpresa: string;

    convocatoria?: string;
    numeroConvocatoria?: string;
    idTipoConvocatoria?: string;
    nombreTipoConvocatoria?: string;
    tipoAjusteAcuerdo?: string;
    nombreEmpresa?: string;
}