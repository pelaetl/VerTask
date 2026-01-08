import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEmpresaPageRoutingModule } from './add-empresa-routing.module';

import { AddEmpresaPage } from './add-empresa.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEmpresaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddEmpresaPage]
})
export class AddEmpresaPageModule {}
