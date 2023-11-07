import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoginGuard } from './guardias/login-guard.guard';
import { ServicesModule } from './servicios/services.module';
import { HttpClientModule } from '@angular/common/http';
import { TraductionComponent } from './traduction/traduction.component';
import { MatFormFieldModule, MatOptionModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material';
import { MatIconModule } from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { InputModule } from '@app/compartido/componentes/input/input.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ServicesModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    TranslateModule,
    MatBadgeModule,
    MatIconModule,
    MatMenuModule,
    AngularMaterialModule,
    InputModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    TraductionComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    TraductionComponent
  ],
  providers: [
    LoginGuard
  ]
})
export class CoreModule {
}