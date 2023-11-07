export interface CargoHumano {
    activo: string;
    cargo: string;
    cargoClase: string;
    cargoNivel: string;
    cargoTipo: string;
    codCargo: string;
    codCargoClase: string;
    codCargoNivel: string;
    codCargoOficial: string;
    codCargoTipo: string;
    fechaCreacion: string;
    grado: string;
    costo: number;
    esJefeInmediato: string;
    codCargoEmpresa: string;
    cargoEmpresa: string;


    //auxilizares
    codCargoGlobal: string;
    cargoGlobal: string;
    nombreCargo?: string;

    //si codcargoempresa = '' tomar codcargo de lo contrario codcargoEmpresa
    //si cargoempresa = '' tomar cargo de lo contrario cargoEmpresa
    //validar por  1 x 1 y los dos campos tambien



    //preguntar jeanet sobre lugar y dependencia en perfil ok
    //agrega cargotipo a modelo cargo ok
    //codcargotipo == tipocargomodel.codalterno 
    //agregar codacrgotipo a la tabla de asignar cargos ok
    //que hacer si se borra un cargo de humano
    //vista para sync y para eliminar y listar
}