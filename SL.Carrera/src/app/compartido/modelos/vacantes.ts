import { DetallePerfilModel } from './detalle-perfil-model';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
export interface Vacantes {
    id?: string;
    idConvocatoria: string;
    idUsuarioRegistra: string;
    codigoDespacho: string;
    despacho: string;
    numOrdenDespacho: number;
    distrito: string;
    idMunicipio: number;
    vacanteFuncionario: string;
    cedulaFuncionario: string;
    fechaVacante: string;
    situacionActualVacante: string;
    observaciones: string;
    tipoVacante: number;
    estadoVacante: number;
    idConvocatoriaPerfil: string;

    convocatoriaPerfil?: ConvocatoriaPerfil;
    detallePerfil?: DetallePerfilModel;
    idEmpresa?: string;
    nombreMunicipio?: string;
    nombreDepartamento?: string;
    nombePais?: string;
    nombreEmpresa?: string;
}