import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarefaFuncionarioPageRoutingModule } from './tarefa-funcionario-routing.module';

import { TarefaFuncionarioPage } from './tarefa-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarefaFuncionarioPageRoutingModule
  ],
  declarations: [TarefaFuncionarioPage]
})
export class TarefaFuncionarioPageModule {}
