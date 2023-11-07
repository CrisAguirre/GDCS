import { VacantesService } from '@app/core/servicios/vacantes.service';
import { VacanteModel } from '@app/compartido/modelos/vacante-model';
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, NgForm, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { configMsg } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { FilesService } from '@app/core/servicios/files.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-vacantes',
  templateUrl: './vacantes.component.html',
  styleUrls: ['./vacantes.component.scss']
})
export class VacantesComponent extends BaseController implements OnInit, AfterViewChecked {

  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' };
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;

  // public lstDataValidos: any[] = [];
  // public lstDataAll: any[] = [];

  public data: any[] = [];
  public lstDataAValidar: any[] = [];
  public lstDataNoValidos: any[] = [];
  public lstDataValidos: any[] = [];
  public lstDataAll: any[] = [];
  // public lstCabecerasArchivo: any[] = [];
  public submit = true;
  public matcher: any;
  public showTable = true;
  public cargaRealizada = false;
  public showButtonExport = false;
  public showMsgExport = false;

  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  // public displayedColumns: string[] = ['idConvocatoria', 'codigoDespacho', 'despacho', 'ordenDespacho', 'distrito', 'idMunicipio', 'vacante', 'identificacion', 'fechaVacante', 'situacionVacante', 'observaciones'];
  public displayedColumns: string[] = ['idConvocatoria', 'codigoAlternoPerfil', 'codigoDespacho', 'despacho', 'ordenDespacho', 'distrito', 'idMunicipio', 'vacante', 'identificacion', 'fechaVacante', 'situacionVacante', 'observaciones', 'tipoVacante', 'cantidadVacantes', 'msgError'];
  public dataSource = new MatTableDataSource<any>([]);

  @Input() fileTypeName: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;

  constructor(
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private cs: ConvocatoriaService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private fileService: FilesService,
    private alertService: AlertService,
    private vacanteService: VacantesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }


  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.loadForm();
    this.loadExtensions();
  }


  public loadForm() {
    this.form = this.fb.group(
      {
        idArchivoCargue: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async loadExtensions() {
    const exten = (await this.commonService.getMessageByName(configMsg.ALLOW_EXTENSIONS_UPLOAD_FILE_INFO).toPromise() as any).datos.valor as any;
    this.configFile.allowExtensions = exten;
    this.configFile.sizeFile = C.byteToMb(Number(this.commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  public onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = (evt.target) as DataTransfer;
    if (target.files.length !== 1) { throw new Error('Cannot use multiple files'); }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = ((XLSX.utils.sheet_to_json(ws, { header: 1 })) as any);
      // this.lstCabecerasArchivo = this.data[0];
      // this.displayedColumns = this.lstCabecerasArchivo;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  public loadInfoFile(event) {
    if (event) {
      this.onFileChange(event);
      this.file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(this.file);
      fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        const data = new Uint8Array(this.arrayBuffer);
        const arr = new Array();

        // tslint:disable-next-line: triple-equals
        for (let i = 0; i != data.length; i++) { arr[i] = String.fromCharCode(data[i]); }
        const bstr = arr.join('');
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        this.lstDataAValidar = XLSX.utils.sheet_to_json(worksheet, { dateNF: 'dd.MM.yyyy' });
        this.dataSource.data = this.lstDataAValidar;
        this.submit = false;
      };
    }
  }

  public getSituacionVacante(element: any) {
    let estadoVacante = '';
    const estadoSituacionVacante = {
      estadoVacante: 0,
      situacionActualVacante: '',
    };

    if (element.vacanteNueva) {
      estadoVacante = 'Vacante nueva para Publicar';
      estadoSituacionVacante.estadoVacante = 1;
      estadoSituacionVacante.situacionActualVacante = 'Vacante nueva para Publicar';
    } else if (element.vacanteListaAgotadaOTraslado) {
      estadoVacante = 'Vacante para publicar por lista agotada o por traslado no acogido o declinado';
      estadoSituacionVacante.estadoVacante = 2;
      estadoSituacionVacante.situacionActualVacante = 'Vacante para publicar por lista agotada o por traslado no acogido o declinado';
    } else if (element.listaAspirantesEnTramite) {
      estadoVacante = 'Con lista de aspirantes en trámite';
      estadoSituacionVacante.estadoVacante = 3;
      estadoSituacionVacante.situacionActualVacante = 'Con lista de aspirantes en trámite';
    } else if (element.trasladoEnTramiteSeccional) {
      estadoVacante = 'Con traslado en trámite (Proyectado por la Seccional)';
      estadoSituacionVacante.estadoVacante = 4;
      estadoSituacionVacante.situacionActualVacante = 'Con traslado en trámite (Proyectado por la Seccional)';
    } else if (element.trasladoEnTramiteConsejo) {
      estadoVacante = 'Con traslado en trámite (Proyectado por el Consejo Superior)';
      estadoSituacionVacante.estadoVacante = 5;
      estadoSituacionVacante.situacionActualVacante = 'Con traslado en trámite (Proyectado por el Consejo Superior)';
    } else if (element.reordenamientoEnTramite) {
      estadoVacante = 'Con proyecto de reordenamiento en trámite';
      estadoSituacionVacante.estadoVacante = 6;
      estadoSituacionVacante.situacionActualVacante = 'Con proyecto de reordenamiento en trámite';
    } else if (element.proteccionLaboral) {
      estadoVacante = 'Protección laboral';
      estadoSituacionVacante.estadoVacante = 7;
      estadoSituacionVacante.situacionActualVacante = 'Protección laboral';
    }

    return estadoSituacionVacante;
  }

  public getFechaVacante(element: any) {
    let date = null;
    let formatFechaVacante = '';
    const datePipe = new DatePipe('es-CO');
    if (element.fechaVacante) {
      const splitDate = element.fechaVacante.split('-');
      // const fechaTemp = new Date(splitDate[2], splitDate[1], splitDate[0]);
      date = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]).toDateString();
      formatFechaVacante = datePipe.transform(date, Constants.FORMAT_DATE_VIEW);
      element.fecha = formatFechaVacante;
    }
    return formatFechaVacante;
  }

  public getFechaVacanteAnioMesDia(element: any) {
    if (element.dia && element.mes && element.anio) {
      const fechaVacante = [
        element.dia,
        element.mes,
        element.anio
      ].join('/');
      return fechaVacante;
    } else {
      return '';
    }
  }

  public getTipoVacante(element: any) {
    let tipoVacante = '';
    if (element.tipoVacante === 1) {
      tipoVacante = 'Juez';
    } else if (element.tipoVacante === 2) {
      tipoVacante = 'Magistrado';
    } else if (element.tipoVacante === 3) {
      tipoVacante = 'Empleado';
    }
    return tipoVacante;
  }

  public saveInfoFile() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();
    if (this.lstDataAValidar.length > 0) {
      this.alertService.comfirmation(this.ct.MSG_LOAD_INFO_CONFIRMATION, TYPES.INFO)
        .then(ok => {
          if (ok.value) {
            this.alertService.loading();

            const lst: Observable<any>[] = [];
            this.lstDataAValidar.forEach(async e => {
              const validarInfoRegistro: any = {
                idConvocatoria: e.idConvocatoria,
                codigoAlternoPerfil: String(e.codigoAlternoPerfil),
              };
              lst.push(this.vacanteService.validarInformacionRegistroVacante(validarInfoRegistro));
            });

            forkJoin(lst).subscribe({
              next: (res: any) => {
                this.lstDataAValidar.forEach((e, index) => {
                  const obj = res[index].datos;
                  let msgError = '';
                  let existeError = false;

                  // Valida si el objeto contiene algun error
                  if (!obj.ExisteConvocatoria) {
                    msgError = ' - No existe la convocatoria';
                    existeError = true;
                  }
                  if (!obj.ExistePerfilRelacionado) {
                    msgError += ' - No existe perfil relacionado';
                    existeError = true;
                  }
                  e.msgError = msgError;

                  if (!existeError) {
                    msgError = 'Exitoso';
                    e.msgError = msgError;
                    e.idPerfilConvocatoria = obj.IdPerfilConvocatoria;
                    this.lstDataValidos.push(e);
                  } else {
                    this.lstDataNoValidos.push(e);
                  }
                  this.lstDataAll.push(e);
                });

                if (this.lstDataValidos.length > 0) {
                  let contadorRegistro = 0;
                  const lstAdd: Observable<any>[] = [];
                  this.lstDataValidos.forEach(async e => {
                    let date = null;
                    let formatFechaVacante = '';
                    const datePipe = new DatePipe('es-CO');
                    if (e.fechaVacante) {
                      const splitDate = e.fechaVacante.split('-');
                      date = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]).toDateString();
                      formatFechaVacante = datePipe.transform(date, Constants.FORMAT_DATE_VIEW);
                      e.fecha = formatFechaVacante;
                    }

                    let situacionActVacante = null;
                    situacionActVacante = this.getSituacionVacante(e);

                    const newVacante: VacanteModel = {
                      id: undefined,
                      idConvocatoria: e.idConvocatoria,
                      idUsuarioRegistra: this.user.id,
                      codigoDespacho: e.codigoDespacho ? e.codigoDespacho.toString() : null,
                      despacho: e.despacho ? e.despacho : null,
                      numOrdenDespacho: e.numOrdenDespacho,
                      distrito: e.distrito ? e.distrito : null,
                      idMunicipio: Number(e.idMunicipio),
                      vacanteFuncionario: e.vacanteFuncionario ? e.vacanteFuncionario : null,
                      cedulaFuncionario: e.cedulaFuncionario ? e.cedulaFuncionario.toString() : null,
                      fechaVacante: null,
                      situacionActualVacante: situacionActVacante ? situacionActVacante.situacionActualVacante : null,
                      observaciones: e.observaciones ? e.observaciones : null,
                      anioFechaVacante: Number(e.anio),
                      mesFechaVacante: Number(e.mes),
                      diaFechaVacante: Number(e.dia),
                      estadoVacante: situacionActVacante ? situacionActVacante.estadoVacante : null,
                      idConvocatoriaPerfil: e.idPerfilConvocatoria,
                      tipoVacante: e.tipoVacante
                    };

                    const nVacantes = Number(e.cantidadVacantes);
                    if (nVacantes > 1) {
                      for (let i = 0; i < e.cantidadVacantes; i++) {
                        lstAdd.push(this.vacanteService.saveVacanteAnioMesDia(newVacante));
                      }
                    } else {
                      lstAdd.push(this.vacanteService.saveVacanteAnioMesDia(newVacante));
                    }

                    // await this.vacanteService.saveVacante(newVacante).toPromise()
                    /* await this.vacanteService.saveVacanteAnioMesDia(newVacante)
                      .toPromise()
                      .catch(error => {
                        this.lstDataNoValidos.push(e);
                      }).finally(() => contadorRegistro++); */

                    /* if (contadorRegistro === this.lstDataValidos.length) {
                      this.alertService.message(this.ct.MSG_CARGUE_EXITOSO, TYPES.SUCCES)
                        .finally(() => {
                          this.submit = true;
                          this.cargaRealizada = true;
                          this.exportUnregisteredData(this.lstDataNoValidos);
                        });
                    } */
                    /* } catch (error) {
                      this.lstDataNoValidos.push(e);
                      this.alertService.showError(error);
                    } */

                  });
                  forkJoin(lstAdd).subscribe({
                    next: () => {
                      this.alertService.message(this.ct.MSG_CARGUE_EXITOSO, TYPES.SUCCES)
                        .finally(() => {
                          this.submit = true;
                          this.cargaRealizada = true;
                          this.exportUnregisteredData(this.lstDataNoValidos);
                        });
                    },
                    error: (error) => {            
                      this.alertService.showError(error);
                    }
                  });
                } else {
                  this.alertService.message(this.ct.MSG_ERROR_LOAD_INFO_FILE, TYPES.ERROR)
                    .finally(() => {
                      this.submit = true;
                      this.cargaRealizada = true;
                      this.exportUnregisteredData(this.lstDataNoValidos);
                    });
                }
              },
              error: () => {
                console.log('ERROR');
              }
            });
          }
        });
    }
  }

  public exportUnregisteredData(lstNoValidos: any[]) {
    if (this.cargaRealizada && lstNoValidos.length > 0) {
      this.dataSource.data = lstNoValidos;
      this.showButtonExport = true;
      this.showMsgExport = true;
    } else {
      this.dataSource.data = [];
      this.showButtonExport = false;
      this.showMsgExport = false;
    }
  }

  public clean() {
    this.showMsgExport = false;
    this.showButtonExport = false;
    this.submit = false;
    this.formV.resetForm();
    this.lstDataAValidar = [];
    this.data = [];
    this.dataSource.data = [];
    this.clearInputFile(this.inputFileView);
  }

  public deleteFile() {
    this.f.idArchivoCargue.setValue(null);
    this.f.idArchivoCargue.markAsUntouched();
    this.lstDataAValidar = [];
    this.data = [];
    this.dataSource.data = [];
  }
}
