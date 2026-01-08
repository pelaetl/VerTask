import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TodasTarefasPageRoutingModule } from './todas-tarefas-routing.module';

import { TodasTarefasPage } from './todas-tarefas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TodasTarefasPageRoutingModule
  ],
  declarations: [TodasTarefasPage]
})
export class TodasTarefasPageModule {}
