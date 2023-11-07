import { Component, OnInit } from '@angular/core';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss']
})
export class CuentaComponent implements OnInit {

  constructor(private ct :CustomTranslateService,
    private dateAdapter: DateAdapter<any>) { 
    this.dateAdapter.setLocale(this.ct.getLangDefault().lang);
  }

  ngOnInit() {
  }

}
