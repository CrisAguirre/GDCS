import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-input-search-table',
  templateUrl: './input-search-table.component.html',
  styleUrls: ['./input-search-table.component.scss']
})
export class InputSearchTableComponent implements OnInit {

  @Input() label: string = 'lbl.buscar';
  @Input() placeholder: string ='lbl.buscarPlh';
  @Output() eventEmmitter = new EventEmitter<string>();
  @Input() controll: FormControl;

  constructor() { }

  ngOnInit() {
  }

  public keyUpInput(event: any) {
    this.eventEmmitter.emit(event);
  }

}
