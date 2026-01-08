import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddSetorPage } from './add-setor.page';

const routes: Routes = [
  {
    path: '',
    component: AddSetorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddSetorPageRoutingModule {}
