import { TypeFileAnnexed } from "./type-file-annexed";

export interface Annexed {
    id: string;
    idUsuarioModificacion: string;
    idTipoArchivo: string;
    otroArchivo: string;
    idSoporte: string;

    nameTypeFile?: string;
    nameTypeFileAux?: string;

    tipoArchivoModel?: TypeFileAnnexed;
}