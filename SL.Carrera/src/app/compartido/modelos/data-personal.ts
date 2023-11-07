import { TypeDocument } from './type-document';
import { Ciudad } from './ciudad';
import { EstadoCivil } from './estado-civil';
import { Genero } from './genero';


export interface DataPersonal {
    id: string;
    idUsuarioModificacion: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    idGenero: string;
    idSexo: string;
    idTipoDocumento: number;
    numeroDocumento: string;
    idLugarExpedicionDocumento: number;
    nacionalidad: string;
    fechaNacimiento: string;
    idLugarNacimiento: number;
    claseLibretaMilitar: string;
    numeroLibretaMilitar: string;
    distritoLibretaMilitar: string;
    idGrupoSanguineo: string;
    idEstadoCivil: number;
    direccionCorrespondencia: string;
    idCiudadCorrespondencia: number;
    telefono: string;
    nombreContactoEmergencia: string;
    direccionContactoEmergencia: string;
    telefonoContactoEmergencia: string;
    idParentesco: string;
    fechaExpedicionDocumento: string;
    soporteIdentificacion?: string;
    soporteLibretaMilitar?: string;
    soporteDeclaracion?: string;
    tieneDiscapacidad: string;
    porcentajeDiscapacidad: number;
    idTipoDiscapacidad: string;
    discapacidad: string;
    idUsuario?: string;
    
    
    // aux
    detailFileIdentification?: any;
    detailFileMilitarydCard?: any;
    
    tipoDocumento?: TypeDocument;
    ciudad_LugarExpedicionDocumento?: Ciudad;
    grupoSanguineo?: any;
    estadoCivil?: EstadoCivil;
    genero?: Genero;
    tipoDiscapacidad?: any;
    fechaRegistro?: string;
    fechaModificacion?: string;
    visibilidadRegistro?: number;
}

