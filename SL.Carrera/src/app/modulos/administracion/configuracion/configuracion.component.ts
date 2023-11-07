import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit, AfterViewChecked {

  public showProgressBar: boolean = false;
  private counter = 0;

  constructor(private cdRef: ChangeDetectorRef,
    private cs: CommonService) { }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
  }

  receiveMessage(event: MessageEmitter) {
    if (event.showProggressBar) {
      this.counter++;
    } else {
      this.counter--;
    }

    if (this.showProgressBar && this.counter == 0) {
      setTimeout(() => {
        this.showProgressBar = false;
      }, 1000);

    } else if (!this.showProgressBar && this.counter > 0) {
      this.showProgressBar = true;
    }
  }

  public showTab(path: string): boolean {
    return this.cs.hasPermissionUser(path) ? true : false;
  }
}