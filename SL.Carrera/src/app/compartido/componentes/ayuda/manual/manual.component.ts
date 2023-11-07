import { Component,  OnInit, Output, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { Instructivo } from '@app/compartido/modelos/instructivo';
import { FilesService } from '@app/core/servicios/files.service';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstInstructivo: Instructivo[] = [];
  
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private fs: FilesService,
  ) {
    super();
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
    this.lstInstructivo = <Instructivo[]> (<any> await this.commonService.getInstructivo().toPromise()).datos;
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fs.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

}
