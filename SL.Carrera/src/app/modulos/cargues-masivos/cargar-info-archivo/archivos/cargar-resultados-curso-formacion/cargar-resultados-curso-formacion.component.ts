import { CargarResultadoCursoFormacionModel } from '@app/compartido/modelos/cargar-resultado-curso-formacion-model';
import { ResultadosCursoFormacionModel } from '@app/compartido/modelos/resultados-curso-formacion-model';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
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
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';

@Component({
  selector: 'app-cargar-resultados-curso-formacion',
  templateUrl: './cargar-resultados-curso-formacion.component.html',
  styleUrls: ['./cargar-resultados-curso-formacion.component.scss']
})
export class CargarResultadosCursoFormacionComponent extends BaseController implements OnInit, AfterViewChecked {

  wopts: XLSX.WritingOptions = { bookType: 'csv', type: 'array' };
  fileName = 'SheetJS.xlsx';
  file: File = null;
  arrayBuffer: any;

  public data: any[] = [];
  public lstDataAValidar: CargarResultadoCursoFormacionModel[] = [];
  public lstDataValidos: CargarResultadoCursoFormacionModel[] = [];
  public lstDataAll: CargarResultadoCursoFormacionModel[] = [];
  public lstDataNoValidos: any[] = [];

  public submit = true;
  public matcher: any;
  public showTable = false;
  public cargaRealizada = false;
  public showButtonExport = false;
  public showMsgExport = false;

  private user = this.commonService.getVar(configMsg.USER);
  public idArchivoCargue: FormControl = new FormControl('', [Validators.required]);

  public form: FormGroup;
  public dataSource = new MatTableDataSource<any>([]);
  /* public displayedColumns: string[] = ['idConvocatoria', 'cedula', 'nombres', 'apellidos', 'totalGeneral50', 'totalEsp30', 'trabajoInvestigacion20', 'totalCFJI100', 'pierdeXInasistencia', 'pierdeXNota',
    'totalMesa1', 'totalMesa2', 'totalMesa3', 'totalMesa4', 'totalMesa5', 'totalMesa6', 'totalMesa7', 'totalMesa8', 'totalMesa9', 'totalMesa10', 'esHomologado', 'resolucion', 'notaConsolidada', 'retiroVoluntario', 'msgError']; */

    public displayedColumns: string[] = ['idConvocatoria', 'cedula', 'nombres', 'apellidos', 'resolucion', 'fechaResolucion', 'totalCFJI100', 'pierdeXInasistencia', 'pierdeXNota',
    'esHomologado', 'notaConsolidada', 'retiroVoluntario', 'noInscrito', 'msgError'];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;
  @Input() fileTypeName: string;

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

    this.loadExtensions();
    this.dataSource.data = [];
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
        this.lstDataAValidar.forEach(e => {
          const splitDate = e.fechaResolucion.split('-');
          const dia = Number(splitDate[0]);
          const mes = Number(splitDate[1]);
          const anio = Number(splitDate[2]);
          const date = new Date(anio, mes - 1, dia).toDateString();

          const date1 = new Date(anio, mes - 1, dia).toISOString();
          e.fechaResolucionStr = date1.toString();
        });
        this.dataSource.data = this.lstDataAValidar;
        this.submit = false;
      };
    }
  }

  public saveInfoFile() {
    let count = 0;
    if (!this.idArchivoCargue.value) {
      this.submit = false;
      this.idArchivoCargue.markAsTouched();
      return;
    }

    if (this.lstDataAValidar.length > 0) {
      this.alertService.comfirmation(this.ct.MSG_LOAD_INFO_CONFIRMATION, TYPES.INFO)
        .then(ok1 => {
          if (ok1.value) {
            this.alertService.loading();
            const lst: Observable<any>[] = [];
            this.lstDataAValidar.forEach(async e => {
              const validarInfoRegistro: any = {
                idConvocatoria: e.idConvocatoria,
                numDocumento: String(e.cedula),
              };
              lst.push(this.cs.validarInformacionRegistroResultadoCursoFormacion(validarInfoRegistro));
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
                  if (!obj.ExisteUsuarioInscrito) {
                    msgError += ' - No existe el usuario inscrito';
                    existeError = true;
                  }
                  
                  e.msgError = msgError;

                  if (!existeError) {
                    msgError = 'Exitoso';
                    e.msgError = msgError;
                    e.idEmpresa = obj.IdEmpresa;
                    e.idUsuario = obj.IdUsuario;
                    if (obj.IdResultadoCursoFormacion) {
                      e.idResultadoCursoFormacion = obj.IdResultadoCursoFormacion;
                    } else {
                      e.idResultadoCursoFormacion = null;
                    }
                    this.lstDataValidos.push(e);
                  } else {
                    this.lstDataNoValidos.push(e);
                  }
                  this.lstDataAll.push(e);
                });

                if (this.lstDataValidos.length > 0) {
                  let contadorRegistro = 0;
                  this.lstDataValidos.forEach(async d => {

                    const newResultadoCFJI: ResultadosCursoFormacionModel = {
                      id: d.idResultadoCursoFormacion ? d.idResultadoCursoFormacion : undefined,
                      idConvocatoria: d.idConvocatoria,
                      idUsuarioAspirante: d.idUsuario,
                      //idInscripcionAspirante: 'A7296E57-F48E-47B5-38E2-08D865429C26',
                      resolucion: d.resolucion ? d.resolucion : '',
                      fechaResolucion: d.fechaResolucionStr ? d.fechaResolucionStr : null,
                      totalCFJI_100: d.totalCFJI_100 ? Number(d.totalCFJI_100) : 0,
                      pierdeXInasistencia: d.pierdePorInasistencia ? Number(d.pierdePorInasistencia) : 0,
                      pierdeXNota: d.pierdePorNota ? Number(d.pierdePorNota) : 0,
                      noInscrito: d.noInscrito ? Number(d.noInscrito) : null,
                      esHomologado: d.esHomologado ? Number(d.esHomologado) : 0,
                      notaConsolidadaHomologacion: d.notaConsolidadaHomologacion ? Number(d.notaConsolidadaHomologacion) : 0,
                      retiroVoluntario: d.retiroVoluntario ? Number(d.retiroVoluntario) : 0,
                      idUsuarioModificacion: this.user.id,
                    };
                    if (d.esHomologado || d.notaConsolidadaHomologacion) {
                      newResultadoCFJI.esHomologado = 1;
                    }
                    await this.cs.saveResultadoCursoFormacion(newResultadoCFJI)
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
                          this.cleanForm();
                        });
                    }
                  });
                } else {
                  this.alertService.message(this.ct.MSG_ERROR_LOAD_INFO_FILE, TYPES.ERROR)
                    .finally(() => {
                      this.submit = true;
                      this.cargaRealizada = true;
                      this.exportUnregisteredData(this.lstDataNoValidos);
                      this.cleanForm();
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
    this.idArchivoCargue.setValue(null);
    this.idArchivoCargue.markAsUntouched();
    this.lstDataAValidar = [];
    this.lstDataNoValidos = [];
    this.lstDataAll = [];
    this.lstDataValidos = [];
    this.data = [];
    this.dataSource.data = [];
    this.clearInputFile(this.inputFileView);
  }

  public cleanForm() {
    this.submit = false;
    this.idArchivoCargue.setValue(null);
    this.idArchivoCargue.markAsUntouched();
    this.lstDataAValidar = [];
    this.lstDataNoValidos = [];
    this.lstDataAll = [];
    this.lstDataValidos = [];
    this.data = [];
    this.dataSource.data = [];
    this.clearInputFile(this.inputFileView);
  }

  public deleteFile() {
    this.idArchivoCargue.setValue(null);
    this.idArchivoCargue.markAsUntouched();
    this.lstDataAValidar = [];
    this.lstDataNoValidos = [];
    this.lstDataAll = [];
    this.lstDataValidos = [];
    this.data = [];
    this.dataSource.data = [];
    this.submit = false;
  }
}
