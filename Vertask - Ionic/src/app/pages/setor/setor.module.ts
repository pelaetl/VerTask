import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetorPageRoutingModule } from './setor-routing.module';

import { SetorPage } from './setor.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetorPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SetorPage]
})
export class SetorPageModule {}
