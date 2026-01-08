import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioFuncionarioPageRoutingModule } from './inicio-funcionario-routing.module';

import { InicioFuncionarioPage } from './inicio-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioFuncionarioPageRoutingModule
  ],
  declarations: [InicioFuncionarioPage]
})
export class InicioFuncionarioPageModule {}
