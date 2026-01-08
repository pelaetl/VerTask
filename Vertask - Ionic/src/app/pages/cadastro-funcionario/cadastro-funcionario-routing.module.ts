import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroFuncionarioPage } from './cadastro-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroFuncionarioPageRoutingModule {}
