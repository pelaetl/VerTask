import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSetorPageRoutingModule } from './add-setor-routing.module';

import { AddSetorPage } from './add-setor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddSetorPageRoutingModule
  ],
  declarations: [AddSetorPage]
})
export class AddSetorPageModule {}
