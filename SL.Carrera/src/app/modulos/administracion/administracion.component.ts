import { Component, OnInit } from '@angular/core';
import { TabsModel } from '@app/compartido/modelos/tabs-model';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss']
})
export class AdministracionComponent implements OnInit {

  public tabs: TabsModel[] = [
    {
      path: 'configuracion',
      label: 'ttl.configuracion',
    },
    {
      path: 'convocatorias',
      label: 'ttl.convocatoria',
    },
    {
      path: 'perfiles',
      label: 'ttl.perfil',
    },
    {
      path: 'ayuda',
      label: 'ttl.ayuda',
    },
    {
      path: 'configuracion-traslados',
      label: 'ttl.configuracionTraslados'
    }
  ];


  constructor(private cs: CommonService,
    private ct: CustomTranslateService,
    private dateAdapter: DateAdapter<any>) {
    this.dateAdapter.setLocale(this.ct.getLangDefault().lang);
  }

  ngOnInit() {
    //Filtrar los tab que tiene permiso el usuario
    this.tabs = this.tabs.filter(t => this.cs.hasPermissionUser(t.path));
  }

}
