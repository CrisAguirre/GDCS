import { Cargo } from './cargo';
import { CargoHumano } from './cargo-humano';
import { PerfilExperiencia } from './perfil-experiencia';
import { PerfilTitulo } from './perfil-titulo';
import { PerfilEquivalencia } from './perfil-equivalencia';
import { TipoDependenciaHija } from './tipo-dependencia-hija';
import { TypePlace } from './type-place';
import { Empresa } from './empresa';

export interface Perfil {
    id?: string;
    idUsuario: string;
    idTipoGrupo?: string;
    idTipoSubGrupo?: string;
    idTipoFuncion?: string;
    idTipoCompetencia?: string;
    idTipoEstudioAdicional?: string;
    idTipoCargo?: string;
    idTipoCargoHumano?: string;
    mision?: string;
    responsabilidades?: string;
    tipoEstudioAdicionalOtro?: string; // revisar
    conocimientosHabilidades?: string;
    nombreEstudioAdicional?: string;
    esGrupo?: number;
    activo: number;
    idGradoCargo?: string;
    idTipoDependenciaHija: string;
    idTipoLugar: string;
    idEmpresa: string;
    codigoAlterno: string;

    //atributos auxiliares
    otroTipoEstudioAdicional?: number;
    codigoCargo?: string;
    cargo?: string;
    grado?: string;
    nivelJerarquico?: string;
    tipoGrupo?: string;
    tipoSubGrupo?: string;
    funcion?: string;
    tipoCompetencia?: string;
    nombreTipoEstudioEqui?: string;
    nombreTipoEstudioAdi?: string;

    //relaciones auxiliares
    cargoModel?: Cargo;
    cargoHumanoModel?: CargoHumano;
    lstPerfilExperiencia?: PerfilExperiencia[];
    lstPerfilTitulo?: PerfilTitulo[];
    lstPerfilEquivalencia?: PerfilEquivalencia[];
    dependenciaHija?: TipoDependenciaHija;
    tipoLugar?: TypePlace;
    empresa?: Empresa;
}