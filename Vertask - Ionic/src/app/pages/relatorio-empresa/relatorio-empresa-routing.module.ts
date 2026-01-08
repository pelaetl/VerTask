import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RelatorioEmpresaPage } from './relatorio-empresa.page';

const routes: Routes = [
  {
    path: '',
    component: RelatorioEmpresaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatorioEmpresaPageRoutingModule {}
