import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarioTarefasPageRoutingModule } from './calendario-tarefas-routing.module';

import { CalendarioTarefasPage } from './calendario-tarefas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarioTarefasPageRoutingModule
  ],
  declarations: [CalendarioTarefasPage]
})
export class CalendarioTarefasPageModule {}
