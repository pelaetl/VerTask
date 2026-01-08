import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RelatorioFuncionarioPageRoutingModule } from './relatorio-funcionario-routing.module';

import { RelatorioFuncionarioPage } from './relatorio-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelatorioFuncionarioPageRoutingModule
  ],
  declarations: [RelatorioFuncionarioPage]
})
export class RelatorioFuncionarioPageModule {}
