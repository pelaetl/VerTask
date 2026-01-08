import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatTarefaPageRoutingModule } from './chat-tarefa-routing.module';
import { ChatTarefaPage } from './chat-tarefa.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatTarefaPageRoutingModule
  ],
  declarations: [ChatTarefaPage]
})
export class ChatTarefaPageModule {}
