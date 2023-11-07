import { CargarResultadoPruebasModel } from '@app/compartido/modelos/cargar-resultado-pruebas-model';
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { configMsg } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import * as XLSX from 'xlsx';
import { forkJoin, Observable } from 'rxjs';
import { ResultadoPruebasModel } from '@app/compartido/modelos/resultado-pruebas-model';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';

@Component({
  selector: 'app-cargue-resultados-pruebas',
  templateUrl: './cargue-resultados-pruebas.component.html',
  styleUrls: ['./cargue-resultados-pruebas.component.scss']
})
export class CargueResultadosPruebasComponent extends BaseController implements OnInit, AfterViewChecked {

  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' };
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;

  public data: any[] = [];
  public lstDataAValidar: CargarResultadoPruebasModel[] = [];
  public lstDataValidos: CargarResultadoPruebasModel[] = [];
  public lstDataAll: CargarResultadoPruebasModel[] = [];
  public lstDataNoValidos: any[] = [];

  public submit = true;
  public matcher: any;
  public showTable = false;
  public cargaRealizada = false;
  public showButtonExport = false;
  public showMsgExport = false;

  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  public displayedColumns: string[] = ['idTipoPrueba', 'idConvocatoria', 'numRegistro', 'cedula', 'codigoPerfil', 'puntajeDirecto', 'media', 'desviacion', 'z', 'mayor05', 'aprueba05', 'mayor1', 'aprueba1', 'mayor15', 'aprueba15', 'mayor2', 'aprueba2', 'resultadoFinal', 'msgError'];
  /* public displayedColumns: string[] = ['idConvocatoria', 'numRegistro', 'cedula', 'codigoPerfil', 'puntajeDirecto', 'media',
                                      'desviacion', 'z', 'mayor05', 'aprueba05', 'mayor1', 'aprueba1', 'mayor15', 'aprueba15',
                                      'mayor2', 'aprueba2', 'pruebaActitud', 'pruebaConocimientos', 'pruebaConocimientosEsp', 'resultadoFinal']; */
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
        this.dataSource.data = this.lstDataAValidar;
        this.submit = false;
      };
    }
  }

  public saveInfoFile() {
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
                idTipoPrueba: e.idTipoPrueba,
                numDocumento: String(e.cedula),
                codigoAlternoPerfil: String(e.codigoAlternoPerfil)
              };
              lst.push(this.cs.validarInformacionRegistroResultadoPruebas(validarInfoRegistro));
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
                  if (!obj.ExistePerfilRelacionado) {
                    msgError += ' - No existe el perfil';
                    existeError = true;
                  }
                  if (!obj.ExisteTipoPrueba) {
                    msgError += ' - No existe el tipo prueba';
                    existeError = true;
                  }
                  if (!obj.ExisteUsuarioInscrito) {
                    msgError += ' - No existe el usuario inscrito';
                    existeError = true;
                  }
                  if (obj.ErrorExisteTipoPrueba && obj.ErrorExisteTipoPrueba !== '') {
                    msgError += ' - El tipo prueba ya fue relacionado';
                    existeError = true;
                  }
                  e.msgError = msgError;

                  if (!existeError && e.resultadoFinal) {
                    msgError = 'Exitoso';
                    e.msgError = msgError;
                    e.idEmpresa = obj.IdEmpresa;
                    e.tipoPrueba = obj.TipoPrueba;
                    e.idUsuarioAspirante = obj.IdUsuario;
                    e.idInscripcionConvocatoria = obj.IdInscripcionAspirante;
                    e.idPerfilConvocatoria = obj.IdPerfilConvocatoria;
                    this.lstDataValidos.push(e);
                  } else {
                    this.lstDataNoValidos.push(e);
                  }
                  this.lstDataAll.push(e);
                });

                if (this.lstDataValidos.length > 0) {
                  let contadorRegistro = 0;
                  this.lstDataValidos.forEach(async d => {

                    let cargoTemp = '';

                    const convocatoriaPerfilTemp = (await this.cs.getConvocatoriaPerfilById(d.idPerfilConvocatoria).toPromise() as any).datos as ConvocatoriaPerfil;
                    if (convocatoriaPerfilTemp) {
                      convocatoriaPerfilTemp.perfil = JSON.parse(convocatoriaPerfilTemp.detallePerfil);
                      cargoTemp = convocatoriaPerfilTemp.perfil.cargoHumanoModel ? convocatoriaPerfilTemp.perfil.cargoHumanoModel.cargo : convocatoriaPerfilTemp.perfil.cargoModel.cargo;
                    }

                    const newResultadoPruebas: ResultadoPruebasModel = {
                      id: undefined,
                      idConvocatoria: d.idConvocatoria,
                      idTipoPrueba: d.idTipoPrueba,
                      cargo: cargoTemp,
                      idUsuarioAspirante: d.idUsuarioAspirante,
                      idUsuarioModificacion: this.user.id,
                      idConvocatoriaPerfil: d.idPerfilConvocatoria,
                      resultadoFinal: Number(d.resultadoFinal),
                      idInscripcionAspirante: d.idInscripcionConvocatoria,
                      numeroRegistro: d.numeroRegistro,
                      puntajeDirecto: d.puntajeDirecto ? Number(d.puntajeDirecto) : 0,
                      media: d.media ? Number(d.media) : 0,
                      desviacion: d.desviacion ? Number(d.desviacion) : 0,
                      z: d.z ? Number(d.z) : 0,
                      mayor_0_5: d.mayor_0_5 ? Number(d.mayor_0_5) : 0,
                      aprueba_Mayor_0_5: d.aprueba_0_5 ? Number(d.aprueba_0_5) : 0,
                      mayor_1: d.mayor_1 ? Number(d.mayor_1) : 0,
                      aprueba_Mayor_1: d.aprueba_1 ? Number(d.aprueba_1) : 0,
                      mayor_1_5: d.mayor_1_5 ? Number(d.mayor_1_5) : 0,
                      aprueba_Mayor_1_5: d.aprueba_1_5 ? Number(d.aprueba_1_5) : 0,
                      mayor_2: d.mayor_2 ? Number(d.mayor_2) : 0,
                      aprueba_Mayor_2: d.aprueba_2 ? Number(d.aprueba_2) : 0
                    };
                    await this.cs.saveResultadoPruebas(newResultadoPruebas)
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
              error: e => {
                console.log('ERROR', e);
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
      this.showMsgExport = false;
    } else {
      this.dataSource.data = [];
      this.showButtonExport = false;
      this.showMsgExport = false;
    }
  }

  public formatearValor(value: any) {
    return isNaN(value) ? value : parseFloat(value).toFixed(2);
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
