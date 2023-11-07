import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';

@Component({
  selector: 'app-buscador-estado-aspirante',
  templateUrl: './buscador-estado-aspirante.component.html',
  styleUrls: ['./buscador-estado-aspirante.component.scss']
})
export class BuscadorEstadoAspiranteComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstInscripcionesByUsuario: InscripcionAspiranteModel[] = [];
  public lstConvocatoriaPerfil: ConvocatoriaPerfil[] = [];
  public lstConvocatory: Convocatoria[] = [];
  public lstEstadosAspiranteAll: EstadoAspiranteComvocatoria[] = [];

  private user = this.commonService.getVar(configMsg.USER);
  public submit = false;

  public showResult = false;

  public sortedData: any;
  public dataSource = new MatTableDataSource<InscripcionAspiranteModel>([]);
  public displayedColumns: string[] = ['nombreConvocatoria', 'numeroConvocatoria', 'cargoAspirante', 'estadoAspirante', 'fecha'];

  public identificacion: FormControl = new FormControl({ value: '', disabled: true });
  public nombreAspirante: FormControl = new FormControl({ value: '', disabled: true });

  public form: FormGroup;
  @ViewChild('formV', { static: false }) formV: NgForm;
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('paginator', { static: false }) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cvService: CurriculumVitaeService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.loadForm();

    // this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: InscripcionAspiranteModel, filter: string): boolean => {
      const dataCompare = [
        data.convocatoria.nombreConvocatoria,
        data.convocatoria.numeroConvocatoria,
        this.commonService.getCargoAspirante(data),
        data.estadoAspiranteModel.nombreCategoria
      ];
      return Constants.filterTable(dataCompare, filter);
    };
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nombreConvocatoria': return this.compare(a.convocatoria.nombreConvocatoria, b.convocatoria.nombreConvocatoria, isAsc);
        case 'numeroConvocatoria': return this.compare(a.convocatoria.numeroConvocatoria, b.convocatoria.numeroConvocatoria, isAsc);
        case 'cargoAspirante': return this.compare(this.commonService.getCargoAspirante(a), this.commonService.getCargoAspirante(b), isAsc);
        case 'estadoAspirante': return this.compare(a.estadoAspiranteModel['nombreCategoria' + this.lang], b.estadoAspiranteModel['nombreCategoria' + this.lang], isAsc);
        case 'fecha': return this.compare(a.fechaRegistro, b.fechaRegistro, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group({
      identificacion: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.form.controls;
  }

  public async buscarEstadoAspirante() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();

    this.cvService.validateIdentification({ numeroDocumento: this.f.identificacion.value })
      .subscribe(
        async (res: any) => {
          if (res.existe) {
            this.showResult = true;
            const data = res.datos;
            const nombreAspirante = [
              data.primerNombre,
              data.segundoNombre,
              data.primerApellido,
              data.segundoApellido,
            ].join(' ');

            this.identificacion.setValue(data.numeroDocumento);
            this.nombreAspirante.setValue(nombreAspirante);

            this.identificacion.updateValueAndValidity();
            this.nombreAspirante.updateValueAndValidity();

            this.lstEstadosAspiranteAll = ((await this.commonService.getEstadoAspiranteConvocatoria().toPromise() as any).datos) as EstadoAspiranteComvocatoria[];
            this.lstInscripcionesByUsuario = (await this.commonService.getInscripcionesByNumeroDocumento(this.f.identificacion.value).toPromise() as any).datos as InscripcionAspiranteModel[];
            if (this.lstInscripcionesByUsuario.length > 0) {
              this.lstInscripcionesByUsuario.forEach(x => {
                x.resumenHVModel = JSON.parse(x.resumenHV);
                if (x.resumenRecalificacionHV) {
                  x.resumenRecalificacionHVModel = JSON.parse(x.resumenRecalificacionHV);
                }
                x.estadoAspiranteModel = this.lstEstadosAspiranteAll.find(z => z.id === x.idEstadoAspirante);
                const cPerfil: ConvocatoriaPerfil = x.convocatoriaPerfilModel;
                cPerfil.perfil = JSON.parse(cPerfil.detallePerfil);
              });
              this.lstInscripcionesByUsuario.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
            } else {
              this.lstInscripcionesByUsuario = [];
            }
            this.dataSource.data = this.lstInscripcionesByUsuario;
            this.alertService.close();

          } else {
            this.alertService.message(this.ct.MSG_NUMERO_DOCUMENTO_NO_EXISTE, TYPES.WARNING);
            this.f.identificacion.setValue('');
            this.submit = false;
          }
        }, err => {
          console.log('Error', err);
        }
      );
  }

  public cleanForm() {
    this.showResult = false;
    this.formV.resetForm();
    this.lstInscripcionesByUsuario = [];
    this.dataSource.data = [];
    this.dataSource.filter = '';
    this.nombreAspirante.setValue('');
    this.nombreAspirante.updateValueAndValidity();
    this.identificacion.setValue('');
    this.identificacion.updateValueAndValidity();
    this.submit = false;
  }

}
