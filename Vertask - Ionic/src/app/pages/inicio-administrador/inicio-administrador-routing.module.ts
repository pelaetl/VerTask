import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioAdministradorPage } from './inicio-administrador.page';

const routes: Routes = [
  {
    path: '',
    component: InicioAdministradorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioAdministradorPageRoutingModule {}
