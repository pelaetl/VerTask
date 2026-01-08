import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarFuncionarioPage } from './editar-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: EditarFuncionarioPage
  },
  {
    path: ':id',
    component: EditarFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarFuncionarioPageRoutingModule { }
