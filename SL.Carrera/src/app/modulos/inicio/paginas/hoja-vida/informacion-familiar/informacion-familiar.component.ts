import { Component, ViewChild, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { FamilyInformation } from '@app/compartido/modelos/family-information';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-informacion-familiar',
  templateUrl: './informacion-familiar.component.html',
  styleUrls: ['./informacion-familiar.component.scss'],
})
export class InformacionFamiliarComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstSex: any[] = [];
  public lstRelationships: any[] = [];
  public updateData: FamilyInformation[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['firtsName',  'firtsLastname', 'secondLastname', 'birthdate', 'relationship', 'dependsEconomically', 'options'];
  public form: FormGroup;
  private user = this.commonService.getVar(configMsg.USER);
  public submit = false;
  public lstYesNot = [];
  public elementCurrent: any = {};
  public now: Date = new Date();
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    private emitter: EmitterService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.lstYesNot = this.ct.lstYesOrNot();
    this.lang = this.ct.getLangDefault().langBd;
    this.loadForm();
    this.loadData();
  }


  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: FamilyInformation, filter: string): boolean => {
      const dataCompare = [data.primerNombre, data.segundoNombre, data.primerApellido, data.segundoApellido, this.commonService.getFormatDate(new Date(data.fechaNacimiento)), data.sex, data.relationship, (data.dependeEconomicamente == 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare, filter);
    }
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data.sort((a: FamilyInformation, b: FamilyInformation) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'firtsName': return this.compare(a.primerNombre, b.primerNombre, isAsc);
        case 'secondName': return this.compare(a.segundoNombre, b.segundoNombre, isAsc);
        case 'firtsLastname': return this.compare(a.primerApellido, b.primerApellido, isAsc);
        case 'secondLastname': return this.compare(a.segundoApellido, b.segundoApellido, isAsc);
        case 'birthdate': return this.compare(a.fechaNacimiento, b.fechaNacimiento, isAsc);
        case 'sex': return this.compare(a.sex, b.sex, isAsc);
        case 'relationship': return this.compare(a.relationship, b.relationship, isAsc);
        case 'dependsEconomically': return this.compare(a.dependeEconomicamente, b.dependeEconomicamente, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstSex = (<any>await this.commonService.getSex().toPromise()).datos;
    this.lstRelationships = (<any>await this.commonService.getRelationship().toPromise()).datos;
    this.updateData = <FamilyInformation[]>(<any>await this.cvService.getFamilyInformation(this.user.id).toPromise()).datos;
    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {
        this.lstSex.forEach(g => {
          if (e.idSexo == g.id) {
            e.sex = g.sexo;
          }
        });
        this.lstRelationships.forEach(r => {
          if (e.idParentesco == r.id) {
            //e.relationship = r.parentesco + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
            e.relationship = r['parentesco'+ this.lang] + (r.parentesco == 'Otro' ? ' (' + e.otroParentesco + ')' : '');
          }
        });
      });
    }
    this.dataSource.data = this.updateData;
    this.alertService.close();
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        firtsName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        secondName: new FormControl('', [Validators.maxLength(30)]),
        firtsLastname: new FormControl('', [Validators.required, Validators.maxLength(30)]),
        secondLastname: new FormControl('', [Validators.maxLength(30)]),
        birthdate: new FormControl('', [Validators.required]),
        sex: new FormControl('', [Validators.required]),
        relationship: new FormControl('', [Validators.required]),
        dependsEconomically: new FormControl('', [Validators.required]),
        otherRelationship: new FormControl({ value: '', disabled: true }, [Validators.maxLength(30)]),
      }
    );

    this.listenerControls();
  }

  get f() {
    return this.form.controls;
  }

  public addFamily() {
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
      this.f.dependsEconomically.markAsTouched();
      return;
    }

    this.alertService.loading();
    const newFamily: FamilyInformation = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      primerNombre: this.f.firtsName.value,
      segundoNombre: this.f.secondName.value,
      primerApellido: this.f.firtsLastname.value,
      segundoApellido: this.f.secondLastname.value,
      idSexo: this.f.sex.value,
      idParentesco: this.f.relationship.value,
      fechaNacimiento: this.f.birthdate.value,
      otroParentesco: this.f.otherRelationship.value,
      dependeEconomicamente: this.f.dependsEconomically.value,
    };

    this.cvService.saveFamilyInformation(newFamily).toPromise()
      .then(res => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES);
          this.emitter.emitterCv({ progressBar: true });
        })
      })
      .catch(err => {
        console.log('Error', err);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
      })
      .finally(() => this.submit = false);
  }


  public edit(element: FamilyInformation) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      firtsName: element.primerNombre,
      secondName: element.segundoNombre,
      firtsLastname: element.primerApellido,
      secondLastname: element.segundoApellido,
      birthdate: element.fechaNacimiento,
      sex: element.idSexo,
      relationship: element.idParentesco,
      otherRelationship: element.otroParentesco,
      dependsEconomically: element.dependeEconomicamente
    });
    this.listenerControls();
  }

  public listenerControls() {
    this.form.controls.relationship.valueChanges.subscribe(
      r => {
        this.form.controls.otherRelationship.setValue('');
        this.form.controls.otherRelationship.disable();
        this.lstRelationships.forEach(e => {
          if (e.parentesco == 'Otro' && e.id === r) {
            this.form.controls.otherRelationship.enable();
            return;
          }
        })
      }
    );
  }

  public delete(element: FamilyInformation) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.cvService.deleteInformationFamily(element)
            .subscribe(ok => {
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
