import { RouteInfo } from '@app/compartido/modelos/interfaces';


// LINKS Hoja de vida admin
export const ROUTES_CURRYCULUM_VITAE: RouteInfo[] = [
  {
    path: 'BancoHojaVida',
    title: 'ttl.BancoHojaVida',
    icon: 'keyboard_arrow_right'
  }
];

// LINKS CONVOCATORIAS
export const ROUTES_CONVOCATORY: RouteInfo[] = [
  {
    path: 'convocatorias-activas',
    title: 'ttl.convocatoriasActivas',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'mis-convocatorias',
    title: 'ttl.misConvocatorias',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'crear-convocatoria',
    title: 'ttl.crearConvocatorias',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'cronograma',
    title: 'ttl.cronograma',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'crear-secciones',
    title: 'ttl.crearSecciones',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'crear-subsecciones',
    title: 'ttl.crearSubsecciones',
    icon: 'keyboard_arrow_right',
  },
  // {
  //   path: 'cargos',
  //   title: 'ttl.cargos',
  //   icon: "keyboard_arrow_right",
  // },
  {
    path: 'fase-pruebas',
    title: 'ttl.fases',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'etapas',
    title: 'ttl.etapas',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'adicional',
    title: 'ttl.adicional',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'requisitos-convocatoria',
    title: 'ttl.requisitosConvocatoria',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'presentacion-pruebas',
    title: 'ttl.presentacionPruebas',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'citacion-pruebas',
    title: 'ttl.citacionPruebas',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'resumen',
    title: 'ttl.resumen',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'aclaraciones-modificaciones',
    title: 'ttl.aclaracionesModificaciones',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'opciones-reclasificacion',
    title: 'ttl.opcionesRecalificacion',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'inscripcion-vacantes',
    title: 'ttl.inscripcionVacantes',
    icon: 'keyboard_arrow_right',
  }
  /*{
    path: 'pdf',
    title: 'Pdf',
    icon: "keyboard_arrow_right",
  },*/
];

export const ROUTES_PROFILE: RouteInfo[] = [
  /* {
    path: 'equivalencias',
    title: 'ttl.equivalencias',
    icon: 'keyboard_arrow_right',
  }, */
  {
    path: 'cargos',
    title: 'ttl.cargos',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'crear-perfil',
    title: 'ttl.crearPerfil',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'perfil-convocatoria',
    title: 'ttl.perfilConvocatoria',
    icon: 'keyboard_arrow_right',
  },
];

export const ROUTES_ESCALAFON: RouteInfo[] = [
  {
    path: 'info-escalafon',
    title: 'ttl.cargarInfoEscalafon',
    icon: 'keyboard_arrow_right',
  },
];

export const ROUTES_ACCOUNT: RouteInfo[] = [
  {
    path: 'cambiar-contrasenia',
    title: 'ttl.cambiarContrasenia',
    icon: 'keyboard_arrow_right'
  },
  /* {
    path: 'cuenta-usuario',
    title: 'ttl.cuentaUsuarioAdmin',
    icon: 'keyboard_arrow_right'
  }, */
  {
    path: 'desactivar-cuenta',
    title: 'ttl.desactivarCuenta',
    icon: 'keyboard_arrow_right'
  },
];

export const ROUTES_ACCOUNT_ADMIN: RouteInfo[] = [
  {
    path: 'cambiar-contrasenia',
    title: 'ttl.cambiarContrasenia',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'cuenta-usuario',
    title: 'ttl.cuentaUsuarioAdmin',
    icon: 'keyboard_arrow_right'
  },
  /* {
    path: 'desactivar-cuenta',
    title: 'ttl.desactivarCuenta',
    icon: 'keyboard_arrow_right'
  }, */
];

export const ROUTES_AYUDA: RouteInfo[] = [
  {
    path: 'tutorial',
    title: 'ttl.videoTutoriales',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'manual',
    title: 'ttl.manualDeUso',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'faq',
    title: 'ttl.faq',
    icon: 'keyboard_arrow_right'
  },
];

export const ROUTES_RESULTADOS: RouteInfo[] = [
  {
    path: 'cargar-informacion-curso',
    title: 'ttl.cargarInformacion',
    icon: 'keyboard_arrow_right'
  }
];

export const ROUTES_PRODUCCION_INTELECTUAL: RouteInfo[] = [
  {
    path: 'registrar-publicacion',
    title: 'ttl.registrarPubli',
    icon: 'keyboard_arrow_right'
  },
];

export const ROUTES_COMPANY: RouteInfo[] = [
  {
    path: 'crear-entidad',
    title: 'ttl.crearEmpresa',
    icon: 'keyboard_arrow_right'
  }
];

export const ROUTES_ADMIN_USUARIOS: RouteInfo[] = [
  {
    path: 'vista',
    title: 'ttl.vista',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'rol-usuario-empresa',
    title: 'ttl.rolUsuarioEmpresa',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'roles-vista',
    title: 'ttl.rolVista',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'crear-usuarios-administrativos',
    title: 'ttl.crearUsuariosAdmin',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'clonar-rol',
    title: 'ttl.clonarRol',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'gestionar-usuarios',
    title: 'ttl.gestionarUsuarios',
    icon: 'keyboard_arrow_right'
  },
];

export const ROUTES_ADMIN_CV: RouteInfo[] = [
  {
    path: 'banco-hoja-de-vida',
    title: 'ttl.BancoHojaVida',
    icon: 'keyboard_arrow_right'
  }
];

export const ROUTES_CONVOCATORY_APPLICANT: RouteInfo[] = [
  {
    path: 'inscripcion-convocatoria',
    title: 'ttl.convocatoriasActivas',
    icon: 'keyboard_arrow_right'
  },
  /* {
    path: 'cargos-convocatoria',
    title: 'ttl.cargosConvocatoria',
    icon: 'keyboard_arrow_right'
  }, */
  {
    path: 'mis-convocatorias',
    title: 'ttl.convocatoriasAspirante',
    icon: 'keyboard_arrow_right'
  }
];

export const ROUTES_REPORTES: RouteInfo[] = [
  {
    path: 'generador-reportes',
    title: 'ttl.generadorReportes',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'gestionar-reportes',
    title: 'ttl.gestionarReportes',
    icon: 'keyboard_arrow_right',
  }
];

export const ROUTES_SELECCION_ASPIRANTE: RouteInfo[] = [
  {
    path: 'validar-docs-aspirante',
    title: 'ttl.validarDocsAspirante',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'proceso-alta-corte',
    title: 'ttl.procesoAltaCorte',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'elegible-alta-corte',
    title: 'ttl.elegibleAltaCorte',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'resultados-pruebas',
    title: 'ttl.resultadosPruebas',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'proceso-seleccion',
    title: 'ttl.procesoSeleccion',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'resultados-curso-formacion',
    title: 'ttl.resultadosCursoFormacion',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'resolucion-curso-formacion',
    title: 'ttl.resolucionCursoFormacion',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'validar-curso-formacion',
    title: 'ttl.validarCursoFormacion',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'generacion-lista-elegibles',
    title: 'ttl.generacionListaElegibles',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'registro-vacantes',
    title: 'ttl.registrosVacantes',
    icon: 'keyboard_arrow_right',
  },
  {
    path: 'opcion-sedes',
    title: 'ttl.opcionSedes',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'validar-docs-reclasificacion',
    title: 'ttl.validarDocsReclasificacion',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'buscador-estado-aspirante',
    title: 'ttl.buscadorEstadoAspirante',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'declinar-vacante',
    title: 'ttl.declinarVacante',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'exclusion-fraude-cumplimiento',
    title: 'ttl.exclusionFraude',
    icon: 'keyboard_arrow_right'
  },
];

export const ROUTES_CARGUES_MASIVOS: RouteInfo[] = [
  {
    path: 'cargar-info',
    title: 'ttl.cargarInfoArchivos',
    icon: 'keyboard_arrow_right',
  },
  /* {
    path: 'cargar-info-escalafon',
    title: 'ttl.cargarInfoEscalafon',
    icon: 'keyboard_arrow_right',
  }, */
];

export const ROUTES_REGISTRO_DESPACHOS: RouteInfo[] = [
  {
    path: 'despachos',
    title: 'ttl.registroDespacho',
    icon: 'keyboard_arrow_right',
  },
];

export const ROUTES_TRASLADOS: RouteInfo[] = [
  {
    path: 'gestionar-traslado',
    title: 'ttl.gestionarTraslado',
    icon: 'keyboard_arrow_right'
  },
  {
    path: 'informacion-traslados',
    title: 'ttl.trasladosInfo',
    icon: 'keyboard_arrow_right'
  }
];

/* LINKS PRINCIPALES PARA USUARIOS ASPIRANTES Y ADMINISTRATIVOS  */

// LINKS MENU PRINCIPAL ASPIRANTES
export const ROUTES: RouteInfo[] = [
  {
    path: '/cv',
    title: 'path.modCurriculumVitae',
    icon: 'fa-id-badge',
  },
  {
    path: '/convocatorias-aspirante',
    title: 'path.modConvocatoriasAspirante',
    icon: 'fa-list-alt',
    childs: [...ROUTES_CONVOCATORY_APPLICANT]
  },
  // { path: "/dashboard", title: "Dashboard", icon: "dashboard", class: "" },
  {
    path: '/convocatoria',
    title: 'path.modConvocatoria',
    icon: 'fa-file-alt',
    class: '',
    childs: [...ROUTES_CONVOCATORY]
  },
  {
    path: '/traslados',
    title: 'path.modTraslados',
    icon: 'fas fa-random',
    childs: [...ROUTES_TRASLADOS]
  }
];

// LINKS MENU PRINCIPAL ADMINISTRADORES
export const ROUTES_ADMIN: RouteInfo[] = [
  {
    path: '/administrar-usuarios',
    title: 'path.modAdminUsuario',
    icon: 'fa-users',
    childs: [...ROUTES_ADMIN_USUARIOS]
  },
  {
    path: '/entidad',
    title: 'path.modEmpresa',
    icon: 'fa-tasks',
    childs: [...ROUTES_COMPANY]
  },
  {
    path: '/convocatoria',
    title: 'path.modConvocatoria',
    icon: 'fa-file-alt',
    class: '',
    childs: [...ROUTES_CONVOCATORY]
  },
  {
    path: '/perfil',
    title: 'path.modPerfil',
    icon: 'fa-scroll',
    childs: [...ROUTES_PROFILE]
  },
  {
    path: '/seleccion-aspirante',
    title: 'path.modSeleccionAspirante',
    icon: 'fa-user-check',
    childs: [...ROUTES_SELECCION_ASPIRANTE]
  },
  {
    path: '/notificaciones',
    title: 'ttl.notificaciones',
    icon: 'fa fa-bell'
  },
  {
    path: '/reportes',
    title: 'path.modReportes',
    icon: 'fa-clipboard-list',
    childs: [...ROUTES_REPORTES]
  },
  {
    path: '/cargues-masivos',
    title: 'path.modCarguesMasivos',
    icon: 'fa-upload',
    childs: [...ROUTES_CARGUES_MASIVOS]
  },{
    path: '/registro-despachos',
    title: 'path.modRegistroDespachos',
    icon: 'fa-registered',
    childs: [...ROUTES_REGISTRO_DESPACHOS]
  },
  {
    path: '/cargar-informacion-escalafon',
    title: 'path.cargarInfoEscalafon',
    icon: 'fa-scroll',
    childs: [...ROUTES_ESCALAFON]
  },
  {
    path: '/cv-admin',
    title: 'path.modConsultaHV',
    icon: 'fa-id-badge',
    childs: [...ROUTES_ADMIN_CV]
  },
  {
    path: '/admin',
    title: 'path.modManager',
    icon: 'fa-folder-open'
  },
  /* {
    path: '/cuenta',
    title: 'path.modCuenta',
    icon: 'fa-user-lock',
    childs: [...ROUTES_ACCOUNT]
  }, */

];


// LINKS MENU AYUDA
export const ROUTES_HELP: RouteInfo[] = [
  {
    path: '/ayuda',
    title: 'path.modAyuda',
    icon: 'fa fa-question-circle',
    childs: [...ROUTES_AYUDA]
  }
];

export const ROUTES_ACCOUNT_USER: RouteInfo[] = [
  {
    path: '/cuenta',
    title: 'path.modCuenta',
    icon: 'fa-user-lock',
    childs: [...ROUTES_ACCOUNT]
  },
];

export const ROUTES_ACCOUNT_USER_ADMIN: RouteInfo[] = [
  {
    path: '/cuenta',
    title: 'path.modCuenta',
    icon: 'fa-user-lock',
    childs: [...ROUTES_ACCOUNT_ADMIN]
  },
];

