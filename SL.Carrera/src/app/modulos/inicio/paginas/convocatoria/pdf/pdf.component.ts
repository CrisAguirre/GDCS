import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BaseController } from '../../../../../compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { NgForm, FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { AdministracionConvocatoriaService } from '../../../../../core/servicios/administracion-convocatoria.service';
import { TypeSede } from '../../../../../compartido/modelos/type-sede';
import { TypePlace } from '../../../../../compartido/modelos/type-place';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { Constants as C } from '@app/compartido/helpers/constants';
import { FilesService } from '@app/core/servicios/files.service';
import * as jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
// import html2canvas from 'html2canvas';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent extends BaseController implements OnInit {

  public convocatory: Convocatoria[] = [];
  public convocatoryTemp: any[] = [];
  public lstTypeSede: TypeSede[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];
  public lstTypePlace: TypePlace[] = [];
  public lstTypePlaceString: string[] = [];
  public requiredCorporation = false;
  public elementCurrent: any = {};
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  public displayedColumns: string[] = ['nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'nombreTipoLugar', 'numeroCargosAplicar', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  public matcher: any;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('content', { static: true }) content: ElementRef;

  ///pdf




  constructor(
    private alertService: AlertService,
    private adminConvocatoryService: AdministracionConvocatoriaService,
    private convocatoryServices: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fService: FilesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);

    this.loadForm();
    this.alertService.loading();
  }

  ngOnInit() {
    this.loadData()
      .catch(error => {
        console.log("Error", error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
  }

  public async loadData() {
    this.lstTypeConvocatory = <TypeConvocatory[]>(<any>await this.adminConvocatoryService.getTipoConvocatoria().toPromise()).datos;
    this.lstTypeSede = <TypeSede[]>(<any>await this.adminConvocatoryService.getTipoSede().toPromise()).datos;
    this.lstTypePlace = <TypePlace[]>(<any>await this.adminConvocatoryService.getTipoLugar().toPromise()).datos;

    this.f.corporation = new FormArray([], [Validators.required]);
    this.lstTypePlace.forEach((o, i) => {
      const control = new FormControl(false);
      (this.f.corporation as FormArray).push(control);
    });

    this.convocatory = <Convocatoria[]>(<any>await this.convocatoryServices.getConvocatorias().toPromise()).datos;
    if (this.convocatory.length > 0) {
      this.convocatory.forEach(e => {
        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria == Number(g.id)) {
            e.nombreTipoConvocatoria = g.tipoConvocatoria;
            return;
          }
        });

        this.lstTypeSede.forEach(g => {
          if (e.idTipoSede == g.id) {
            e.nombreTipoSede = g.sede;
            return;
          }
        });

        let nombreTipoLugarTemp = [];
        const ids = e.idTipoLugar.split(',');
        ids.forEach(id => {
          this.lstTypePlace.forEach((ee) => {
            if (id == ee.id) {
              nombreTipoLugarTemp.push(ee.tipo);
              return;
            }
          });
        });
        e.nombreTipoLugar = nombreTipoLugarTemp.join(', ');
      });
    }
    this.dataSource.data = this.convocatory;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        nombreConvocatoria: new FormControl(''),
        numeroConvocatoria: new FormControl(''),
        idTipoConvocatoria: new FormControl(''),
        idTipoSede: new FormControl(''),
        corporation: new FormArray([]),
        idTipoLugar: new FormControl(''),
        numeroCargosAplicar: new FormControl(''),
        codigoAcuerdo: new FormControl(''),
        fechaAcuerdo: new FormControl(''),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public eventChekbox(id: string) {
    const index = this.lstTypePlaceString.indexOf(id);
    if (index > -1) {

      this.lstTypePlaceString.splice(index, 1);
    } else {
      this.lstTypePlaceString.push(id);
    }
    this.checkBxRequired();
  }

  public checkBxRequired() {
    this.requiredCorporation = this.lstTypePlaceString.length == 0;
    return this.requiredCorporation;
  }

  public async edit(element: Convocatoria) {
    this.elementCurrent = C.cloneObject(element);

    if (this.elementCurrent.idSoporteAcuerdo) {
      try {
        this.elementCurrent.nombreSoporteAcuerdo = (<any>await this.fService.getInformationFile(this.elementCurrent.idSoporteAcuerdo).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.soporte = null;
        console.log(err);
      }
    }


    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.id,
      nombreConvocatoria: element.nombreConvocatoria,
      numeroConvocatoria: element.numeroConvocatoria,
      idTipoConvocatoria: Number(element.idTipoConvocatoria),
      idTipoSede: element.idTipoSede,
      idTipoLugar: '',
      numeroCargosAplicar: Number(element.numeroCargosAplicar),
      codigoAcuerdo: element.codigoAcuerdo,
      fechaAcuerdo: element.fechaAcuerdo,
    });

    this.f.corporation = new FormArray([], [Validators.required]);

    this.lstTypePlaceString = [];
    const ids = this.elementCurrent.idTipoLugar.split(',');
    this.lstTypePlace.forEach((o) => {
      let encontro = false;
      ids.forEach(id => {
        if (o.id == id) {
          this.lstTypePlaceString.push(id);
          encontro = true;
          return;
        }
      });
      const control = new FormControl(encontro);
      (this.f.corporation as FormArray).push(control);
    });

  }



  public async addConvocatory() {
    this.checkBxRequired();
    if (this.form.valid && !this.requiredCorporation) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.requiredfile.markAsTouched();
      return;
    }
    const idTipoLugar = this.lstTypePlaceString.join(",");
    this.f.idTipoLugar.setValue(idTipoLugar);
    const newRegistry: Convocatoria = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      nombreConvocatoria: this.f.nombreConvocatoria.value,
      numeroConvocatoria: this.f.numeroConvocatoria.value,
      idTipoConvocatoria: Number(this.f.idTipoConvocatoria.value),
      idTipoSede: this.f.idTipoSede.value,
      idTipoCargo: this.f.idTipoCargo.value,
      idTipoLugar: this.f.idTipoLugar.value,
      numeroCargosAplicar: Number(this.f.numeroCargosAplicar.value),
      numeroCargos: Number(this.f.numeroCargos.value),
      codigoAcuerdo: this.f.codigoAcuerdo.value,
      fechaAcuerdo: this.f.fechaAcuerdo.value,
      idSoporteAcuerdo: this.elementCurrent.idSoporteAcuerdo,
      estadoConvocatoria: 0,
      idEmpresa: this.user.idEmpresa,
      fechaInicial: new Date().toString(),
      fechaFinal: new Date().toString(),
      tipoModelo: 1
    };

    if (this.f.requiredfile.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fService.deleteFile(this.elementCurrent.idSoporteAcuerdo).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.requiredfile.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      }
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newRegistry.idSoporteAcuerdo = documentFile.id;
    }

    this.convocatoryServices.saveConvocatoria(newRegistry).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.lstTypePlaceString = [];
          this.elementCurrent = {};
          C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public deleteFileView() {
    this.elementCurrent.idSoporteAcuerdo = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public delete(element: Convocatoria) {
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.convocatoryServices.deleteConvocatoria(element)
            .subscribe(ok => {
              this.deleteSoport(element.idSoporteAcuerdo);
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fService.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.lstTypePlaceString = [];
    this.requiredCorporation = false;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
  }

  public downloadPDF() {
    var node = document.getElementById('content');
    var img;
    var filename;
    var newImage;
    domtoimage.toPng(node, { bgcolor: '#fff' })
      .then(function (dataUrl) {

        img = new Image();
        img.src = dataUrl;
        newImage = img.src;

        img.onload = function () {

          var pdfWidth = img.width;
          var pdfHeight = img.height;
          var doc;

          if (pdfWidth > pdfHeight) {
            doc = new jsPDF('l', 'px', [pdfWidth, pdfHeight]);
          }
          else {
            doc = new jsPDF('p', 'px', [pdfWidth, pdfHeight]);
          }
          var width = doc.internal.pageSize.getWidth();
          var height = doc.internal.pageSize.getHeight();

          doc.addImage(newImage, 'PNG', 10, 0, width, height);
          filename = 'mypdf_' + '.pdf';
          doc.save(filename);
          //doc.save('D:/',filename);
        };
      })
      .catch(function (error) {
      });
  }

  /*public downloadPDF(){
    let doc = new jsPDF();

    let specialElementHandlers = {
      '#editor': function(element, renderer) {
        return true;
      }
    };

    let content = this.content.nativeElement;

    doc.fromHTML(content.innerHTML, 15, 15, {
      'width': 190,
      'elementHendlerts': specialElementHandlers
    });
    doc.save('test.pdf');
  }*/


  /*public downloadPDF(){
    html2canvas(document.querySelector("#content")).then(canvas => {

      var pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);

      var imgData  = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData,0,0,canvas.width, canvas.height);
      pdf.save('converteddoc.pdf');

  });
  }*/

  page: number = 1;
  pdfSrc: String = '';

  public openFile() {

    let img: any = document.querySelector("#file");

    if (typeof (FileReader) !== 'undefined') {
      let reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      }
      reader.readAsArrayBuffer(img.files[0]);
    }
  }


  public getControlsCorporation() {
    if (this.form.get('corporation')) {
      return (this.f.corporation as FormArray).controls;
    }
    return [];
  }

}
