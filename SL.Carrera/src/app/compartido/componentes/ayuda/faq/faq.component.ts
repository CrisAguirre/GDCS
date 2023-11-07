import { Component, OnInit, Output, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { Faq } from '@app/compartido/modelos/faq';
import { CategoriaFaq } from '@app/compartido/modelos/categoria-faq';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCategoriaFaq: CategoriaFaq[] = [];
  public lstPreguntaFaqView: Faq[] = [];
  private lstPreguntaFaq: Faq[] = [];
  private lstRespuestaFaq: Faq[] = [];
  public clickedItem: string;

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadData() {
    this.lstCategoriaFaq = <CategoriaFaq[]>(<any>await this.commonService.getCategoriasFaq().toPromise()).datos;
    this.lstPreguntaFaq = <Faq[]>(<any>await this.commonService.getPreguntasFaq().toPromise()).datos;


    this.lstRespuestaFaq = <Faq[]>(<any>await this.commonService.getRespuestaFaq().toPromise()).datos;
  }

  public loadPreguntasCategoria(categoria: CategoriaFaq) {
    this.clickedItem = categoria.id;
    this.lstPreguntaFaqView = this.lstPreguntaFaq.filter(p => p.idCategoria === categoria.id);
    this.lstPreguntaFaqView.forEach(p => {
      p.lstRespuestas = this.lstRespuestaFaq.filter(r => r.idReferencia === p.id);
    });
  }

  public getNumeroPreguntas(categoria: CategoriaFaq) {
    //return this.lstRespuestaFaq.filter(p => p.idCategoria === categoria.id).length;
    return this.lstPreguntaFaq.filter(p => p.idCategoria === categoria.id).length;
  }

}
