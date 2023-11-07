import { RolVista } from './rol-vista';

export interface Vista {
    id?: string;
    nombreRuta: string;
    nombreVista: string;
    idReferencia: string;

    nombreVistaAux?: string;
    referenciaPadre?: Vista;
    hijosVista?: Vista[];
    rolVista?: RolVista;
    pathComplete?: string;
}

// export class TodoItemNode {
//     children: TodoItemNode[];
//     item: string;
//     type: any;
// }

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    item: string;
    path: string;
    info: string;
    level: number;
    expandable: boolean;
}