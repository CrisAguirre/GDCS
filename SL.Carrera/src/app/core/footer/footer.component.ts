import { Component, OnInit } from '@angular/core';
import { configMsg } from '../../compartido/helpers/enums';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CommonService } from '@app/core/servicios/common.service';
import { MatDialog } from '@angular/material';
import { PoliticaPrivacidadComponent } from '../../compartido/componentes/politica-privacidad/politica-privacidad.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent extends BaseController {
  test : Date = new Date();
  
  constructor(
    private commonService: CommonService,
    public dialog: MatDialog,
  ) { 
    super();
  }

  public openPrivacidad(politica:number){
    const nameMsg = politica== 1 ? configMsg.POLITICA_PRIVACIDAD_MESSAGE : configMsg.POLITICA_COOKIE_MESSAGE;
    this.commonService.getMessageByName(nameMsg).subscribe(
      (res: any) =>{
        const msgPrivacidad = res.datos;
        const dialogRef = this.dialog.open(PoliticaPrivacidadComponent, {
          disableClose: true,
          maxWidth: '90%',
          maxHeight: '90%',
          data: { text: msgPrivacidad },
          panelClass: 'col-md-8',
        });
      },error=>{
        console.log('Error');
      }
    )
  }

}
