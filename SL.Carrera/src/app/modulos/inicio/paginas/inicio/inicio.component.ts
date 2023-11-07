import { Component, AfterViewInit } from '@angular/core';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AuthenticationService } from '@app/core/servicios/authentication.service';
import { FilesService } from '@app/core/servicios/files.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent extends BaseController implements AfterViewInit {

  public message: any = `<h1>Bienvenido / Welcome</h1>`;
  public showMainPanel = true;

  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private ct: CustomTranslateService,
    private authService: AuthenticationService,
    private fileService: FilesService,
    private http: HttpClient) {

    super();
    this.lang = this.ct.getLangDefault().langBd;
    //listener vars load complete
    this.commonService.completeMapVars
      .subscribe(res => {
        if (res) {
          let msj: any = this.commonService.getVar(configMsg.WELCOME_MESSAGE);
          msj = JSON.parse(msj);
          this.message = msj;
          this.setStyles();
          //this.message = this.sanitizer.bypassSecurityTrustHtml(this.message);
          //this.message = sanitizer.bypassSecurityTrustStyle(this.message);
        }
      }, err => {
        console.log('Error', err);
      });

    this.commonService.showMainPanel
      .subscribe(res => {
        if (res) {
          this.showMainPanel = false;
        }
      }, err => {
        console.log('Error', err);
      });


    //const user = this.authService.getUser();

  }

  public setStyles() {
    setTimeout(() => {
      let div: HTMLElement = document.getElementById('div_message') as HTMLElement;
      div.setAttribute("style", "visibility: visible;");
      div.children[0].setAttribute("style", "font-size: 40px !important; font-weight: bold !important; text-align: center !important;");
      div.getElementsByTagName("p")[0].setAttribute("style", "font-size: 20px; text-align: justify; width: 100%; margin: 0 auto; margin-bottom: 40px;");
      div.getElementsByTagName("label")[0].setAttribute("style", "font-size: 20px !important; text-align: center; width: 100%; ");
    }, 500);
  }

  ngAfterViewInit() {
    //this.setStyles();
  }

  public sanitizerHtml(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  public byteToUint8Array(byteArray) {
    const uint8Array = new Uint8Array(byteArray.length);
    for (let i = 0; i < uint8Array.length; i++) {
      uint8Array[i] = byteArray[i];
    }

    return uint8Array;
  }
}
