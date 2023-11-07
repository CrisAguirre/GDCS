import { NotificacionesComponent } from './paginas/notificaciones/notificaciones.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './paginas/inicio/inicio.component';

const routes: Routes = [
  {
    path: '',
    component: InicioComponent
  },
  {
    path: 'cv',
    loadChildren: () =>
      import('./paginas/hoja-vida/hoja-vida.module').then(
        m => m.HojaVidaModule
      )
  },
  {
    path: 'produccion-intelectual',
    loadChildren: () =>
      import('./paginas/produccion-intelectual/produccion-intelectual.module').then(
        m => m.ProduccionIntelectualModule
      )
  },
  {
    path: 'convocatoria',
    loadChildren: () =>
      import('./paginas/convocatoria/convocatoria.module').then(
        m => m.ConvocatoriaModule
      )
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('../../modulos/administracion/administracion.module').then(
        m => m.AdministracionModule
      )
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('./paginas/perfil/perfil.module').then(
        m => m.PerfilModule
      )
  },
  {
    path: 'cargar-informacion-escalafon',
    loadChildren: () =>
      import('./paginas/cargar-informacion-escalafon/cargar-informacion-escalafon.module').then(
        m => m.CargarInformacionEscalafonModule
      )
  },
  {
    path: 'resultados',
    loadChildren: () =>
      import('./paginas/resultados/resultados.module').then(
        m => m.ResultadosModule
      )
  },
  {
    path: 'cuenta',
    loadChildren: () =>
      import('./paginas/cuenta/cuenta.module').then(
        m => m.CuentaModule
      )
  },
  {
    path: 'entidad',
    loadChildren: () =>
      import('./paginas/empresas/empresas.module').then(
        m => m.EmpresasModule
      )
  }, {
    path: 'cv-admin',
    loadChildren: () =>
      import('../../modulos/hojas-de-vida-admin/hojas-de-vida-admin.module').then(
        m => m.HojasDeVidaAdminModule
      )
  },
  {
    path: 'convocatorias-aspirante',
    loadChildren: () =>
      import('./paginas/convocatorias-aspirante/convocatorias-aspirante.module').then(
        m => m.ConvocatoriasAspiranteModule
      )
  },
  {
    path: 'ayuda',
    loadChildren: () =>
      import('./paginas/ayuda/ayuda.module').then(
        m => m.AyudaModule
      )
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('../../modulos/reportes/reportes.module').then(
        m => m.ReportesModule
      )
  },
  {
    path: 'notificaciones', component: NotificacionesComponent
  },
  {
    path: 'seleccion-aspirante',
    loadChildren: () =>
      import('./paginas/seleccion-aspirante/seleccion-aspirante.module').then(
        m => m.SeleccionAspiranteModule
      )
  },
  {
    path: 'cargues-masivos',
    loadChildren: () =>
      import('../../modulos/cargues-masivos/cargues-masivos.module').then(
        m => m.CarguesMasivosModule
      )
  },
  {
    path: 'registro-despachos',
    loadChildren: () =>
      import('./paginas/registro-despachos/registro-despachos.module').then(
        m => m.RegistroDespachosModule
      )
  },
  {
    path: 'traslados',
    loadChildren: () =>
      import('./paginas/traslados/traslados.module').then(
        m => m.TrasladosModule
      )
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
