import { DetallePerfilModel } from './detalle-perfil-model';
import { Despachos } from './despachos';

export interface CargoConDespachoModel {
    idConvocatoriaPerfil: string;
    detallePerfil: string;
    despachos: Despachos[];

    detallePerfilModel?: DetallePerfilModel;
}