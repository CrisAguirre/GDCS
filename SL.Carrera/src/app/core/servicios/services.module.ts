import { NgModule } from '@angular/core';
import { LoginService } from './login.service';
import { CommonService } from './common.service';
import { EmitterService } from './emitter.service';
import { CurriculumVitaeService } from './cv.service';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports:[
    TranslateModule
  ],
  providers: [LoginService, EmitterService, CurriculumVitaeService]
})
export class ServicesModule { }
