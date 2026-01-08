import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalhesTarefaPage } from './detalhes-tarefa.page';

const routes: Routes = [
  {
    path: '',
    component: DetalhesTarefaPage
  },
  {
    path: ':id',
    component: DetalhesTarefaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalhesTarefaPageRoutingModule {}
