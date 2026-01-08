import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatTarefaPage } from './chat-tarefa.page';

const routes: Routes = [
  {
    path: '',
    component: ChatTarefaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatTarefaPageRoutingModule {}
