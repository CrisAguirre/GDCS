import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { Vista } from '@app/compartido/modelos/vista';
import { Constants } from '@app/compartido/helpers/constants';

@Component({
  selector: 'app-dialog-rol-vista',
  templateUrl: './dialog-rol-vista.component.html',
  styleUrls: ['./dialog-rol-vista.component.scss']
})
export class DialogRolVistaComponent extends BaseController implements OnInit {

  public form: FormGroup;
  public vista: Vista;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogRolVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public vistaData: Vista) {
    super();
    this.vista = vistaData;
  }

  ngOnInit() {
    this.loadForm();
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        permiteCrear: new FormControl(false),
        permiteLectura: new FormControl(false),
        permiteActualizar: new FormControl(false),
        permiteEliminar: new FormControl(false),
        permisosEspeciales: new FormControl(''),
        idRolUsuario: new FormControl(''),
        idVista: new FormControl(''),
        idEmpresa: new FormControl('')
      }
    );

    if (this.vista.rolVista) {
      const element = this.vista.rolVista;
      this.form.patchValue({
        id: element.id,
        permiteCrear: element.permiteCrear === 1 ? true : false,
        permiteLectura: element.permiteLectura === 1 ? true : false,
        permiteActualizar: element.permiteActualizar === 1 ? true : false,
        permiteEliminar: element.permiteEliminar === 1 ? true : false,
        permisosEspeciales: element.persmisosEspeciales,
        idVista: element.idVista,
        nombreVista: element.nombreVista,
        idEmpresa: element.idEmpresa,
        idRolUsuario: element.idRol
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  public sendResult() {
    const rolVista: RolVista = {
      id: this.f.id.value ? this.f.id.value : undefined,
      permiteCrear: this.f.permiteCrear.value ? 1 : 0,
      permiteLectura: this.f.permiteLectura.value ? 1 : 0,
      permiteActualizar: this.f.permiteActualizar.value ? 1 : 0,
      permiteEliminar: this.f.permiteEliminar.value ? 1 : 0,
      persmisosEspeciales: this.f.permisosEspeciales.value,
      idVista: this.f.idVista.value,
      idRol: this.f.idRolUsuario.value,
      idEmpresa: this.f.idEmpresa.value
    };
    this.vista.rolVista = rolVista;
    return this.vista;
  }


  public getPathNameComplete() {
    return Constants.getPathComplete(this.vista);
  }


}
