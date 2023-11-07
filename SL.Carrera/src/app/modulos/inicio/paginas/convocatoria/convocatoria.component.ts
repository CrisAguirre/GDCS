import { Component, OnInit } from '@angular/core';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-convocatoria',
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.scss']
})
export class ConvocatoriaComponent implements OnInit {

  constructor(private ct :CustomTranslateService,
    private dateAdapter: DateAdapter<any>) { 
    this.dateAdapter.setLocale(this.ct.getLangDefault().lang);
   }

  ngOnInit() {
  }

}
