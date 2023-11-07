import { Observable } from 'rxjs';
import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, ViewChild } from '@angular/core';
import { configMsg } from '@app/compartido/helpers/enums';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CuentaService } from '@app/core/servicios/cuenta.service';
import { CuentaUsuarioAdmin } from '@app/compartido/modelos/cuenta-usuario-admin';

@Component({
  selector: 'app-cuenta-usuario-admin',
  templateUrl: './cuenta-usuario-admin.component.html',
  styleUrls: ['./cuenta-usuario-admin.component.scss']
})
export class CuentaUsuarioAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTypesIdentification: any[];
  public form: FormGroup;
  public dataPersonal: any = {};
  private user = this.commonService.getVar(configMsg.USER);
  public matcher: any;
  public minDateBirthdate: Date = new Date();
  public maxDateBirthdate: Date = new Date();
  public now: Date = new Date();
  public submit = false;

  @ViewChild('formV', { static: false }) formV: NgForm;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private alertService: AlertService,
    private cuentaService: CuentaService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.minDateBirthdate.setMonth(new Date().getMonth() - (12 * this.commonService.getVar(configMsg.MIN_YEAR_REGISTER)));
    this.maxDateBirthdate.setMonth(new Date().getMonth() - (12 * this.commonService.getVar(configMsg.MAX_YEAR_REGISTER)));
    this.alertService.loading();
    this.loadForm();
    this.loadData().then(
      () => {
        // this.alertService.close();
      }, err => {
        console.log('Error :', err);
        this.alertService.close();
      })
      .finally(() => {
        // this.emitter.emitterCv({ showProgressLoading: false });
        this.alertService.close();
      });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        names: new FormControl('', [Validators.required]),
        surnames: new FormControl('', [Validators.required]),
        typeIdentification: new FormControl('', [Validators.required]),
        identification: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        birthdate: new FormControl('', [Validators.required]),
        celphone: new FormControl('', [Validators.maxLength(15)]),
        address: new FormControl(''),
      }
    );
  }

  public async loadData() {
    this.submit = true;
    try {
      const updateData = (await this.cuentaService.getCuentaUsuarioAdminPorUsuario(this.user.id).toPromise() as any).datos;
      if (updateData) {
        this.dataPersonal = updateData as CuentaUsuarioAdmin;
        this.form.patchValue({
          id: this.dataPersonal.id,
          names: this.dataPersonal.nombres,
          surnames: this.dataPersonal.apellidos,
          birthdate: this.dataPersonal.fechaNacimiento,
          celphone: this.dataPersonal.telefono,
          address: this.dataPersonal.direccion,
          typeIdentification: this.dataPersonal.idTipoDocumento,
          identification: this.dataPersonal.documento,
        });
        this.submit = false;
      }
    } catch (error) {
      console.log('Error', error);
      this.submit = false;
    }


    this.lstTypesIdentification = (await this.commonService.getTypesIdentification().toPromise() as any).datos;
  }

  get f() {
    return this.form.controls;
  }

  public async save() {
    try {

      if (this.form.valid) {
        this.submit = true;
      } else {
        this.submit = false;
        return;
      }

      this.alertService.loading();
      const cuentaUsuario: CuentaUsuarioAdmin = {
        id: this.f.id.value ? this.f.id.value : undefined,
        idUsuario: this.user.id,
        nombres: this.f.names.value,
        apellidos: this.f.surnames.value,
        idTipoDocumento: this.f.typeIdentification.value,
        documento: this.f.identification.value,
        direccion: this.f.address.value,
        telefono: this.f.celphone.value,
        fechaNacimiento: this.f.birthdate.value,
        idUsuarioModificacion: this.user.id,
      };

      this.cuentaService.saveCuentaUsuarioAdmin(cuentaUsuario)
        .toPromise()
        .then((res) => {
          this.loadData().then(loaded => {
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES);
            this.submit = false;
            this.scrollTop();
          });
        })
        .catch(err => {
          console.log('Error', err);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        })
        .finally(() => this.submit = false);
    } catch (error) {
      this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
      console.log('Error', error);
    }
  }

}
