import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';

@Component({
  selector: 'app-dialog-empresa-login',
  templateUrl: './dialog-empresa-login.component.html',
  styleUrls: ['./dialog-empresa-login.component.scss']
})
export class DialogEmpresaLoginComponent extends BaseController implements OnInit {

  public form: FormGroup;
  public description: string;
  public submit = false;


  // public companySelected = false;
  public content = '';
  public lstCompanies: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogEmpresaLoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super();
    this.content = data.text;
    this.lstCompanies = data.value;
    this.description = data;
  }

  ngOnInit() {
    this.form = this.fb.group({
      companySelected: [Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  onSelect(data: any) {
    this.submit = true;
  }

  close() {
    this.dialogRef.close();
  }
}
