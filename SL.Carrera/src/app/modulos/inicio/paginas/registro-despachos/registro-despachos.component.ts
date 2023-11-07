import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '../../../../core/servicios/common.service';

@Component({
  selector: 'app-registro-despachos',
  templateUrl: './registro-despachos.component.html',
  styleUrls: ['./registro-despachos.component.scss']
})
export class RegistroDespachosComponent extends BaseController implements OnInit, AfterViewChecked {

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
   }

  ngOnInit() {
  }
  
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

}
