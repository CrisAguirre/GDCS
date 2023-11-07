import { Component, OnInit } from '@angular/core';
import { CustomTranslateService } from '../servicios/custom-translate.service';
import { FormControl } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { LangModel } from '@app/compartido/modelos/lang-model';
import { Router } from '@angular/router';
import { CommonService } from '../servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-traduction',
  templateUrl: './traduction.component.html',
  styleUrls: ['./traduction.component.scss']
})
export class TraductionComponent extends BaseController implements OnInit {

  public lstLangs = [];
  public langControll;
  public langCurrent: LangModel;
  constructor(
    private ct: CustomTranslateService,
    private router: Router,
    private cs: CommonService
  ) {
    super();
    this.langCurrent = this.ct.getLangDefault();
    this.lstLangs = this.ct.langsView;
  }

  ngOnInit() {
    this.langControll = new FormControl(this.langCurrent.lang);
  }
  public changeLanguaje(lang) {
    this.ct.loadConfigurationTranslate(lang.value).then(() => {
      this.langCurrent = this.ct.getLangDefault();
    });

    if (this.cs.getVar(configMsg.USER) != null) {
      this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/']);
      });
    }
  }

}
