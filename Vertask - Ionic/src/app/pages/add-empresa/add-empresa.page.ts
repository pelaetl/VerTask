import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CnpjaService } from '../../services/cnpja.service';
import { ClienteService } from '../../services/cliente.service';
import { ToastController, NavController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ClienteDto } from '../../services/cliente.service';
import { cpfValidator } from 'src/app/utils/validators';

@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.page.html',
  styleUrls: ['./add-empresa.page.scss'],
  standalone: false,
})
export class AddEmpresaPage implements OnInit {
  form: FormGroup;
  loadingLookup = false;

  constructor(private fb: FormBuilder,
              private cnpjService: CnpjaService,
              private clienteService: ClienteService,
              private toastController: ToastController,
              private navController: NavController) {
    this.form = this.fb.group({
      tipo: ['empresa', Validators.required],
      nome: ['', Validators.required],
      cnpj: [''],
      cpf: [''],
      fantasia: [''],
      endereco: [''],
      telefone: [''],
      email: [''],
      honorario: ['']
    });

    // adjust validators when tipo changes
    this.form.get('tipo')?.valueChanges.subscribe(t => this.onTipoChange(t));
    this.onTipoChange(this.form.get('tipo')?.value);
  }

  private onTipoChange(tipo: string) {
    if (tipo === 'empresa') {
      this.form.get('cnpj')?.setValidators([Validators.required]);
      this.form.get('cpf')?.clearValidators();
      this.form.get('fantasia')?.setValidators([]);
      this.clearPersonFields(); // clear person-specific fields when switching to empresa
    } else {
      this.form.get('cpf')?.setValidators([Validators.required, cpfValidator]);
      this.form.get('cnpj')?.clearValidators();
      this.form.get('fantasia')?.clearValidators();
      this.clearCompanyFields(); // clear company-specific fields when switching to pessoa
    }
    this.form.get('cnpj')?.updateValueAndValidity();
    this.form.get('cpf')?.updateValueAndValidity();
    this.form.get('fantasia')?.updateValueAndValidity();

    // Clear shared fields when the tipo changes so data from one mode does not leak to the other
    this.resetSharedFields();
  }

  ngOnInit() {}

  onCnpjInput(event: any) {
    const input = (event.target as HTMLInputElement) || { value: '' };
    const raw = input.value || '';
    const digits = raw.replace(/\D/g, '').slice(0, 14);
    const masked = this.formatCnpj(digits);
    this.form.get('cnpj')?.setValue(masked, { emitEvent: false });
  }

  onCpfInput(event: any) {
    const input = (event.target as HTMLInputElement) || { value: '' };
    const raw = input.value || '';
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    const masked = this.formatCpf(digits);
    this.form.get('cpf')?.setValue(masked, { emitEvent: false });
  }

  onTelefoneInput(event: any) {
    const input = (event.target as HTMLInputElement) || { value: '' };
    const raw = input.value || '';
    const digits = raw.replace(/\D/g, '').slice(0, 11); // max 11 digits (DDD + 9)
    const masked = this.formatTelefone(digits);
    this.form.get('telefone')?.setValue(masked, { emitEvent: false });
  }

  private formatCpf(digits: string) {
    // 000.000.000-00
    const d = digits.padEnd(11, ' ').slice(0, digits.length);
    let s = digits;
    if (s.length > 9) s = s.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (s.length > 6) s = s.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (s.length > 3) s = s.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    return s;
  }

  private formatCnpj(digits: string) {
    // 00.000.000/0000-00
    let s = digits;
    if (s.length > 12) s = s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
    else if (s.length > 8) s = s.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    else if (s.length > 5) s = s.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (s.length > 2) s = s.replace(/(\d{2})(\d{0,3})/, '$1.$2');
    return s;
  }

  private formatTelefone(digits: string) {
    // formats: (00) 00000-0000 for 11 digits, (00) 0000-0000 for 10 digits
    let s = digits;
    if (s.length > 10) s = s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (s.length > 6) s = s.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (s.length > 2) s = s.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    return s;
  }

  buscarCnpj() {
    const raw = this.form.value.cnpj || '';
    const digits = raw.replace(/\D/g, '');
    // don't call lookup unless we have 14 digits — avoids unnecessary backend hits
    if (!digits || digits.length !== 14) {
      this.presentToast('Informe o CNPJ completo (14 dígitos) antes de buscar.');
      return;
    }

    this.loadingLookup = true;
    this.cnpjService.lookup(digits).pipe(finalize(() => { this.loadingLookup = false; })).subscribe({
      next: (res: any) => {
        // map response to fields (adjust as needed)
        const company = res.company ?? {};
        const firstPhone = Array.isArray(res.phones) && res.phones.length ? res.phones[0] : null;
        const phoneStr = firstPhone ? `${firstPhone.area ?? ''}${firstPhone.number ?? ''}`.trim() : '';
        const firstEmail = Array.isArray(res.emails) && res.emails.length ? res.emails[0] : null;
        const emailStr = firstEmail ? (firstEmail.address ?? '') : '';

        this.form.patchValue({
          nome: company.name ?? res.alias ?? res.name ?? '',
          fantasia: res.alias ?? '',
          endereco: res.address ? `${res.address.street || ''} ${res.address.number || ''}, ${res.address.city || ''} - ${res.address.state || ''}` : '',
          telefone: phoneStr,
          email: emailStr,
          cpf: '' // clear CPF when doing a CNPJ lookup to avoid stray data
        });
        this.presentToast('Dados preenchidos automaticamente!');
      },
      error: (err) => {
        console.warn('CNPJ lookup error', err);
        this.presentToast('Não foi possível buscar os dados. Preencha manualmente.');
      }
    });
  }

  // Clear company-specific fields when switching to pessoa mode
  clearCompanyFields() {
    this.form.patchValue({
      cnpj: '',
      fantasia: '',
      cpf: ''
    });
  }

  // Clear person-specific fields when switching to empresa mode
  clearPersonFields() {
    this.form.patchValue({
      cpf: '',
      cnpj: ''
    });
  }

  // Clears fields that should not persist when switching between empresa/pessoa
  private resetSharedFields() {
    this.form.patchValue({
      nome: '',
      endereco: '',
      telefone: '',
      email: '',
      honorario: ''
    }, { emitEvent: false });
  }

  private async presentToast(message: string) {
    const t = await this.toastController.create({ message, duration: 2500 });
    await t.present();
  }

  // CPF lookup removed per user request

  limpar() {
    this.form.reset({
      tipo: 'empresa',
      nome: '',
      cnpj: '',
      cpf: '',
      fantasia: '',
      endereco: '',
      telefone: '',
      email: '',
      honorario: ''
    });
    this.onTipoChange('empresa');
  }

  async salvar() {
    if (this.form.invalid) {
      const t = await this.toastController.create({ message: 'Formulário inválido', duration: 1500 });
      await t.present();
      return;
    }

    const raw = this.form.value;
    const tipo: 'empresa' | 'pessoa' = raw.tipo === 'pessoa' ? 'pessoa' : 'empresa';
    const payload: ClienteDto = {
      tipo,
      nome: raw.nome,
      nomeFantasia: tipo === 'empresa' ? (raw.fantasia || '') : null,
      cpf: tipo === 'pessoa' ? (raw.cpf || '').toString().replace(/\D/g, '') : null,
      cnpj: tipo === 'empresa' ? (raw.cnpj || '').toString().replace(/\D/g, '') : null,
      endereco: raw.endereco || null,
      telefone: raw.telefone || null,
      email: raw.email || null,
      honorario: raw.honorario ? parseFloat(raw.honorario) : 0
    };

    this.clienteService.create(payload).subscribe({
      next: async (res) => {
        const t = await this.toastController.create({ message: 'Cliente salvo com sucesso', duration: 1500 });
        await t.present();
        this.navController.navigateBack('/empresas');
      },
      error: async (err) => {
        console.error('Erro ao salvar cliente', err);
        const t = await this.toastController.create({ message: 'Erro ao salvar cliente', duration: 2000 });
        await t.present();
      }
    });
  }

}
