import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TarefaEmpresaPage } from './tarefa-empresa.page';

const routes: Routes = [
  {
    path: '',
    component: TarefaEmpresaPage
  },
  {
    path: ':id',
    component: TarefaEmpresaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarefaEmpresaPageRoutingModule {}
