import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatBadgeModule,
  MatSidenavModule,
  MatListModule,
  MatGridListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatChipsModule,
  MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatTabsModule,
  MatRippleModule,
  MatCardModule,
  MatExpansionModule,
  MatDialogModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatAutocompleteModule,
  MatSortModule,
  MatTreeModule,
  MatSnackBarModule,
  MatSlideToggleModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule,
    // //MatSidenavModule,
    // //MatBadgeModule,
    // // MatGridListModule,
    // // MatChipsModule,
    // //MatRippleModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatDialogModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatSortModule,
    MatListModule,
    MatTreeModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  exports: [
    MatToolbarModule,
    // MatSidenavModule,
    // MatBadgeModule,
    // MatGridListModule,
    // MatChipsModule,
    // MatRippleModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatDialogModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatSortModule,
    MatListModule,
    MatTreeModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  providers: [
    MatDatepickerModule,
  ]
})

export class AngularMaterialModule { }