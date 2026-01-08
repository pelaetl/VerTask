import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RelatorioFuncionarioPage } from './relatorio-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: RelatorioFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatorioFuncionarioPageRoutingModule {}
