import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { statesUser } from '@app/compartido/helpers/enums';
import { LangModel } from '@app/compartido/modelos/lang-model';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateService {

  public esCO: LangModel = { lang: 'es', title: 'Español/Spanish', img: 'co', langBd: '' };
  public enUS: LangModel = { lang: 'en', title: 'Inglés/English', img: 'us', langBd: '_En' };
  public langDefault = this.esCO;
  public langsView: LangModel[] = [this.esCO, this.enUS];
  private langs = [this.esCO.lang, this.enUS.lang];


  //MENSAJES USADOS EN COMPONENTES
  public SUCCESS_MSG: string;
  public USER_INACTIVE_MSG: string;
  public USER_PENDING_ACTIVATION_MSG: string;
  public EMAIL_PASSWORD_INCORRECT_MSG: string;
  public ERROR_MSG: string;
  public EMAIL_VALIDATE_MSG: string;
  public CODE_INCORRECT_MSG: string;
  public EMAIL_PENDING_VERIFICATION: string;
  public WE_ARE_SORRY: string;
  public SEND_PASSWORD_TEMPORAL_TO_EMAIL: string;
  public WE_ARE_SORRY_DONT_RECOVERY_PASSWORD: string;
  public PASSWORDS_MUST_SAME: string;
  public PASSWORD_NOT_CHANGE: string;
  public PASSWORD_CHANGE_SUCCESS: string;
  public WE_ARE_SORRY_PASSWORD_DIFERENT_CURRENT: string;
  public YOU_MUST_CHANGE_PASSWORD: string;
  public PROGRESS_CURRICULUM_VITAE: string;
  public ERROR_DUPLICATE_IDENTIFICATION: string;
  public OBSERVATION_SAVE_SUCESSFULL: string;
  public DELETE_SUCCESSFULL: string;
  public DELETE_CONFIRMATION: string;
  public DATES_INCORRECTS_VERIFY: string;
  public VERIFY_CODE1: string;
  public VERIFY_CODE2: string;
  public VERIFY_CODE3: string;
  public BAD_EXTENSION_FILE: string;
  public ERROR_PASSWORD: string;
  public CLOSE_SESION_EXPIRED: string;
  public LOADING: string;
  public DIGIT_CODE_ACTIVATION: string;
  public MUST_DIGIT_CODE_EMAIL: string;
  public SUCCESS: string;
  public INFORMATION: string;
  public ERROR: string;
  public WARNING: string;
  public QUESTION: string;
  public YES: string;
  public NOT: string;
  public INVALID_FILE_FORMAT: string;
  public EXIST_PERSONAL_ACTIVITY: string;
  public MSG_ERROR_REGISTRARSE: string;
  public DAYS: string;
  public MONTHS: string;
  public YEARS: string;
  public EXIST_CONVOCATORY: string;
  public REPEATED_DATA: string;
  public UPDATE_CONFIRMATION: string;
  public UPDATE_CONFIRMATION_RECORDS: string;
  public UPDATE_CONFIRMATION_CONVOCATORIA: string;
  public EXIST_ACTIVITY: string;
  public ERROR_CONFIG_ADITIONAL_DATA: string;
  public ERROR_SUM_ADITIONAL_DATA: string;
  public ERROR_RANGE: string;
  public FECHAS_INCORRECTAS_CRONOGRAMA: string;
  public SUM_ETAPA_COMBIN_INCORRECTO: string;
  public PASSWORD_WRONG: string;
  public MSG_DELETE_RECORD_CONSTRAINT: string;
  public MSG_UPDATE_RECORD_CONSTRAINT: string;
  public MSG_DEACTIVATE_ACCOUNT_USER: string;
  public DEACTIVATE_CONFIRMATION: string;
  public VERIFY_TOKEN_DEACTIVATE_USER: string;
  public ERROR_DEACTIVATE_ACCOUNT_USER: string;
  public MSG_EMPTY_TITLES: string;
  public MSG_EMPTY_EXPERIENCES: string;
  public MSG_SELECT_AGREEMENT: string;
  public MSG_NO_TIENE_PERMISO_ACCION: string;
  public MSG_TITULO_ACADEMICO_REQUERIDO: string;
  public MSG_EXPERIENCIA_EXTERNA_REQUERIDO: string;
  public DEACTIVATE_PROFILE_CONFIRMATION: string;
  public NUM_MAX_MONTHS: string;
  public DEACTIVATE_USER: string;
  public ACTIVATE_USER: string;
  public DUPLICATE_ROLE: string;
  public ACCESS_DENIED: string;
  public USER_ADMIN_INACTIVE_MSG: string;
  public USER_EXISTS: string;
  public ERROR_DELETE_VIEW: string;
  public UNSELECTED_CONFIRMATION: string;
  public SELECTED_FAVORITE: string;
  public UNSELECTED_FAVORITE: string;
  public INSCRIPTION_CONFIRMATION: string;
  public MSG_VALIDATE_INFORMATION_CV: string;
  public MSG_NUM_MAX_INSCRIPTIONS: string;
  public MSG_SUCCESSFUL_ENROLLMENT: string;
  public MSG_CANCEL_ENROLLMENT_CONFIRMATION: string;
  public MSG_SUCCESSFUL_CANCEL_ENROLLMENT: string;
  public ARCHIVO_NO_EXISTE: string;
  public CLOSE: string;
  public MSG_LIST_TEST_EMPTY: string;
  public MSG_LIST_APPLICANT_EMPTY: string;
  public MSG_CITACION_CONFIRMATION: string;
  public MSG_SUCCESSFUL_CALL: string;
  public MSG_SUCCESSFUL_NOTIFICATION: string;
  public REQUALIFICATION_CONFIRMATION: string;
  public UPDATE_INSCRIPTION_CONFIRMATION: string;
  public MSG_SUCCESSFUL_UPDATE_INSCRIPTION: string;
  public MSG_NUMBER_MAX_EXCEEDED_EXPERIENCE: string;
  public MSG_NUMBER_MAX_EXCEEDED_INFO: string;
  public MSG_LOAD_INFO_CONFIRMATION: string;
  public MSG_ERROR_LOAD_INFO_FILE: string;
  public APRUEBA: string;
  public PIERDE_POR_INASISTENCIA: string;
  public PIERDE_POR_NOTA: string;
  public HOMOLOGADO: string;
  public RETIRO_VOLUNTARIO: string;
  public NO_INSCRITO_CURSO_FORMACION: string;
  public MSG_EMPTY_TEST_RESULTS: string;
  public MSG_INVALID_TEST_RESULTS: string;
  public MSG_CANCEL_REGISTRATION_VACANCY_CONFIRMATION: string;
  public MSG_STATUS_CHANGE_VACANCY_CONFIRMATION: string;
  public MSG_COMUNICADO_ELEGIDOS_RECHAZADOS: string;
  public MSG_POSESION_ASPIRANTE_CONFIRMACION: string;
  public MSG_LIBERAR_VACANTE_POSESION_CONFIRMATION: string;
  public MSG_VALOR_SUPERA_MAXIMO_PERMITIDO: string;
  public MSG_LISTA_ASPIRANTES_VACANTE_VACIA: string;
  public MSG_IDENTIDAD_NO_VALIDA: string;
  public MSG_REQUEST_REQUALIFICATION_PENDING: string;
  public MSG_SUCCESSFUL_MAILING_MESSAGE: string;
  public MSG_VACANCY_SELECTION_CONFIRMATION: string;
  public MSG_SECCIONAL_VACANTE: string;
  public MSG_SECCIONAL_ANULACION: string;
  public MSG_CARGUE_EXITOSO: string;
  public MSG_RECLASSIFICATION_SUCCESSFUL: string;
  public MSG_FECHA_NO_HABIL: string;
  public MSG_VALOR_NO_SUPERA_MINIMO_PERMITIDO: string;
  public MSG_DOCUMENTOS_TRASLADO_INCOMPLETOS: string;
  public MSG_NUMERO_DOCUMENTO_NO_EXISTE: string;
  public MSG_DECLINAR_VACANTE_CONFIRMACION: string
  public MSG_PRESELECCION_EXITOSA: string;
  public MSG_DECLINACION_EXITOSA: string;
  public MSG_ELEGIBLE_ALTAS_CORTES_CONFIRMACION: string;
  public MSG_NUM_MAX_INSCRIPTIONS_DIF_CONVOCATORIAS: string;
  public MSG_ASPIRANTE_TIENE_RESULTADO_CURSO_FORMACION: string;
  public MSG_SOLICITUD_TRASLADO_EXITOSA: string;
  public MSG_CONFIRMACION_ELIMINAR_ASPIRANTE_DE_LISTA: string;
  public MSG_FECHA_INGRESADA_EXISTE: string;
  public MSG_LISTA_ELEGIBLES_EXITOSA: string;
  public MSG_COD_DESPACHO_NO_EXISTE: string;
  public MSG_SELECCIONE_DESPACHO: string;
  public MSG_TRASLADO_SIN_FECHA_HABIL: string;
  public MSG_SELECCIONE_CARGO: string;
  public MSG_COD_NIVEL_CONTRATACION_PROPIEDAD: string;

  public MOD_CURRICULUM_VITAE: string;
  public MOD_CHANGE_PASSWORD: string;
  public MOD_MANAGER: string;

  public BTN_ACCEPT: string;
  public BTN_CANCEL: string;
  public BTN_VALIDATE: string;
  public BTN_RESEND_CODE: string;

  public NAC_COLOMBIANA: string;
  public NAC_DOBLE_NACIONALIDAD: string;
  public NAC_COLOMBIANA_POR_ADPCION: string;

  public MILITAR_CARD_FIRST: string;
  public MILITAR_CARD_SECOND: string;

  public static PAGINATOR_ITEM_PER_PAGE: string;
  public static PAGINATOR_NEXT: string;
  public static PAGINATOR_LAST: string;
  public static PAGINATOR_BACK: string;
  public static PAGINATOR_FIRST: string;
  public static OF: string;

  public PUBLICATION_MSG: string;
  public NOT_PUBLICATION_MSG: string;
  public PUBLICATION_QUESTION_MSG: string;
  public FINISH_QUESTION_MSG: string;f

  public CONVOCATORIA_PUBLICADA_MSG: string;
  public CONVOCATORIA_ENCOSTRUCION_MSG: string;
  public CONVOCATORIA_CERRADA_MSG: string;
  public CONVOCATORIA_INACTIVA_MSG: string;

  public INFORMACION_EDITAR_ELIMINAR: string;
  public DOCUMENTOS_CHECK_INVALIDOS: string;
  public DOC_INCORRECTO_OBSERVACIONES: string;
  public CONVOCATORIA_INACTIVA_NO_PUBLICADA: string;


  public CONFIRMAR_PUBLICACION: string;
  public VACANTE_PUBLICADA_MSG: string

  public INACTIVA: string;
  public CERRADA: string;
  public PUBLICADA: string;
  public ACTIVA: string;


  // ESTADOS USUARIO
  public STATE_ACTIVE: string;
  public STATE_INACTIVE: string;
  public STATE_FORCE_CHANGE_PASSWORD: string;
  public STATE_PENDING_ACTIVATION: string;

  public SEARCH: string;
  public UNSELECT: string;
  public SELECT_ALL: string;

  public NOTIFICACION_EXITOSA: string;
  public MSG_COMUNICADO_ADMITIDO_ASPIRANTE: string;
  public INFORMACION_ACADEMICA: string;
  public EXPERIENCIA_LABORAL: string;
  public EXPERIENCIA_LABORAL_RAMA: string;
  public INFORMACION_ANEXOS: string;

  public CONFIGURACION_FUNCI_ALTAS_CORTES: string;
  public CONVOCATORIA_SIN_CRONOGRAMA: string;

  public FECHAS_ELIMANCION: string;
  public INFORMACION_PERSONAL: string;
  public PUNTAJE_MAYOR_A_CERO: string;

  public MSG_RESULTADOS_PRUEBAS_PROCESADAS: string;
  public MSG_APRUEBA: string;
  public MSG_NO_APRUEBA: string;

  public MSG_CONVOCATORIA_LISTA_ELEGIBLES: string;
  public MSG_EXISTEN_RESULTADOS_PRUEBAS: string;

  // MENSAJES TRANSLATE KEYS
  private success_msg = 'comp.success_msg';
  private user_inactive_msg = 'comp.userInactive';
  private user_pending_activation_msg = 'comp.userPendingActivation';
  private email_password_incorrect_msg = 'comp.emailPasswordIncorrect';
  private error_msg = "comp.error_msg";
  private email_validate_msg = "comp.emailValidate";
  private code_incorrect_msg = "comp.codeIncorrect";
  private email_pending_verification = "comp.emailPendingVerification";
  private we_are_sorry = "comp.weAreSorry";
  private send_password_temporal_to_email = "comp.sendPasswordTemporalToEmail";
  private we_are_sorry_dont_recovery_password = "comp.weAreSorryDontRecoveryPassword";
  private passwords_must_same = "comp.passwordsMustSame";
  private weAreSorryPasswordNotChange = "comp.weAreSorryPasswordNotChange";
  private passwordChangeSuccess = "comp.passwordChangeSuccess";
  private weAreSorryPasswordDiferentCurrent = "comp.weAreSorryPasswordDiferentCurrent";
  private youMustChangePassword = "comp.youMustChangePassword";
  private progressCurriculumVitae = "comp.progressCurriculumVitae";
  private error_duplicate_identification = "comp.error_duplicate_identification";
  private observationSaveSucessfull = "comp.observationSaveSucessfull";
  private deleteSuccessfull = "comp.deleteSuccessfull";
  private deleteConfirmation = "comp.deleteConfirmation";
  private datesIncorrectsVerify = "comp.datesIncorrectsVerify";
  private verifyCode1 = "comp.verifyCode1";
  private verifyCode2 = "comp.verifyCode2";
  private verifyCode3 = "comp.verifyCode3";
  private badExtensionFile = "comp.badExtensionFile";
  private errorPassword = "comp.errorPassword";
  private closeSesionExpired = "comp.closeSesionExpired";
  private stateUserActive = "comp.stateUserActive";
  private stateUserInactive = "comp.stateUserInactive";
  private stateUserForceChangePassword = "comp.stateUserForceChangePassword";
  private stateUserPendingActivation = "comp.stateUserPendingActivation";
  private modCurriculumVitae = "path.modCurriculumVitae";
  private modChangePassword = "path.modChangePassword";
  private modManager = "path.modManager";
  private pagItemsPorPagina = "lbl.pagItemsPorPagina";
  private pagSiguiente = "lbl.pagSiguiente";
  private pagUltima = "lbl.pagUltima";
  private pagAnterior = "lbl.pagAnterior";
  private pagPrimera = "lbl.pagPrimera";
  private de = "lbl.de";
  private aceptar = "btn.aceptar";
  private cancelar = "btn.cancelar";
  private cargando = "lbl.cargando";
  private digiteCodigoActivacion = "lbl.digiteCodigoActivacion";
  private debeDigitarCodigoCorre = "lbl.debeDigitarCodigoCorre";
  private validar = "btn.validar";
  private reenviarCodigo = "btn.reenviarCodigo";
  private exito = "lbl.exito";
  private informacion = "lbl.informacion";
  private error = "lbl.error";
  private advertencia = "lbl.advertencia";
  private pregunta = "lbl.pregunta";
  private si = "lbl.si";
  private no = "lbl.no";
  private formatoArchivoNoValido = "msg.formatoArchivoNoValido";
  private existPersonalActivity = "comp.existPersonalActivity";
  private msgErrorRegistrarse = "comp.msgErrorRegistrarse";
  private dias = "lbl.dias";
  private meses = "lbl.meses";
  private anios = "lbl.anios";
  private existConvocatory = "comp.existConvocatory";
  private datosRepetidos = 'msg.datosRepetidos';
  private updateConfirmation = "comp.updateConfirmation";
  private updateConfirmationRecords = "comp.updateConfirmationRecords";
  private updateConfirmationConvocatoria = "comp.updateConfirmationConvocatoria";
  private existActivity = "comp.existActivity";
  private datosRequeridosAdicionales = 'msg.datosRequeridosAdicionales';
  private sumaDatosAdicionales = 'msg.sumaDatosAdicionales';
  private rangoIncorrecto = 'msg.rangoIncorrecto';
  private fechasIncorrectasCronograma = 'comp.fechasIncorrectasCronograma';
  private sumEtapaCombiIncorrecto = 'msg.sumEtapaCombiIncorrecto';
  private contraseniaIncorrecta = 'comp.contraseniaIncorrecta';
  private errorRegistroForaneaDelete = 'comp.errorRegistroForaneaDelete';
  private errorRegistroForaneaUpdate = 'comp.errorRegistroForaneaUpdate';
  private deactivateAccountUser = 'comp.deactivateAccountUser';
  private deactivateConfirmation = 'comp.deactivateConfirmation';
  private verifyTokenDeactivateUser = 'comp.verifyTokenDeactivateUser';
  private errorDeactivateAccountUser = 'comp.errorDeactivateAccountUser';
  private msgEmptyTitles = 'comp.msgEmptyTitles';
  private msgEmptyExperiences = 'comp.msgEmptyExperiences';
  private msgSelectAgreement = 'comp.msgSelectAgreement';
  private msgNoTienePermisoAccion = 'comp.msgNoTienePermisoAccion';
  private nacColombiana = 'comp.nacColombiana';
  private nacDobleNacionalidad = 'comp.nacDobleNacionalidad';
  private nacColombianaPorAdopcion = 'comp.nacColombianaPorAdopcion';
  private militarCardPrimera = 'comp.militarCardPrimera';
  private militarCardSegunda = 'comp.militarCardSegunda';
  private deactivateProfileConfirmation = 'comp.deactivateProfileConfirmation';
  private numMaxMonths = 'comp.numMaxMonths';
  private deactivateUser = 'comp.deactivateUser';
  private activateUser = 'comp.activateUser';
  private duplicateRole = 'comp.duplicateRole';
  private msgTituloAcademicoRequerido = 'comp.msgTituloAcademicoRequerido';
  private msgExperienciaExternaRequerido = 'comp.msgExperienciaExternaRequerido';
  private msgAccessDenied = 'comp.msgAccesoDenegado';
  private userAdminInactiveMsg = 'comp.userAdminInactive';
  private userExistMsg = 'comp.userExists';
  private errorDeleteViewFather = 'comp.errorEliminarVistaPadre';
  private unselectedConfirmation = 'comp.unselectedConfirmation';
  private selectedFavorite = 'comp.selectedFavorite';
  private unselectedFavorite = 'comp.unselectedFavorite';
  private inscriptionConfirmation = 'comp.inscriptionConfirmation';
  private msgValidateInformationCV = 'comp.msgValidateInformationCV';
  private msgNumMaxInscriptions = 'comp.msgNumMaxInscriptions';
  private msgSuccessfulEnrollment = 'comp.msgSuccessfulEnrollment';
  private msgCancelEnrollmentConfimation = 'comp.msgCancelEnrollmentConfirmation';
  private msgSuccessfulCancelEnrollment = 'comp.msgSuccessfulCancelEnrollment';
  private archivoNoExiste = 'comp.archivoNoExiste';
  private cerrar = 'comp.cerrar';
  private msgListTestEmpty = 'comp.msgListTestEmpty';
  private msgListApplicantEmpty = 'comp.msgListApplicantEmpty';
  private search = 'comp.search';
  private unselect = 'comp.unselect';
  private selectAll = 'comp.selectAll';
  private publication_msg = 'comp.publication_msg';
  private not_publication_msg = 'comp.not_publication_msg';
  private publication_questions_msg = 'comp.publication_question';
  private msgCitacionConfirmation = 'comp.msgCitacionConfirmation';
  private msgSuccessfulCall = 'comp.msgSuccessfulcall';
  private msgSuccessfulNotification = 'comp.msgSuccessfulNotification';
  private requalificationConfirmation = 'comp.requalificationConfirmation';
  private updateInscriptionConfirmation = 'comp.updateInscriptionConfirmation';
  private msgSuccessfulUpdateInscription = 'comp.msgSuccessfulUpdateInscription';
  private msgNumberMaxExceedeExperience = 'comp.msgNumberMaxExceededExperience';
  private msgNumberMaxExceedeInfo = 'comp.msgNumberMaxExceededInfo';
  private msgLoadInfoConfirmation = 'comp.msgLoadInfoConfirmation';
  private msgErrorLoadInfoFile = 'comp.msgErrorLoadInfoFile';
  private aprueba = 'lbl.aprueba';
  private pierdePorInasistencia = 'lbl.pierdePorInasistencia';
  private pierdePorNota = 'lbl.pierdePorNota';
  private homologado = 'lbl.homologado';
  private retiroVoluntario = 'lbl.retiroVoluntario';
  private noInscritoCursoFormacion = 'lbl.noInscritoCursoFormacion';
  private msgEmptyTestResults = 'comp.msgEmptyTestResults';
  private msgInvalidTestResults = 'comp.msgInvalidTestResults';
  private msgCancelRegistrationVacancyConfirmation = 'comp.msgCancelRegistrationVacancyConfirmation';
  private msgStatusChangeVacancyConfirmation = 'comp.msgStatusChangeVacancyConfirmation';
  private msgPosesionAspiranteConfirmacion = 'comp.msgPosesionAspiranteConfirmacion';
  private msgLiberarVacantePosesionConfirmation = 'comp.msgLiberarVacantePosesionConfirmation';
  private msgValorSuperaMaximoPermitido = 'comp.msgValorSuperaMaximoPermitido';
  private msgListaAspirantesVacanteVacia = 'comp.msgListaAspirantesVacanteVacia';
  private msgRequestRequalificationPending = 'comp.msgRequestRequalificationPending';
  private msgSuccessfulMailingMessage = 'comp.msgSuccessfulMailingMessage';
  private msgVacancySelectionConfirmation = 'comp.msgVacancySelectionConfirmation';
  private msgSeleccionVacante = 'comp.msgSeleccionVacante';
  private msgAnulacionSeleccion = 'comp.msgAnulacionSeleccion';
  private msgCargueExitoso = 'comp.msgCargueExitoso';
  private msgReclassificationSuccessful = 'comp.msgReclassificationSuccessful';
  private msgFechaNoHabil = 'comp.msgFechaNoHabil';
  private msgValorNoSuperaMinimoPermitido = 'comp.msgValorNoSuperaMinimoPermitido';
  private msgDocumentosTrasladoIncompletos = 'comp.msgDocumentosTrasladoIncompletos';
  private msgNumeroDocumentoNoExiste = 'comp.msgNumeroDocumentoNoExiste';
  private msgDeclinarVacanteConfirmacion = 'comp.msgDeclinarVacanteConfirmacion';
  private msgPreseleccionExitosa = "msg.preseleccionExitosa";
  private msgDeclinacionExitosa = 'comp.msgDeclinacionExitosa';
  private msgElegibleAltasCortesConfirmacion = 'comp.msgElegibleAltasCortesConfirmacion';
  private msgNumMaxInscriptionsDifConvocatorias = 'comp.msgNumMaxInscriptionsDifConvocatorias';
  private msgAspiranteTieneResultadoCursoFormacion = 'comp.msgAspiranteTieneResultadoCursoFormacion';
  private msgSolicitudTrasladoExitosa = 'comp.msgSolicitudTrasladoExitosa';
  private msgConfirmacionEliminarAspiranteDeLista = 'comp.msgConfirmacionEliminarAspiranteDeLista';
  private msgFechaIngresadaExiste = 'comp.msgFechaIngresadaExiste';
  private msgListaElegiblesExitosa = 'comp.msgListaElegiblesExitosa';
  private msgCodDespachoNoExiste = 'comp.msgCodDespachoNoExiste';
  private msgSeleccioneDespacho = 'comp.msgSeleccioneDespacho';
  private msgTrasladoSinFechaHabil = 'comp.msgTrasladoSinFechaHabil';
  private msgSeleccioneCargo = 'comp.msgSeleccioneCargo';
  private msgCodNivelContratacionPropiedad = 'comp.msgCodNivelContratacionPropiedad';
  
  private convocatoria_inactiva_msg = 'msg.convocatoria_inactiva';
  private convocatoria_encostrucion_msg = 'msg.convocatoria_encostrucion';
  private convocatoria_publicada_msg = 'msg.convocatoria_publicada';
  private convocatoria_cerrada_msg = 'msg.convocatoria_cerrada';
  private msgIdentidadNoValida = 'msg.identidadNoVinculada';

  private informacion_publicar_eliminar = 'comp.informacionEditarElimnar';
  private docInvalidoCheck = 'comp.docInvalidoCheck';
  private convocatoria_inactiva_no_publicada = 'msg.convocatoria_inactiva_no_publicada';
  private notificacionExitosa = 'comp.notificacionExitosa';
  private msgComunicadoAdmitidoNoAdmitidoAspirante = 'comp.msgComunicadoAdmitidoNoAdmitidoAspirante';
  private inactiva = 'lbl.inactiva';
  private cerrada = 'lbl.cerrada';
  private publicada = 'lbl.publicada';
  private activa = 'lbl.activa';
  private informacionAcademica = 'comp.informacionAcademica';
  private expLaboral = 'comp.expLaboral';
  private expLaboralRama = 'comp.expLaboralRama';
  private convocatoriaSinCronograma = 'comp.convocatoriaSinCronograma';
  private fechaeliminacion = 'comp.fechaEliminacion';
  private configuracionFunciAltasCortes = 'comp.configuracionFunciAltasCortes';
  private informacionPersonal = 'comp.informacionPersonal';
  private puntajeMayorACero = 'comp.puntajeMayorACero';
  private msgConfirmarPublicacion = 'msg.confirmarPublicacion';
  private msgVacantePublicada = 'msg.vacantePublicada';
  private msgResultadosPruebasProcesadas = 'comp.msgResultadosPruebasProcesadas';
  private msgAprueba = 'comp.msgAprueba';
  private msgNoAprueba = 'comp.msgNoAprueba';
  private msgComunicadoElegidosRechazados = 'comp.msgComunicadoElegidosRechazados';
  private msgConvocatoriaListaElegibles = 'comp.msgConvocatoriaListaElegibles';
  private msgExistenResultadosPruebas = 'comp.msgExistenResultadosPruebas';
  private docIncorrectoObservaciones = 'comp.docIncorrectoObservaciones';
  private finish_questions_msg = 'comp.finish_question';
  private informacionAnexos = 'comp.informacionAnexos';
  
  

  constructor(
    private translate: TranslateService) {
  }

  public getLangDefault() {
    const langCurrent = this.translate.getDefaultLang();
    const find = this.langsView.find(l => l.lang === langCurrent);
    return find ? find : this.langDefault;
    // for (let i = 0; i < this.langsView.length; i++) {
    //   if (this.langsView[i].lang == langCurrent) {
    //     return this.langsView[i];
    //   }
    // }

  }

  public async loadConfigurationTranslate(lang: string = this.langDefault.lang) {
    this.langDefault = this.langsView.find(l => l.lang === lang);
    this.translate.addLangs(this.langs);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    //this.dateAdapter.setLocale('en-US');

    await this.translate.getTranslation(this.translate.getDefaultLang()).toPromise().then(() => {
      this.SUCCESS_MSG = this.translate.instant(this.success_msg);
      this.USER_INACTIVE_MSG = this.translate.instant(this.user_inactive_msg);
      this.USER_PENDING_ACTIVATION_MSG = this.translate.instant(this.user_pending_activation_msg);
      this.EMAIL_PASSWORD_INCORRECT_MSG = this.translate.instant(this.email_password_incorrect_msg);
      this.ERROR_MSG = this.translate.instant(this.error_msg);
      this.EMAIL_VALIDATE_MSG = this.translate.instant(this.email_validate_msg);
      this.CODE_INCORRECT_MSG = this.translate.instant(this.code_incorrect_msg);
      this.EMAIL_PENDING_VERIFICATION = this.translate.instant(this.email_pending_verification);
      this.WE_ARE_SORRY = this.translate.instant(this.we_are_sorry);
      this.SEND_PASSWORD_TEMPORAL_TO_EMAIL = this.translate.instant(this.send_password_temporal_to_email);
      this.WE_ARE_SORRY_DONT_RECOVERY_PASSWORD = this.translate.instant(this.we_are_sorry_dont_recovery_password);
      this.PASSWORDS_MUST_SAME = this.translate.instant(this.passwords_must_same);
      this.PASSWORD_NOT_CHANGE = this.translate.instant(this.weAreSorryPasswordNotChange);
      this.PASSWORD_CHANGE_SUCCESS = this.translate.instant(this.passwordChangeSuccess);
      this.WE_ARE_SORRY_PASSWORD_DIFERENT_CURRENT = this.translate.instant(this.weAreSorryPasswordDiferentCurrent);
      this.YOU_MUST_CHANGE_PASSWORD = this.translate.instant(this.youMustChangePassword);
      this.PROGRESS_CURRICULUM_VITAE = this.translate.instant(this.progressCurriculumVitae);
      this.ERROR_DUPLICATE_IDENTIFICATION = this.translate.instant(this.error_duplicate_identification);
      this.OBSERVATION_SAVE_SUCESSFULL = this.translate.instant(this.observationSaveSucessfull);
      this.DELETE_SUCCESSFULL = this.translate.instant(this.deleteSuccessfull);
      this.DELETE_CONFIRMATION = this.translate.instant(this.deleteConfirmation);
      this.DATES_INCORRECTS_VERIFY = this.translate.instant(this.datesIncorrectsVerify);
      this.VERIFY_CODE1 = this.translate.instant(this.verifyCode1);
      this.VERIFY_CODE2 = this.translate.instant(this.verifyCode2);
      this.VERIFY_CODE3 = this.translate.instant(this.verifyCode3);
      this.BAD_EXTENSION_FILE = this.translate.instant(this.badExtensionFile);
      this.ERROR_PASSWORD = this.translate.instant(this.errorPassword);
      this.CLOSE_SESION_EXPIRED = this.translate.instant(this.closeSesionExpired);
      this.STATE_ACTIVE = this.translate.instant(this.stateUserActive);
      this.STATE_INACTIVE = this.translate.instant(this.stateUserInactive);
      this.STATE_FORCE_CHANGE_PASSWORD = this.translate.instant(this.stateUserForceChangePassword);
      this.STATE_PENDING_ACTIVATION = this.translate.instant(this.stateUserPendingActivation);
      this.MOD_CURRICULUM_VITAE = this.translate.instant(this.modCurriculumVitae);
      this.MOD_CHANGE_PASSWORD = this.translate.instant(this.modChangePassword);
      this.MOD_MANAGER = this.translate.instant(this.modManager);
      CustomTranslateService.PAGINATOR_ITEM_PER_PAGE = this.translate.instant(this.pagItemsPorPagina);
      CustomTranslateService.PAGINATOR_NEXT = this.translate.instant(this.pagSiguiente);
      CustomTranslateService.PAGINATOR_LAST = this.translate.instant(this.pagUltima);
      CustomTranslateService.PAGINATOR_BACK = this.translate.instant(this.pagAnterior);
      CustomTranslateService.PAGINATOR_FIRST = this.translate.instant(this.pagPrimera);
      CustomTranslateService.OF = this.translate.instant(this.de);
      this.BTN_ACCEPT = this.translate.instant(this.aceptar);
      this.BTN_CANCEL = this.translate.instant(this.cancelar);
      this.BTN_VALIDATE = this.translate.instant(this.validar);
      this.LOADING = this.translate.instant(this.cargando);
      this.DIGIT_CODE_ACTIVATION = this.translate.instant(this.digiteCodigoActivacion);
      this.MUST_DIGIT_CODE_EMAIL = this.translate.instant(this.debeDigitarCodigoCorre);
      this.BTN_RESEND_CODE = this.translate.instant(this.reenviarCodigo);
      this.SUCCESS = this.translate.instant(this.exito);
      this.WARNING = this.translate.instant(this.advertencia);
      this.INFORMATION = this.translate.instant(this.informacion);
      this.ERROR = this.translate.instant(this.error);
      this.QUESTION = this.translate.instant(this.pregunta);
      this.YES = this.translate.instant(this.si);
      this.NOT = this.translate.instant(this.no);
      this.INVALID_FILE_FORMAT = this.translate.instant(this.formatoArchivoNoValido);
      this.EXIST_PERSONAL_ACTIVITY = this.translate.instant(this.existPersonalActivity);
      this.MSG_ERROR_REGISTRARSE = this.translate.instant(this.msgErrorRegistrarse);
      this.DAYS = this.translate.instant(this.dias);
      this.MONTHS = this.translate.instant(this.meses);
      this.YEARS = this.translate.instant(this.anios);
      this.EXIST_CONVOCATORY = this.translate.instant(this.existConvocatory);
      this.REPEATED_DATA = this.translate.instant(this.datosRepetidos);
      this.UPDATE_CONFIRMATION = this.translate.instant(this.updateConfirmation);
      this.UPDATE_CONFIRMATION_CONVOCATORIA = this.translate.instant(this.updateConfirmationConvocatoria);
      this.EXIST_ACTIVITY = this.translate.instant(this.existActivity);
      this.ERROR_CONFIG_ADITIONAL_DATA = this.translate.instant(this.datosRequeridosAdicionales);
      this.ERROR_SUM_ADITIONAL_DATA = this.translate.instant(this.sumaDatosAdicionales);
      this.ERROR_RANGE = this.translate.instant(this.rangoIncorrecto);
      this.FECHAS_INCORRECTAS_CRONOGRAMA = this.translate.instant(this.fechasIncorrectasCronograma);
      this.SUM_ETAPA_COMBIN_INCORRECTO = this.translate.instant(this.sumEtapaCombiIncorrecto);
      this.PASSWORD_WRONG = this.translate.instant(this.contraseniaIncorrecta);
      this.MSG_DELETE_RECORD_CONSTRAINT = this.translate.instant(this.errorRegistroForaneaDelete);
      this.MSG_UPDATE_RECORD_CONSTRAINT = this.translate.instant(this.errorRegistroForaneaUpdate);
      this.MSG_DEACTIVATE_ACCOUNT_USER = this.translate.instant(this.deactivateAccountUser);
      this.DEACTIVATE_CONFIRMATION = this.translate.instant(this.deactivateConfirmation);
      this.VERIFY_TOKEN_DEACTIVATE_USER = this.translate.instant(this.verifyTokenDeactivateUser);
      this.ERROR_DEACTIVATE_ACCOUNT_USER = this.translate.instant(this.errorDeactivateAccountUser);
      this.MSG_EMPTY_TITLES = this.translate.instant(this.msgEmptyTitles);
      this.MSG_EMPTY_EXPERIENCES = this.translate.instant(this.msgEmptyExperiences);
      this.MSG_SELECT_AGREEMENT = this.translate.instant(this.msgSelectAgreement);
      this.MSG_NO_TIENE_PERMISO_ACCION = this.translate.instant(this.msgNoTienePermisoAccion);
      this.NAC_COLOMBIANA = this.translate.instant(this.nacColombiana);
      this.NAC_DOBLE_NACIONALIDAD = this.translate.instant(this.nacDobleNacionalidad);
      this.NAC_COLOMBIANA_POR_ADPCION = this.translate.instant(this.nacColombianaPorAdopcion);
      this.MILITAR_CARD_FIRST = this.translate.instant(this.militarCardPrimera);
      this.MILITAR_CARD_SECOND = this.translate.instant(this.militarCardSegunda);
      this.DEACTIVATE_PROFILE_CONFIRMATION = this.translate.instant(this.deactivateProfileConfirmation);
      this.NUM_MAX_MONTHS = this.translate.instant(this.numMaxMonths);
      this.DEACTIVATE_USER = this.translate.instant(this.deactivateUser);
      this.ACTIVATE_USER = this.translate.instant(this.activateUser);
      this.DUPLICATE_ROLE = this.translate.instant(this.duplicateRole);
      this.MSG_TITULO_ACADEMICO_REQUERIDO = this.translate.instant(this.msgTituloAcademicoRequerido);
      this.MSG_EXPERIENCIA_EXTERNA_REQUERIDO = this.translate.instant(this.msgExperienciaExternaRequerido);
      this.ACCESS_DENIED = this.translate.instant(this.msgAccessDenied);
      this.USER_ADMIN_INACTIVE_MSG = this.translate.instant(this.userAdminInactiveMsg);
      this.USER_EXISTS = this.translate.instant(this.userExistMsg);
      this.ERROR_DELETE_VIEW = this.translate.instant(this.errorDeleteViewFather);
      this.UPDATE_CONFIRMATION_RECORDS = this.translate.instant(this.updateConfirmationRecords);
      this.UNSELECTED_CONFIRMATION = this.translate.instant(this.unselectedConfirmation);
      this.SELECTED_FAVORITE = this.translate.instant(this.selectedFavorite);
      this.UNSELECTED_FAVORITE = this.translate.instant(this.unselectedFavorite);
      this.INSCRIPTION_CONFIRMATION = this.translate.instant(this.inscriptionConfirmation);
      this.MSG_VALIDATE_INFORMATION_CV = this.translate.instant(this.msgValidateInformationCV);
      this.MSG_NUM_MAX_INSCRIPTIONS = this.translate.instant(this.msgNumMaxInscriptions);
      this.MSG_SUCCESSFUL_ENROLLMENT = this.translate.instant(this.msgSuccessfulEnrollment);
      this.MSG_CANCEL_ENROLLMENT_CONFIRMATION = this.translate.instant(this.msgCancelEnrollmentConfimation);
      this.MSG_SUCCESSFUL_CANCEL_ENROLLMENT = this.translate.instant(this.msgSuccessfulCancelEnrollment);
      this.ARCHIVO_NO_EXISTE = this.translate.instant(this.archivoNoExiste);
      this.CLOSE = this.translate.instant(this.cerrar);
      this.MSG_LIST_TEST_EMPTY = this.translate.instant(this.msgListTestEmpty);
      this.MSG_LIST_APPLICANT_EMPTY = this.translate.instant(this.msgListApplicantEmpty);
      this.SEARCH = this.translate.instant(this.search);
      this.SELECT_ALL = this.translate.instant(this.selectAll);
      this.UNSELECT = this.translate.instant(this.unselect);
      this.PUBLICATION_MSG = this.translate.instant(this.publication_msg);
      this.NOT_PUBLICATION_MSG = this.translate.instant(this.not_publication_msg);
      this.PUBLICATION_QUESTION_MSG = this.translate.instant(this.publication_questions_msg);
      this.CONVOCATORIA_PUBLICADA_MSG = this.translate.instant(this.convocatoria_publicada_msg);
      this.CONVOCATORIA_ENCOSTRUCION_MSG = this.translate.instant(this.convocatoria_encostrucion_msg);
      this.CONVOCATORIA_CERRADA_MSG = this.translate.instant(this.convocatoria_cerrada_msg);
      this.CONVOCATORIA_INACTIVA_MSG = this.translate.instant(this.convocatoria_inactiva_msg);
      this.INFORMACION_EDITAR_ELIMINAR = this.translate.instant(this.informacion_publicar_eliminar);
      this.DOCUMENTOS_CHECK_INVALIDOS = this.translate.instant(this.docInvalidoCheck);
      this.CONVOCATORIA_INACTIVA_NO_PUBLICADA = this.translate.instant(this.convocatoria_inactiva_no_publicada);
      this.MSG_CITACION_CONFIRMATION = this.translate.instant(this.msgCitacionConfirmation);
      this.MSG_SUCCESSFUL_CALL = this.translate.instant(this.msgSuccessfulCall);
      this.MSG_SUCCESSFUL_NOTIFICATION = this.translate.instant(this.msgSuccessfulNotification);
      this.NOTIFICACION_EXITOSA = this.translate.instant(this.notificacionExitosa);
      this.MSG_COMUNICADO_ADMITIDO_ASPIRANTE = this.translate.instant(this.msgComunicadoAdmitidoNoAdmitidoAspirante);
      this.INACTIVA = this.translate.instant(this.inactiva);
      this.CERRADA = this.translate.instant(this.cerrada);
      this.PUBLICADA = this.translate.instant(this.publicada);
      this.ACTIVA = this.translate.instant(this.activa);
      this.INFORMACION_ACADEMICA = this.translate.instant(this.informacionAcademica);
      this.EXPERIENCIA_LABORAL = this.translate.instant(this.expLaboral);
      this.EXPERIENCIA_LABORAL_RAMA = this.translate.instant(this.expLaboralRama);
      this.CONFIGURACION_FUNCI_ALTAS_CORTES = this.translate.instant(this.configuracionFunciAltasCortes);
      this.CONVOCATORIA_SIN_CRONOGRAMA = this.translate.instant(this.convocatoriaSinCronograma);
      this.FECHAS_ELIMANCION = this.translate.instant(this.fechaeliminacion);
      this.REQUALIFICATION_CONFIRMATION = this.translate.instant(this.requalificationConfirmation);
      this.UPDATE_INSCRIPTION_CONFIRMATION = this.translate.instant(this.updateInscriptionConfirmation);
      this.MSG_SUCCESSFUL_UPDATE_INSCRIPTION = this.translate.instant(this.msgSuccessfulUpdateInscription);
      this.INFORMACION_PERSONAL = this.translate.instant(this.informacionPersonal);
      this.MSG_NUMBER_MAX_EXCEEDED_EXPERIENCE = this.translate.instant(this.msgNumberMaxExceedeExperience);
      this.MSG_NUMBER_MAX_EXCEEDED_INFO = this.translate.instant(this.msgNumberMaxExceedeInfo);
      this.MSG_LOAD_INFO_CONFIRMATION = this.translate.instant(this.msgLoadInfoConfirmation);
      this.PUNTAJE_MAYOR_A_CERO = this.translate.instant(this.puntajeMayorACero);
      this.MSG_ERROR_LOAD_INFO_FILE = this.translate.instant(this.msgErrorLoadInfoFile);
      this.APRUEBA = this.translate.instant(this.aprueba);
      this.PIERDE_POR_INASISTENCIA = this.translate.instant(this.pierdePorInasistencia);
      this.PIERDE_POR_NOTA = this.translate.instant(this.pierdePorNota);
      this.HOMOLOGADO = this.translate.instant(this.homologado);
      this.RETIRO_VOLUNTARIO = this.translate.instant(this.retiroVoluntario);
      this.MSG_EMPTY_TEST_RESULTS = this.translate.instant(this.msgEmptyTestResults);
      this.MSG_INVALID_TEST_RESULTS = this.translate.instant(this.msgInvalidTestResults);
      this.CONFIRMAR_PUBLICACION = this.translate.instant(this.msgConfirmarPublicacion);
      this.VACANTE_PUBLICADA_MSG = this.translate.instant(this.msgVacantePublicada);
      this.MSG_RESULTADOS_PRUEBAS_PROCESADAS = this.translate.instant(this.msgResultadosPruebasProcesadas);
      this.MSG_APRUEBA = this.translate.instant(this.msgAprueba);
      this.MSG_NO_APRUEBA = this.translate.instant(this.msgNoAprueba);
      this.MSG_CANCEL_REGISTRATION_VACANCY_CONFIRMATION = this.translate.instant(this.msgCancelRegistrationVacancyConfirmation);
      this.MSG_STATUS_CHANGE_VACANCY_CONFIRMATION = this.translate.instant(this.msgStatusChangeVacancyConfirmation);
      this.MSG_COMUNICADO_ELEGIDOS_RECHAZADOS = this.translate.instant(this.msgComunicadoElegidosRechazados);
      this.MSG_POSESION_ASPIRANTE_CONFIRMACION = this.translate.instant(this.msgPosesionAspiranteConfirmacion);
      this.MSG_LIBERAR_VACANTE_POSESION_CONFIRMATION = this.translate.instant(this.msgLiberarVacantePosesionConfirmation);
      this.MSG_VALOR_SUPERA_MAXIMO_PERMITIDO = this.translate.instant(this.msgValorSuperaMaximoPermitido);
      this.MSG_LISTA_ASPIRANTES_VACANTE_VACIA = this.translate.instant(this.msgListaAspirantesVacanteVacia);
      this.MSG_IDENTIDAD_NO_VALIDA = this.translate.instant(this.msgIdentidadNoValida);
      this.MSG_REQUEST_REQUALIFICATION_PENDING = this.translate.instant(this.msgRequestRequalificationPending);
      this.MSG_CONVOCATORIA_LISTA_ELEGIBLES = this.translate.instant(this.msgConvocatoriaListaElegibles);
      this.MSG_EXISTEN_RESULTADOS_PRUEBAS = this.translate.instant(this.msgExistenResultadosPruebas);
      this.MSG_SUCCESSFUL_MAILING_MESSAGE = this.translate.instant(this.msgSuccessfulMailingMessage);
      this.MSG_VACANCY_SELECTION_CONFIRMATION = this.translate.instant(this.msgVacancySelectionConfirmation);
      this.MSG_SECCIONAL_VACANTE = this.translate.instant(this.msgSeleccionVacante);
      this.MSG_SECCIONAL_ANULACION = this.translate.instant(this.msgAnulacionSeleccion);
      this.MSG_CARGUE_EXITOSO = this.translate.instant(this.msgCargueExitoso);
      this.MSG_RECLASSIFICATION_SUCCESSFUL = this.translate.instant(this.msgReclassificationSuccessful);
      this.MSG_FECHA_NO_HABIL = this.translate.instant(this.msgFechaNoHabil);
      this.DOC_INCORRECTO_OBSERVACIONES = this.translate.instant(this.docIncorrectoObservaciones);
      this.MSG_VALOR_NO_SUPERA_MINIMO_PERMITIDO = this.translate.instant(this.msgValorNoSuperaMinimoPermitido);
      this.FINISH_QUESTION_MSG = this.translate.instant(this.finish_questions_msg);      
      this.MSG_DOCUMENTOS_TRASLADO_INCOMPLETOS = this.translate.instant(this.msgDocumentosTrasladoIncompletos);
      this.INFORMACION_ANEXOS = this.translate.instant(this.informacionAnexos);
      this.NO_INSCRITO_CURSO_FORMACION = this.translate.instant(this.noInscritoCursoFormacion);
      this.MSG_NUMERO_DOCUMENTO_NO_EXISTE = this.translate.instant(this.msgNumeroDocumentoNoExiste);
      this.MSG_DECLINAR_VACANTE_CONFIRMACION = this.translate.instant(this.msgDeclinarVacanteConfirmacion);
      this.MSG_PRESELECCION_EXITOSA = this.translate.instant(this.msgPreseleccionExitosa);
      this.MSG_DECLINACION_EXITOSA = this.translate.instant(this.msgDeclinacionExitosa);
      this.MSG_ELEGIBLE_ALTAS_CORTES_CONFIRMACION = this.translate.instant(this.msgElegibleAltasCortesConfirmacion);
      this.MSG_NUM_MAX_INSCRIPTIONS_DIF_CONVOCATORIAS = this.translate.instant(this.msgNumMaxInscriptionsDifConvocatorias);
      this.MSG_ASPIRANTE_TIENE_RESULTADO_CURSO_FORMACION = this.translate.instant(this.msgAspiranteTieneResultadoCursoFormacion);
      this.MSG_SOLICITUD_TRASLADO_EXITOSA = this.translate.instant(this.msgSolicitudTrasladoExitosa);
      this.MSG_CONFIRMACION_ELIMINAR_ASPIRANTE_DE_LISTA = this.translate.instant(this.msgConfirmacionEliminarAspiranteDeLista);
      this.MSG_FECHA_INGRESADA_EXISTE = this.translate.instant(this.msgFechaIngresadaExiste);
      this.MSG_LISTA_ELEGIBLES_EXITOSA = this.translate.instant(this.msgListaElegiblesExitosa);
      this.MSG_COD_DESPACHO_NO_EXISTE = this.translate.instant(this.msgCodDespachoNoExiste);
      this.MSG_SELECCIONE_DESPACHO = this.translate.instant(this.msgSeleccioneDespacho);
      this.MSG_TRASLADO_SIN_FECHA_HABIL = this.translate.instant(this.msgTrasladoSinFechaHabil);
      this.MSG_SELECCIONE_CARGO = this.translate.instant(this.msgSeleccioneCargo);
      this.MSG_COD_NIVEL_CONTRATACION_PROPIEDAD = this.translate.instant(this.msgCodNivelContratacionPropiedad);
    });
  }

  public getStateUser(state: number): string {
    switch (state) {
      case statesUser.ACTIVE:
        return this.STATE_ACTIVE;
      case statesUser.FORCE_CHANGE_PASSWORD:
        return this.STATE_FORCE_CHANGE_PASSWORD;
      case statesUser.INACTIVE:
        return this.STATE_INACTIVE;
      case statesUser.PENDING_ACTIVATION:
        return this.STATE_PENDING_ACTIVATION;
    }
  }

  public getStatesUser(): any[] {
    const lstStates = [
      {
        id: statesUser.ACTIVE,
        name: this.STATE_ACTIVE
      },
      {
        id: statesUser.INACTIVE,
        name: this.STATE_INACTIVE
      },
      {
        id: statesUser.PENDING_ACTIVATION,
        name: this.STATE_PENDING_ACTIVATION
      },
      {
        id: statesUser.FORCE_CHANGE_PASSWORD,
        name: this.STATE_FORCE_CHANGE_PASSWORD
      },

    ];
    return lstStates;
  }

  public lstYesOrNot() {
    return [{
      id: 1,
      valor: this.YES,
      checked: false,
    }, {
      id: 0,
      valor: this.NOT,
      checked: true,
    }];
  }

  public lstNacionalities() {
    return [{
      id: 'Colombiana',
      valor: this.NAC_COLOMBIANA,
    }, {
      id: 'DobleNacionalidad',
      valor: this.NAC_DOBLE_NACIONALIDAD,
      checked: false,
    }, {
      id: 'ColombianaPorAdopcion',
      valor: this.NAC_DOBLE_NACIONALIDAD,
    }];
  }

  public lstClassMilitaryCard() {
    return [{
      id: 'primera',
      valor: this.MILITAR_CARD_FIRST,
    }, {
      id: 'segunda',
      valor: this.MILITAR_CARD_SECOND,
    }];
  }

  public lstNameCualities() {
    return [{
      text: 'Propiedad',
      text_En: 'Property',
      id: '1'
    }, {
      text: 'Provisional',
      text_En: 'Provisional',
      id: '2'
    }, {
      text: 'Encargo',
      text_En: 'Charge',
      id: '3'
    }];
  }

  public lstEstadosCursoFormacion() {
    return [{
      id: 1,
      valor: this.APRUEBA,
      checked: false,
    }, {
      id: 2,
      valor: this.PIERDE_POR_INASISTENCIA,
      checked: false,
    }, {
      id: 3,
      valor: this.PIERDE_POR_NOTA,
      checked: false,
    }, {
      id: 4,
      valor: this.HOMOLOGADO,
      checked: false,
    }, {
      id: 5,
      valor: this.RETIRO_VOLUNTARIO,
      checked: false,
    }, {
      id: 6,
      valor: this.NO_INSCRITO_CURSO_FORMACION,
      checked: false,
    }
  ];
  }
}
