import { Departamento } from './departamento';
export interface Ciudad {
    id?: number;
    ciudad: string;
    codAlterno: number;
    idDepartamento: number;
    departamento?: string;

    //aux
    departamentoModel?: Departamento;

}