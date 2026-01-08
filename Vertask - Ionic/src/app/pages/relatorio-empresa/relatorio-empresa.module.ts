import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RelatorioEmpresaPageRoutingModule } from './relatorio-empresa-routing.module';

import { RelatorioEmpresaPage } from './relatorio-empresa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelatorioEmpresaPageRoutingModule
  ],
  declarations: [RelatorioEmpresaPage]
})
export class RelatorioEmpresaPageModule {}
