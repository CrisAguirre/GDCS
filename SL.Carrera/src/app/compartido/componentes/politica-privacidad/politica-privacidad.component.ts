import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-politica-privacidad',
  templateUrl: './politica-privacidad.component.html',
  styleUrls: ['./politica-privacidad.component.scss']
})
export class PoliticaPrivacidadComponent implements AfterViewInit {

  public content: any = '';
  public textoHtml: any = '';
  public lang: string = '';

  constructor(
    public dialogRef: MatDialogRef<PoliticaPrivacidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private ct: CustomTranslateService) {
    this.lang = this.ct.getLangDefault().langBd;
    let msg = JSON.parse(data.text.valor);
    this.textoHtml = this.sanitizer.bypassSecurityTrustHtml(msg['texto' + this.lang]);
    this.content = msg;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      let div: HTMLElement = document.getElementById('div_message') as HTMLElement;
      //div.setAttribute("style", "visibility: visible;");
      // div.children[0].setAttribute("style", "font-size: 40px !important; font-weight: bold !important; text-align: center !important;");
      // div.getElementsByTagName("p")[0].setAttribute("style", "font-size: 20px; text-align: justify; width: 100%; margin: 0 auto; margin-bottom: 40px;");
      // div.getElementsByTagName("label")[0].setAttribute("style", "font-size: 20px !important; text-align: center; width: 100%; ");
      const table = div.getElementsByTagName("table")[0];//de aqui ya puedes dare estilos con setAtribute
      table.setAttribute("style", "margin-bottom:5px;");
      const lstTr = table.getElementsByTagName("tr");
      for (let i = 0; i < lstTr.length; i++) {
        if (i === 0) {
          const lstTh = lstTr[i].getElementsByTagName("th");
          for (let j = 0; j < lstTh.length; j++) {
            lstTh[j].setAttribute("style", "border: 1px solid #c1c1c1; padding: 3px; text-align: center;");
          }
        }
        const lstTd = lstTr[i].getElementsByTagName("td");
        for (let j = 0; j < lstTd.length; j++) {
          if (j === 0) {
            lstTd[j].setAttribute("style", "text-align: center; border: 1px solid #c1c1c1; padding: 3px;");
          } else {
            lstTd[j].setAttribute("style", "border: 1px solid #c1c1c1; padding: 3px;");
          }
        }

      }
      //table.setAttribute("class", "table-cookie");
      // div.getElementsByTagName("table")[0].setAttribute("style", "font-size: 15px !important; width: 100%;  border: black 1px solid; ");
      //div.getElementsByTagName("table")[0].setAttribute("class", "table-cookie");
      // const tr = div.getElementsByTagName("tr")[0];//de aqui ya puedes dare estilos con setAtribute
      // div.getElementsByTagName("tr")[0].setAttribute("style", "border: black 1px solid; ");
      // const th = div.getElementsByTagName("th")[0];//de aqui ya puedes dare estilos con setAtribute
      // div.getElementsByTagName("th")[0].setAttribute("style", "border: black 1px solid; ");
      // const td = div.getElementsByTagName("td")[0];//de aqui ya puedes dare estilos con setAtribute
      // div.getElementsByTagName("td")[0].setAttribute("style", "border: black 1px solid; ");
    }, 1000);
  }

  public sanitizerHTML(texto) {
    texto = this.sanitizer.bypassSecurityTrustHtml(texto)
    return texto;
  }

}
