import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarefaFuncionarioPage } from './tarefa-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: TarefaFuncionarioPage
  },
  {
    path: ':id',
    component: TarefaFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarefaFuncionarioPageRoutingModule {}
