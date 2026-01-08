import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TodasTarefasPage } from './todas-tarefas.page';

const routes: Routes = [
  {
    path: '',
    component: TodasTarefasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TodasTarefasPageRoutingModule {}
