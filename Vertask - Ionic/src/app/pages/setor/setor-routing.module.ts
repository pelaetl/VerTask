import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetorPage } from './setor.page';

const routes: Routes = [
  {
    path: '',
    component: SetorPage
  },
  {
    path: ':id',
    component: SetorPage
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetorPageRoutingModule { }
