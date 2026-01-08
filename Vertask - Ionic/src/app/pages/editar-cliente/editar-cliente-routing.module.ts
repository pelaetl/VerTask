import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarClientePage } from './editar-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: EditarClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarClientePageRoutingModule {}
