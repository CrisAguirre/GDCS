import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, TipoInfoCargue } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-cargar-info-archivo',
  templateUrl: './cargar-info-archivo.component.html',
  styleUrls: ['./cargar-info-archivo.component.scss']
})
export class CargarInfoArchivoComponent extends BaseController implements OnInit, AfterViewChecked {

  public idTipoInformacionCargue = new FormControl('');
  public lstTipoInfoCargue = TipoInfoCargue;
  private user = this.commonService.getVar(configMsg.USER);

  public currentFileType: any;
  public citacionesAspiranteFile = 'citacionesAspirante';
  public resultadosPruebasFile = 'resultadosPruebas';
  public resultadosCursoFormacionFile = 'resultadosCursoFormacion';
  public vacantesFile = 'vacantes';
  public escalafonFile = 'escalafon';
  public despachoFile = 'despacho';


  constructor(
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private ct: CustomTranslateService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {

    this.idTipoInformacionCargue.valueChanges.subscribe(val => {
      if (val) {
        this.currentFileType = val;
      }
    });
  }

  public show(fileType: string) {
    return this.currentFileType ? this.currentFileType === fileType : false;
  }

}
