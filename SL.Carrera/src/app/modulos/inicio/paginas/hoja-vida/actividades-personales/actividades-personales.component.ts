import { Component, ViewChild, OnInit, AfterViewChecked, ChangeDetectorRef, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, NgForm } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CurriculumVitaeService } from "@app/core/servicios/cv.service";
import { CommonService } from '@app/core/servicios/common.service';
import { PersonalActivities } from '@app/compartido/modelos/personal-activities';
import { configMsg } from '../../../../../compartido/helpers/enums';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { Constants as C } from '../../../../../compartido/helpers/constants';
import { ObservationActivity } from '../../../../../compartido/modelos/observation-activity';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { ActividadPersonal } from '@app/compartido/modelos/actividad-personal';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';

@Component({
  selector: 'app-actividades-personales',
  templateUrl: './actividades-personales.component.html',
  styleUrls: ['./actividades-personales.component.scss']
})
export class ActividadesPersonalesComponent extends BaseController implements OnInit, AfterViewChecked {

  public AreaKnowledgeUrl: any[] = [];
  public activities: ActividadPersonal[] = [];
  public activitiesTemp: ActividadPersonal[] = [];
  public frequencies: any[] = [];
  public updateData: PersonalActivities[] = [];
  // public observationTemp: ObservationActivity;
  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['activity', 'frecuently', 'observaciones', 'options'];
  public form: FormGroup;
  // public observation = new FormControl('');
  private user = this.commonService.getVar(configMsg.USER);
  // public msgObervation: string;
  public submit = false;
  public elementCurrent: any = {};
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    private emitter: EmitterService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.loadForm();
    this.loadData().finally(() => this.alertService.close());
  }
  ngOnInit(): void {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data.sort((a: PersonalActivities, b: PersonalActivities) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'activity': return this.compare(a.activity, b.activity, isAsc);
        case 'frecuently': return this.compare(a.frecuently, b.frecuently, isAsc);
        case 'observaciones': return this.compare(a.observacion, b.observacion, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.activities = (<any>await this.commonService.getPersonalActivity().toPromise()).datos;
    this.activitiesTemp = Object.assign([], this.activities);
    this.frequencies = (<any>await this.commonService.getFrecuentlyActivity().toPromise()).datos;
    this.updateData = <PersonalActivities[]>(<any>await this.cvService.getActivityInformationByUser(this.user.id).toPromise()).datos;
    const oTemp = <ObservationActivity[]>(<any>await this.cvService.getObervatioActivityInformationByUser(this.user.id).toPromise()).datos;

    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {
        this.activities.forEach((g, index) => {
          if (e.idActividadPersonal == g.id) {
            e.activity = g['actividadPersonal' + this.lang];
          }
        });
        this.frequencies.forEach(r => {
          if (e.idFrecuencia == r.id) {
            e.frecuently = r['frecuenciaActividad' + this.lang];
          }
        });
      });
    }
    this.dataSource.data = this.updateData;

  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        active: new FormControl('', [Validators.required]),
        frequency: new FormControl('', [Validators.required]),
        observacion: new FormControl('', [Validators.maxLength(300)]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public addActivity() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();

    const pActivity = this.updateData.find((x: any) => x.idActividadPersonal === this.f.active.value);
    if (pActivity) {
      if ((this.f.id && pActivity.idActividadPersonal !== this.elementCurrent.idActividadPersonal) || !this.f.id) {
        this.alertService.message(this.ct.EXIST_PERSONAL_ACTIVITY, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newActivity: PersonalActivities = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idActividadPersonal: this.f.active.value,
      idFrecuencia: this.f.frequency.value,
      observacion: this.f.observacion.value,
    };

    this.cvService.saveActivityInformation(newActivity).toPromise()
      .then(res => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
          this.emitter.emitterCv({ progressBar: true });
        });
      })
      .catch(err => {
        console.log('Error', err);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });

  }

  public saveObservation() {
    // const observation: ObservationActivity = {
    //   id: this.observationTemp ? this.observationTemp.id : undefined,
    //   idUsuarioModificacion: this.user.id,
    //   observacion: this.observation.value,
    // };
    // this.cvService.saveObervatioActivityInformation(observation).toPromise()
    //   .then(ok => {
    //     this.msgObervation = this.ct.OBSERVATION_SAVE_SUCESSFULL;
    //     setTimeout(() => {
    //       this.msgObervation = "";
    //     }, 3000);
    //   }).catch(e => {
    //     console.log('Error', e);
    //     this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
    //   });
  }



  public edit(element: PersonalActivities) {
    this.alertService.loading();
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    //this.loadForm();
    //this.form.updateValueAndValidity()
    this.form.patchValue({
      id: element.id,
      active: element.idActividadPersonal,
      frequency: element.idFrecuencia,
      observacion: element.observacion
    });

    this.alertService.close();
  }

  public delete(element: PersonalActivities) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.loading();

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id == element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.cvService.deleteActivityInformation(element)
            .subscribe(o => {
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


  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}
