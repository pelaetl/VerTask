import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CodigoSenhaPageRoutingModule } from './codigo-senha-routing.module';

import { CodigoSenhaPage } from './codigo-senha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodigoSenhaPageRoutingModule
  ],
  declarations: [CodigoSenhaPage]
})
export class CodigoSenhaPageModule {}
