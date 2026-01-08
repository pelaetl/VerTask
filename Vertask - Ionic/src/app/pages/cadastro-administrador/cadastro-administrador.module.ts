import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastroAdministradorPageRoutingModule } from './cadastro-administrador-routing.module';

import { CadastroAdministradorPage } from './cadastro-administrador.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastroAdministradorPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CadastroAdministradorPage]
})
export class CadastroAdministradorPageModule {}
