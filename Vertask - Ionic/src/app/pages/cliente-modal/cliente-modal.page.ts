import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { ClienteDto } from 'src/app/services/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.page.html',
  styleUrls: ['./cliente-modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ClienteModalPage {
  @Input() cliente!: ClienteDto;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }
  
  formatCnpjCpf(value?: string | null): string {
    if (!value) return '-';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 11) {
      // CPF xxx.xxx.xxx-xx
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
      // CNPJ xx.xxx.xxx/xxxx-xx
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  }

  formatPhone(value?: string | null): string {
    if (!value) return '-';
    const digits = String(value).replace(/\D/g, '');
    // Brazilian formats: 10 digits (2+4+4) or 11 digits (2+5+4)
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    // fallback: return raw with small grouping
    return digits.replace(/(\d{2})(\d{4,})(\d{0,4})/, (m, a, b, c) => c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`);
  }
}
