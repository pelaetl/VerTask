import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetoresPage } from './setores.page';

const routes: Routes = [
  {
    path: '',
    component: SetoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetoresPageRoutingModule {}
