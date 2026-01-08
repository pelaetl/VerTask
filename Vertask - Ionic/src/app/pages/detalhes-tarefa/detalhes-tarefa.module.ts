import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalhesTarefaPageRoutingModule } from './detalhes-tarefa-routing.module';

import { DetalhesTarefaPage } from './detalhes-tarefa.page';

import { ReactiveFormsModule } from '@angular/forms';

// import { File } from '@ionic-native/file';
// import { FileTransfer } from '@ionic-native/file-transfer';
// import { DocumentViewer } from '@ionic-native/document-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhesTarefaPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DetalhesTarefaPage]
})
export class DetalhesTarefaPageModule {}
