import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarTarefaPageRoutingModule } from './editar-tarefa-routing.module';

import { EditarTarefaPage } from './editar-tarefa.page';

import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarTarefaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditarTarefaPage]
})
export class EditarTarefaPageModule {}
