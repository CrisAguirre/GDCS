import { forkJoin, Observable } from 'rxjs';
import { CargarCitacionModel } from '@app/compartido/modelos/cargar-citacion-model';
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { configMsg, TipoInfoCargue } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { CitacionAspiranteModel } from '@app/compartido/modelos/citacion-aspirante-model';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-citaciones-aspirante',
  templateUrl: './citaciones-aspirante.component.html',
  styleUrls: ['./citaciones-aspirante.component.scss']
})
export class CitacionesAspiranteComponent extends BaseController implements OnInit, AfterViewChecked {

  // data: AOA = [[], []];
  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' };
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;

  public idArchivoInfoCargue = new FormControl('');

  public data: any[] = [];
  public lstDataAValidar: CargarCitacionModel[] = [];
  public lstDataValidos: CargarCitacionModel[] = [];
  public lstDataAll: CargarCitacionModel[] = [];
  public lstDataNoValidos: CargarCitacionModel[] = [];
  public lstCabecerasArchivo: any[] = [];
  public submit = true;
  public matcher: any;
  public showTable = false;
  public cargaRealizada = false;
  public showButtonExport = false;
  public showMsgExport = false;

  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  public displayedColumns: string[] = ['idConvocatoria', 'idLugarPrueba', 'fechaPrueba', 'horaPrueba', 'idTipoPrueba', 'identificacionAspirante', 'codigoAlternoPerfil', 'msgError'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() fileTypeName: string;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;

  constructor(
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private cs: ConvocatoriaService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private fileService: FilesService,
    private alertService: AlertService
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
    this.dataSource.data = [];

  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
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

      this.lstCabecerasArchivo = this.data[0];
      // this.displayedColumns2 = this.lstCabecerasArchivo;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  public loadInfoFile(event) {
    if (event) {
      // this.onFileChange(event);
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
        this.lstDataAValidar = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        this.lstDataAValidar.forEach(e => {
          const splitDate = e.fechaPrueba.split('-');
          const dia = Number(splitDate[0]);
          const mes = Number(splitDate[1]);
          const anio = Number(splitDate[2]);
          const date = new Date(anio, mes - 1, dia).toDateString();
          e.fechaPruebaStr = date;
        });
        this.dataSource.data = this.lstDataAValidar;
        this.submit = false;
      };
    }
  }

  public saveInfoFile() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    let count = 0;
    if (this.lstDataAValidar.length > 0) {
      this.alertService.comfirmation(this.ct.MSG_LOAD_INFO_CONFIRMATION, TYPES.INFO)
        .then(ok1 => {
          if (ok1.value) {
            this.alertService.loading();
            const lst: Observable<any>[] = [];
            this.lstDataAValidar.forEach(async e => {
              const validarInfoRegistro: any = {
                idConvocatoria: e.idConvocatoria,
                idLugarPrueba: e.idLugarPrueba,
                idTipoPrueba: e.idTipoPrueba,
                numDocumento: String(e.identificacionAspirante),
                codigoAlternoPerfil: String(e.codigoAlternoPerfil)
              };
              lst.push(this.cs.validarInformacionRegistro(validarInfoRegistro));
              count++;
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
                  if (!obj.ExisteLugarPrueba) {
                    msgError += ' - No existe el lugar de la prueba';
                    existeError = true;
                  }
                  if (!obj.ExistePerfilRelacionado) {
                    msgError += ' - No existe el perfil';
                    existeError = true;
                  }
                  if (!obj.ExisteTipoPrueba) {
                    msgError += ' - No existe el tipo de prueba';
                    existeError = true;
                  }
                  if (!obj.ExisteUsuarioInscrito) {
                    msgError += ' - No existe el usuario inscrito';
                    existeError = true;
                  }
                  e.msgError = msgError;

                  if (!existeError) {
                    msgError = 'Exitoso';
                    e.msgError = msgError;
                    e.idEmpresa = obj.IdEmpresa;
                    e.idInscripcionConvocatoria = obj.IdInscripcionAspirante;
                    e.idPerfilConvocatoria = obj.IdPerfilConvocatoria;
                    e.tipoPrueba = obj.TipoPrueba;
                    e.idUsuarioAspirante = obj.IdUsuario;
                    this.lstDataValidos.push(e);
                  } else {
                    this.lstDataNoValidos.push(e);
                  }
                  this.lstDataAll.push(e);
                });                
                if (this.lstDataValidos.length > 0) {
                  let contadorRegistro = 0;
                  this.lstDataValidos.forEach(async d => {
                    /* const dateString = d.fechaPrueba;
                    const newDate = new Date(dateString);

                    const datePipe = new DatePipe('es-CO');
                    const fechaPruebaFormat = datePipe.transform(d.fechaPrueba, Constants.FORMAT_DATE_VIEW);

                    const dateP = new Date(fechaPruebaFormat); */

                    const lstPruebas: any[] = [];
                    lstPruebas.push(d.tipoPrueba);

                    const newCitacion: CitacionAspiranteModel = {
                      id: undefined,
                      idEmpresa: d.idEmpresa,
                      idConvocatoria: d.idConvocatoria,
                      // idTipoPrueba: JSON.stringify(d.tipoPrueba),
                      idTipoPrueba: JSON.stringify(lstPruebas),
                      idLugarPrueba: d.idLugarPrueba,
                      fechaCitacion: d.fechaPruebaStr,
                      horaCitacion: d.horaPrueba,
                      idUsuarioAspirante: d.idUsuarioAspirante,
                      idUsuarioAdmin: this.user.id,
                      idInscripcionAspirante: d.idInscripcionConvocatoria
                    };

                    await this.cs.saveCitacionAspirante(newCitacion)
                      .toPromise()
                      .catch(error => {
                        this.alertService.showError(error);
                      }).finally(() => contadorRegistro++);

                    if (contadorRegistro === this.lstDataValidos.length) {
                      this.alertService.message(this.ct.MSG_CARGUE_EXITOSO, TYPES.SUCCES)
                        .finally(() => {
                          this.submit = true;
                          this.cargaRealizada = true;
                          this.exportUnregisteredData(this.lstDataNoValidos);
                        });
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

  public exportUnregisteredData(lstNoValidos: any) {
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
