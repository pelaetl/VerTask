import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroAdministradorPage } from './cadastro-administrador.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroAdministradorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroAdministradorPageRoutingModule {}
