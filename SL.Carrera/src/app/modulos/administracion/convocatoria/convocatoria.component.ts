import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CommonService } from '../../../core/servicios/common.service';

@Component({
  selector: 'app-convocatoria',
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.scss']
})

export class ConvocatoriaComponent implements OnInit, AfterViewChecked {

  public showProgressBar: boolean;
  private counter = 0;

  constructor(private cdRef: ChangeDetectorRef,
    private cs: CommonService) {
  }
  ngOnInit(): void {
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  receiveMessage(event: MessageEmitter) {
    if (event.showProggressBar) {
      this.counter++;
    } else {
      this.counter--;
    }

    if (this.showProgressBar && this.counter === 0) {
      setTimeout(() => {
        this.showProgressBar = false;
      }, 1000);

    } else if (!this.showProgressBar && this.counter > 0) {
      this.showProgressBar = true;
    }
  }

  public showTab(path: string): boolean {
    return this.cs.hasPermissionUser(path) ? true : false;;
  }
}
