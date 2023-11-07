import { Pais } from './pais';
export interface Departamento {
    id?: number;
    departamento: string;
    idPais: string;
    pais?: number;

    //aux
    paisModel?: Pais;
}