import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { PerfilTitulo } from '@app/compartido/modelos/perfil-titulo';
import { PerfilExperiencia } from '@app/compartido/modelos/perfil-experiencia';
import { PerfilEquivalencia } from '@app/compartido/modelos/perfil-equivalencia';
import { CargoHumano } from '@app/compartido/modelos/cargo-humano';
import { Cargo } from '@app/compartido/modelos/cargo';

export interface DetallePerfilModel {
    id?: string;
    activo?: 1;
    cargoHumanoModel?: CargoHumano;
    cargoModel?: Cargo;
    conocimientosHabilidades?: string;
    esGrupo?: number;
    idEmpresa?: string;
    idGradoCargo?: string;
    idTipoCargo?: string;
    idTipoCargoHumano?: string;
    idTipoCompetencia?: string;
    idTipoDependenciaHija?: string;
    idTipoEstudioAdicional?: string;
    idTipoFuncion?: string;
    idTipoGrupo?: string;
    idTipoLugar?: string;
    idTipoSubGrupo?: string;
    idUsuario?: string;
    lstPerfilEquivalencia?: PerfilEquivalencia[];
    lstPerfilExperiencia?: PerfilExperiencia[];
    lstPerfilTitulo?: PerfilTitulo[];
    mision?: string;
    nombreEstudioAdicional?: string;
    responsabilidades?: string;
    tipoEstudioAdicionalOtro?: string;

    tipoLugar?: TypePlace;
    dependenciaHija?: TipoDependenciaHija;

}
