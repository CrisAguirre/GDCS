import { TipoReporteExtModel } from '@app/compartido/modelos/tipo-reporte-ext-model';

export enum statesUser {
  INACTIVE = 0,
  PENDING_ACTIVATION = 1,
  ACTIVE = 2,
  FORCE_CHANGE_PASSWORD = 4
}

export enum statusResponse {
  _400 = 400,
  _404 = 404,
  _200 = 200
}

export enum configMsg {
  WELCOME_MESSAGE = 'MensajeBienvenida',
  PORTAL_NAME = 'NombrePortal',
  TIEMPO_INACTIVIDAD_SESION_MIN = 'TiempoInactividadSesion',
  HABEAS_DATA_MESSAGE = 'MensajeHabeasData',
  POLITICA_PRIVACIDAD_MESSAGE = 'MensajePoliticaPrivacidad',
  POLITICA_COOKIE_MESSAGE = 'MensajePoliticaCookie',
  CONFIRMATION_REGISTER_MESSAGE = 'MensajeConfirmacionRegistroWeb',
  AUTORIZATION_MESSAGE = 'MensajeAutorizacion',
  ALLOW_EXTENSIONS = 'ExtensionesPermitidas',
  EXTENSIONES_PERMITIDAS_RESOLUCIONES = 'ExtensionesPermitidasResoluciones',
  SIZE_FILE = 'TamanioSoportes',
  SIZE_FILE_SIGN = 'TamanioSoportesFirma',
  USER = 'USER',
  ALLOW_EXTENSIONS_SIGN = 'ExtensionesPermitidasFirma',
  MAX_YEAR_REGISTER = 'AnioMaximoIngresoDP',
  MIN_YEAR_REGISTER = 'AnioMinimoIngresoDP',
  ONLY_CLASIFICATION_ADITIONAL = 'VerSoloClasificacionAdicional',
  ID_PARAMETRO_ADICIONAL_CAPACITACION = 'IdParametroAdicionalCapacitacion',
  ID_PARAMETRO_ADICIONAL_EXPERIENCIA = 'IdParametroAdicionalExperiencia',
  VISTAS_ROL_USUARIO = 'RolVistasUsuario',
  VISTAS = 'Vistas',
  TITULOSTABPERFIL = 'TitulosTabPerfil',
  OBTENER_CARGOS_HUMANO = 'ObtenerCargosEfinomina',
  GRADOS_CARGO_PERFIL = 'GradosCargoPerfil',
  SELECCIONAR_EMPRESA_MSG = 'SeleccionarEmpresaMsg',
  MSG_VALIDACION_INS_HV = 'MensajeValidacionInsHV',
  ESTADOS_ASPIRANTES_VERIFICACION_DOCS = 'EstadosAspirantesVerficacionDocs',
  ESTADOS_ASPIRANTES_VERIFICACION_DOCSM2 = 'EstadosAspirantesVerficacionDocsModelo2',
  ESTADOS_ASPIRANTES_VERIFICACION_DOCS_ALTAS_CORTES = 'EstadosAspirantesVerficacionDocsAltasCortes',
  CONVOCATORIA_NO_TIENE_REQUISITOS = 'MensajeNoTieneRequisitosConvocatoria',
  ESTADO_ASPIRANTE_INSCRITO = 'EstadoAspiranteInscrito',
  ESTADO_ASPIRANTE_ADMITIDO = 'EstadoAspiranteAdmitido',
  ESTADO_ASPIRANTE_NO_ADMITIDO = 'EstadoAspiranteNoAdmitido',
  MODIFICAR_CONVOCATORIA_SUPERADMIN = 'ModificarConvocatoriaSuperadmin',
  CAMPOS_INGLES_REQUERIDOS = 'CamposInglesRequeridos',
  RPT_PARAMETROS_PRESELECCIONADOS = 'RptParametrosPreseleccionados',
  FUNCIONARIOS_ALTAS_CORTES = 'FuncionariosAltasCortes',
  ALLOW_EXTENSIONS_UPLOAD_FILE_INFO = 'ExtensionesPermitidasCargueInfoArchivo',
  FORMULA_PUNTAJES_ETAPA_CLASIFICATORIA = 'FormulaPuntajesEtapaClasificatoria',
  CURSO_FORMACION_TIPO_PRUEBA = 'CursoFormacionTipoPrueba',
  APLICA_RECALIFICACION_CONVOCATORIA = 'aplicaRecalificacionConvocatoria',
  TIPO_ETAPAS = 'TipoEtapas',
  VALORES_FORMULA_CLASIFICACION = 'ValoresFormulaClasificacion',
  ESTADO_ASPIRANTE_RECHAZADO = 'EstadoAspiranteRechazado',
  ESTADO_ASPIRANTE_ELEGIDO = 'EstadoAspiranteElegido',
  ESTADO_ASPIRANTE_VINCULADO = 'EstadoAspiranteVinculado',
  MENSAJE_NOTIFICACION_VACANTES_PUBLICADAS = 'MensajeNotificacionVacantesPublicadas',
  ESTADO_ASPIRANTE_APROBO_PRUEBAS = 'EstadoAspiranteAproboPruebas',
  ESTADO_ASPIRANTE_NO_APROBO_PRUEBAS = 'EstadoAspiranteNoAproboPruebas',
  ESTADO_ASPIRANTE_APROBO_CURSO_FORMACION = 'EstadoAspiranteAproboCursoFormacion',
  ESTADO_ASPIRANTE_NO_APROBO_CURSO_FORMACION = 'EstadoAspiranteNoAproboCursoFormacion',
  RPT_PARAMETROS_INSCRITOS_AC = 'RptParametrosInscritosAC',
  ESTADO_ASPIRANTE_REGISTRO_ELEGIBLES = 'EstadoAspiranteRegistroElegibles',
  ID_TIPO_PRUEBA_PSICOTECNICA = 'IdTipoPruebaPsicotecnica',
  TITULOS_REPORTE_ESTADISTICA_CONVOCATORIA = 'TitulosReporteEstadisticaConvocatoria',
  ID_TIPO_CONVOCATORIA = 'IdTipoConvocatoria',
  CALIFICACION_DE_SERVICIOS = 'CalificacionDeServicios',
  ALLOW_EXTENSIONS_TEMPLATES = 'ExtensionesPermitidasPlantillas',
  ESTADO_ASPIRANTE_CUMPLE_REQUISITOS = 'EstadoAspiranteCumpleRequisitos',
  ESTADO_ASPIRANTE_NO_CUMPLE_REQUISITOS = 'EstadoAspiranteNoCumpleRequisitos',
  CARGOS_CONVOCATORIA_APLICA_ASPIRANTE = 'CargosConvocatoriaAplicaAspirante',
  ID_PERIODO_INSCRIPCION_CONVOCATORIA = 'IdPeriodoInscripcionConvocatoria',
  MAX_SELECCION_VACANTES_MISMA_CONVOCATORIA = 'maxSeleccionVacantesMismaConvocatoria',
  MAX_SELECCION_VACANTES_DIFERENTES_CONVOCATORIAS = 'maxSeleccionVacantesDiferentesConvocatorias',
  //PROCESO_SELECCION_ASPIRANTE = 'ProcesoSeleccionAspirante',
  ESTADO_ASPIRANTE_CITACION = 'EstadoAspiranteCitacion',
  ESTADO_ASPIRANTE_PRESELECCIONADO = 'EstadoAspirantePreseleccionado',
  RPT_ELEGIBLES_ALTAS_CORTES = 'RptElegiblesAltasCortes',
  ID_TRASLADOS_SIN_FECHAS = 'IdTrasladosSinFechas',
  COD_NIVEL_CONTRATACION_PROPIEDAD = 'CodNivelContratacionPropiedad'
}

export enum modulesSoports {
  DATOS_PERSONALES = 'DatosPersonales',
  EXPERIENCIA_LABORAL = 'ExperienciaLaboral',
  INFORMACION_ACADEMICA = 'InformacionAcademica',
  ANEXO = 'Anexo',
  OTRO = 'Otro',
  CONVOCATORIA = 'Convocatoria',
  CRONOGRAMA = 'Cronograma',
  INSTRUCTIVOS = 'Instructivos',
  INSCRIPCION_CONVOCATORIA = 'InscripcionConvocatoria',
  INSCRIPCION_VACANTES = 'InscripcionVacantes',
  CARGAR_ESCALAFON = 'CargarEscalafon',
  ASPIRANTE_EXCLUIDO = 'AspiranteExcluido',
  SOPORTE_TRASLADO = 'SoporteTraslado',
  RESOLUCIONCF_SOPORTE = 'ResolucionCFSoporte'
}

export enum documentsType {
  DOCUMENTO_IDENTIDAD = 'DocumentoIdentidad',
  LIBRETA_MILITAR = 'LibretaMilitar',
  DECLARACION = 'Declaracion',
  SOPORTE = 'Soporte',
  INSTRUCTIVOS = 'Instructivos',
  CONSTANCIAS = 'Constancias',//NUMERO CONVOCATORIA, no documento ddmmyyhh:ss .pdf
  INSCRIPCION_VACANTES = 'InscripcionVacantes',
  CARGAR_ESCALAFON = 'CargarEscalafon',
  ASPIRANTE_EXCLUIDO = 'AspiranteExcluido',
  RESOLUCIONCF_SOPORTE = 'ResolucionCFSoporte'
}

export enum stateConvocatoria {
  INACTIVO = 0,
  ACTIVO = 1,
  EN_BORRADOR = 2,
  PUBLICADA = 3,
  PUBLICADA_CON_AJUSTES = 4,
  CERRADA = 5,
}

export enum TipoExperienciaPerfil {
  Externa = 1,
  Relacionada = 2,
  Interna = 3
}

export enum PermisosAcciones {
  Crear = 1,
  Lectura = 2,
  Actualizar = 3,
  Eliminar = 4
}

export enum TipoVacante {
  Juez = 1,
  Magistrado = 2,
  Empleado = 3
}

export enum PermisosEspeciales {
  BotonPublicar = 'boton_publicar',
  EnviarCorreo = 'enviar_correo',
  BotonFinalizar= 'boton_finalizar'
  // BotonPublicar = 5
}
export const TiposArchivos: TipoReporteExtModel[] = [
  {
    extensionName: 'Pdf',
    extensionType: 'PDF',
    mediaType: 'application/pdf',
    extension: '.pdf'
  },
  {
    extensionName: 'Excel',
    extensionType: 'EXCEL',
    mediaType: 'application/vnd.ms-excel',
    extension: '.xls'
  },
  {
    extensionName: 'Excel Open',
    extensionType: 'EXCELOPENXML',
    mediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  },
  {
    extensionName: 'Image',
    extensionType: 'IMAGE',
    mediaType: 'image/tif',
    extension: '.tif'
  },
  {
    extensionName: 'Word',
    extensionType: 'WORD',
    mediaType: 'application/msword',
    extension: '.doc'
  },
  {
    extensionName: 'Word Open',
    extensionType: 'WORDOPENXML',
    mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx'
  }
];

export enum EstadoVacante {
  PARA_PUBLICAR = 1,
  PARA_PUBLICAR_LISTA_AGOTADA = 2,
  LISTA_EN_TRAMITE = 3,
  TRASLADO_EN_TRAMITE_SECCIONAL = 4,
  TRASLADO_EN_TRAMITE_CONSEJO = 5,
  PROYECTO_REORDENAMIENTO = 6,
  INHABILITAR_PUBLICAR = 7,
  EN_POSESION = 8 // Cierre por posesion
}

export const TipoInfoCargue: any[] = [
  {
    id: 1,
    tipoInfoName: 'Citaciones aspirantes',
    tipoInfoCargue: 'citacionesAspirante'
  },
  {
    id: 2,
    tipoInfoName: 'Resultados pruebas',
    tipoInfoCargue: 'resultadosPruebas'
  },
  {
    id: 3,
    tipoInfoName: 'Resultados curso formación',
    tipoInfoCargue: 'resultadosCursoFormacion'
  },
  {
    id: 4,
    tipoInfoName: 'Vacantes',
    tipoInfoCargue: 'vacantes'
  },
  {
    id: 5,
    tipoInfoName: 'Escalafón',
    tipoInfoCargue: 'escalafon'
  },
  {
    id: 6,
    tipoInfoName: 'Despacho',
    tipoInfoCargue: 'despacho'
  }
];
