import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioAdministradorPageRoutingModule } from './inicio-administrador-routing.module';

import { InicioAdministradorPage } from './inicio-administrador.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioAdministradorPageRoutingModule
  ],
  declarations: [InicioAdministradorPage]
})
export class InicioAdministradorPageModule {}
