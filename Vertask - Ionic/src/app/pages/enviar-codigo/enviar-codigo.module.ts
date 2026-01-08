import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnviarCodigoPageRoutingModule } from './enviar-codigo-routing.module';

import { EnviarCodigoPage } from './enviar-codigo.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnviarCodigoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EnviarCodigoPage]
})
export class EnviarCodigoPageModule {}
