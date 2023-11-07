import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[onlyTextDirective]'
})
export class OnlyTextDirective {
  private navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste'
  ];

  @Input() enabledOnlyText: boolean = false;
  inputElement: HTMLInputElement;

  constructor(public el: ElementRef) {
    this.inputElement = el.nativeElement;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.isEnable()) {
      if (e.key !== ' ' && !isNaN(Number(e.key))) {
        e.preventDefault();
      }
    }
  }

  // @HostListener('keyup', ['$event'])
  // onKeyUp(e: KeyboardEvent) {
  //   if (this.isEnable()) {
  //     if (!this.decimal) {
  //       return;
  //     } else {
  //       this.decimalCounter = this.el.nativeElement.value.split(this.decimalSeparator).length - 1;
  //     }
  //   }
  // }

  // @HostListener('paste', ['$event'])
  // onPaste(event: ClipboardEvent) {
  //   if (this.isEnable()) {
  //     const pastedInput: string = event.clipboardData.getData('text/plain');
  //     this.pasteData(pastedInput);
  //     event.preventDefault();
  //   }
  // }

  // @HostListener('drop', ['$event'])
  // onDrop(event: DragEvent) {
  //   if (this.isEnable()) {
  //     const textData = event.dataTransfer.getData('text');
  //     this.inputElement.focus();
  //     this.pasteData(textData);
  //     event.preventDefault();
  //   }
  // }

  private isEnable() {
    return this.enabledOnlyText;
  }
}