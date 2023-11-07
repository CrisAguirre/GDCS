import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { P404Component } from './core/error/404.component';
import { P500Component } from './core/error/500.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServicesModule } from './core/servicios/services.module';
import { CoreModule } from './core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorHandlerCustom } from './compartido/helpers/error-handler-custom';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { BnNgIdleService } from 'bn-ng-idle';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatDatepickerModule, MatButtonModule, MatTableModule } from '@angular/material';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { AngularMaterialModule } from './compartido/componentes/imports/angular-material.module';
import { DirectivesModule } from './compartido/directivas/directives.module';
import { DatePipe, registerLocaleData } from '@angular/common';
// import localeEsCo from '@angular/common/locales/es-CO';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { InputModule } from './compartido/componentes/input/input.module';
import { ComponentsModule } from './compartido/componentes/components.module';
import { AppDateAdapter, APP_DATE_FORMATS } from './compartido/helpers/format-datepicker';

import { RecaptchaModule } from 'ng-recaptcha';
import { PipesModule } from './compartido/pipe/pipes.module';
import { NgxMatDateAdapter, NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
// import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatTableExporterModule } from 'mat-table-exporter';

// registerLocaleData(localeEsCo, 'es')
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' }
  ]);
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServicesModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AngularMaterialModule,
    DirectivesModule,
    InputModule,
    //ComponentsModule,
    RecaptchaModule,
    PipesModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    // NgxMatMomentModule
    MatTableModule,
    MatButtonModule,
    MatTableExporterModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    P404Component,
    P500Component
    //ProgressBarComponent,
  ],
  providers: [

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // { provide: MAT_DATE_LOCALE, useValue: 'es-ES', },
    // { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },

    { provide: ErrorHandler, useClass: ErrorHandlerCustom },
    { provide: Window, useValue: window },
    BnNgIdleService,
    DatePipe,
    /* {
      provide: NgxMatDateAdapter,
      useClass: CUSTOM_DATE_FORMATS,
      deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    } */
  ],
  exports: [
    //CoreModule
    //AngularMaterialModule,
    //DigitOnlyDirective
    //ProgressBarComponent,
  ],
  bootstrap: [AppComponent],
  //schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  // constructor(private translate: TranslateService,
  //   private dateAdapter: DateAdapter<any>) {
  //   // this.translate.addLangs(['es', 'en']);
  //   // this.translate.setDefaultLang('es');
  //   // this.translate.use('es');
  // }
}
