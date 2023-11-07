import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit, AfterViewChecked {

  // @Input('show') _show: boolean = false;
  private _show: boolean = false;
  constructor(private cdRef: ChangeDetectorRef) { }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
  }

  @Input('show')
  set show(show: boolean) {
    if (this._show != show) {
      this._show = show;
    }
  }

  get show() {
    return this._show;
  }

}
