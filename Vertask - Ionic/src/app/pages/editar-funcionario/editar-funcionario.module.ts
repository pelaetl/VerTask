import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarFuncionarioPageRoutingModule } from './editar-funcionario-routing.module';

import { EditarFuncionarioPage } from './editar-funcionario.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarFuncionarioPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditarFuncionarioPage]
})
export class EditarFuncionarioPageModule {}
