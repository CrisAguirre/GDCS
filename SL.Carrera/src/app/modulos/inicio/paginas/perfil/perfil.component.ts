import { Component, OnInit } from '@angular/core';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  constructor(private ct :CustomTranslateService,
    private dateAdapter: DateAdapter<any>) { 
    this.dateAdapter.setLocale(this.ct.getLangDefault().lang); }

  ngOnInit() {
  }

}
