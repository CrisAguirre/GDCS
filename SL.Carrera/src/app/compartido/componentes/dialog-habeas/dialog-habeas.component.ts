import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-habeas',
  templateUrl: './dialog-habeas.component.html',
  styleUrls: ['./dialog-habeas.component.scss']
})
export class DialogHabeasComponent {

  public acceptCbx = false;
  public content = '';

  constructor(
    public dialogRef: MatDialogRef<DialogHabeasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.content = data.text;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
