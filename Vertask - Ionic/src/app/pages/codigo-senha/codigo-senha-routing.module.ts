import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodigoSenhaPage } from './codigo-senha.page';

const routes: Routes = [
  {
    path: '',
    component: CodigoSenhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodigoSenhaPageRoutingModule {}
