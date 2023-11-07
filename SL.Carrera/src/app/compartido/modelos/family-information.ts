export interface FamilyInformation {

    idUsuarioModificacion: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    idGenero?: string;
    idSexo: string;
    idParentesco: string;
    fechaNacimiento: string;
    otroParentesco: string;
    dependeEconomicamente:number;

    id?:string;
    sex?: string;
    relationship?: string;
}