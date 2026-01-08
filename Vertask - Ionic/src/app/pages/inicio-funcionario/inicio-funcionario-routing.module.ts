import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioFuncionarioPage } from './inicio-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: InicioFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioFuncionarioPageRoutingModule {}
