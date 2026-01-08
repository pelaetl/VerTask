import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFuncionarioPageRoutingModule } from './add-funcionario-routing.module';

import { AddFuncionarioPage } from './add-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFuncionarioPageRoutingModule
  ],
  declarations: [AddFuncionarioPage]
})
export class AddFuncionarioPageModule {}
