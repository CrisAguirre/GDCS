import { ConvocatoriaPerfil } from './convocatoria-perfil-model';
import { InscripcionAspiranteVacanteModel } from './inscripcion-aspirante-vacante-model';
import { Ciudad } from './ciudad';
import { DetallePerfilModel } from './detalle-perfil-model';

export interface VacanteModel {
    id?: string;
    idConvocatoria: string;
    idUsuarioRegistra: string;
    codigoDespacho: string;
    despacho: string;
    numOrdenDespacho: string;
    distrito: string;
    idMunicipio: number;
    vacanteFuncionario: string;
    cedulaFuncionario: string;
    fechaVacante?: Date;
    situacionActualVacante: string;
    observaciones?: string;

    codigoAlternoPerfil?: string;
    idConvocatoriaPerfil: string;

    anioFechaVacante?: number;
    mesFechaVacante?: number;
    diaFechaVacante?: number;
    fecha?: string;
    tipoVacante: number;

    fechaPosesion?: string;
    idSoportePosesion?: string;
    esTraslado?: number;

    // Campos aux
    convocatoria?: string;
    estadoVacante?: number;
    municipio?: string;
    tieneInscripciones?: number;
    idEmpresa?: string;
    convocatoriaPerfil?: ConvocatoriaPerfil;
    cargoHumano?: string;
    cargo?: string;
    gradoCargo?: string;

    // campos aux para servicio 'obtenerInscripcionesPorConvocatoria (InscripcionAspiranteVacante)
    ciudad?: Ciudad;
    codigoAcuerdo?: string;
    detallePerfil?: string;
    detallePerfilModel?: DetallePerfilModel;
    inscritos?: InscripcionAspiranteVacanteModel[];
    totalInscritos?: number;
    nombreConvocatoria?: string;
    numeroConvocatoria?: string;
}
