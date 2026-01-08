import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarioTarefasPage } from './calendario-tarefas.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarioTarefasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarioTarefasPageRoutingModule {}
