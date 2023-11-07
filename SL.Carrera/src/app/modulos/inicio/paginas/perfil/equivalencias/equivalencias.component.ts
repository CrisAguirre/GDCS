import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl } from '@angular/forms';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { CommonService } from '../../../../../core/servicios/common.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { PerfilService } from './../../../../../core/servicios/perfil.service';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { Equivalencia } from '../../../../../compartido/modelos/equivalencia';
import { Constants as C } from '@app/compartido/helpers/constants';
import { TipoAdicional } from '../../../../../compartido/modelos/tipo-adicional';
import { AdministracionConvocatoriaService } from '../../../../../core/servicios/administracion-convocatoria.service';

@Component({
  selector: 'app-equivalencias',
  templateUrl: './equivalencias.component.html',
  styleUrls: ['./equivalencias.component.scss']
})
export class EquivalenciasComponent extends BaseController implements OnInit, AfterViewChecked {

  public equivalence: Equivalencia[] = [];
  public lstConvocatory: Convocatoria[] = [];
  public lstConvocatoryAux: Convocatoria[] = [];
  public typeAditional: TipoAdicional[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};

  public form: FormGroup;
  public displayedColumns: string[] = ['idConvocatoria', 'idTipoEstudio', 'anio', 'options'];
  public dataSource = new MatTableDataSource<any>([]);


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private convocatoryServices: ConvocatoriaService,
    private perfilServices: PerfilService,
    private convoService: AdministracionConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
    this.loadForm();
    this.alertService.loading();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    this.equivalence = <Equivalencia[]> (<any> await this.convocatoryServices.getEquivalencia().toPromise()).datos;

    const idCapacitacion = <any>(<any> await this.commonService.getMessageByName(configMsg.ID_PARAMETRO_ADICIONAL_CAPACITACION).toPromise()).datos;
    // this.typeAditional = <TipoAdicional[]> (<any> await this.convoService.getTipoAdicionales().toPromise()).datos;
    this.typeAditional = <TipoAdicional[]>(<any>await this.convoService.getTipoAdicionalesPorIdReferencia(idCapacitacion.valor).toPromise()).datos;

    this.lstConvocatoryAux = <Convocatoria[]> (<any> await this.convocatoryServices.getConvocatorias().toPromise()).datos;

    // Cargar combo de convocatorias
    this.lstConvocatory = [];
    if (this.lstConvocatoryAux.length > 0) {
      this.lstConvocatoryAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
              g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA) {
              this.lstConvocatory.push(g);
        }
      });
    }

    // Ajustes para la tabla de la actividad
    if (this.equivalence.length > 0) {
      this.equivalence.forEach(e => {
        // Cargar las convocatorias
        this.lstConvocatoryAux.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = g.nombreConvocatoria;
            e.mostrarOpciones = (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
              g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA) ? true : false;
            return;
          }
        });
        e.mostrarOpciones = e.mostrarOpciones === undefined ? false : e.mostrarOpciones;

        // Cargar los adicionales
        this.typeAditional.forEach(g => {
          if (e.idTipoEstudio === g.id) {
            e.tipoAdicional = g.tipoAdicional;
            return;
          }
        });
      });
    }
    this.dataSource.data = this.equivalence;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl(''),
        idTipoEstudio: new FormControl(''),
        anio: new FormControl(''),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: Equivalencia) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idConvocatoria: element.idConvocatoria,
      idTipoEstudio: element.idTipoEstudio,
      anio: element.anio
    });
  }

  public async addEquivalencia() {
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    // tslint:disable-next-line: align
    const vEquivalencia = this.equivalence.find(
      // tslint:disable-next-line: no-trailing-whitespace
      (x: any) => 
        x.idTipoEstudio === this.f.idTipoEstudio.value &&
        x.idConvocatoria === this.f.idConvocatoria.value
      );
    if (vEquivalencia) {
      if ((this.f.id && vEquivalencia.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newObj: Equivalencia = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idTipoEstudio: this.f.idTipoEstudio.value,
      anio: Number(this.f.anio.value),
    };

    this.perfilServices.saveEquivalencia(newObj).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Equivalencia) {
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.perfilServices.deleteEquivalencia(element)
            .subscribe(ok2 => {
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

  private deleteIsSelected(id){
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}

