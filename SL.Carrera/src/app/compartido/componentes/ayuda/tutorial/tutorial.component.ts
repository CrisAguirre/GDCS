import { Component, ViewChild, OnInit, Output, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-tutorial-2',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;
  public lstCategoriaVideo: any[] = [];

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();


  @ViewChild('formV', { static: false }) formV: NgForm;
  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
  }

  public async loadData() {
    this.lstCategoriaVideo = (<any>await this.commonService.getListaCategoriaCideoTutorial().toPromise()).datos;
  }
}
