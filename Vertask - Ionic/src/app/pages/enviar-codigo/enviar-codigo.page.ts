import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/model/usuario';
import { Funcionario } from 'src/app/model/funcionario';
import { Administrador } from 'src/app/model/administrador';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { AdministradorService } from 'src/app/services/administrador.service';
import { FormBuilder, FormGroup, Validator, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enviar-codigo',
  templateUrl: './enviar-codigo.page.html',
  styleUrls: ['./enviar-codigo.page.scss'],
  standalone: false,
})
export class EnviarCodigoPage implements OnInit {

  usuario: Usuario;
  codigo: String;
  formGroup: FormGroup;
  get codigoControls(): FormArray {
    return this.formGroup.get('codigo') as FormArray;
  }
  get formInvalid(): boolean {
    // invalid if any control is empty or not digit
    const arr = this.codigoControls.controls.map(c => c.value);
    return arr.some(v => !v || !/^[0-9]$/.test(v));
  }
  
  // Dados recebidos da navegação
  private codigoCorreto: string = '';
  private dadosCadastro: any = null;
  private tipoCadastro: 'funcionario' | 'administrador' = 'funcionario';
  private origemCadastro: string = '';
  email: string = '';

  constructor(
    private router: Router, 
    private formBuilder: FormBuilder, 
    private toastController: ToastController, 
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navController: NavController, 
    private usuarioService: UsuarioService,
    private funcionarioService: FuncionarioService,
    private administradorService: AdministradorService
  ) {
    this.codigo = "";
    this.usuario = new Usuario();

    // FormArray with 6 single-digit controls
    this.formGroup = this.formBuilder.group({
      codigo: this.formBuilder.array(
        Array.from({ length: 6 }).map(() => new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]))
      )
    });

    // Recebe dados da navegação
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    
    if (state) {
      this.codigoCorreto = state['codigo'] || '';
      this.email = state['email'] || '';
      this.dadosCadastro = state['dadosCadastro'];
      this.tipoCadastro = state['tipo'] || 'funcionario';
      this.origemCadastro = state['origem'] || '';
    }
  }

  ngOnInit() {
    // If this page is used for registration flow, dadosCadastro will be present.
    // If used for password-reset flow, we only need the email.
    if (!this.email) {
      this.exibirMensagem('Erro: email de verificação não encontrado.');
      this.router.navigate(['/login']);
    }
  }

  async confirmarCodigo() {
    const codigoDigitado = this.codigoControls.controls.map(c => c.value).join('');
    
    console.log('Código digitado:', codigoDigitado);
    console.log('Email:', this.email);
    console.log('Dados cadastro:', this.dadosCadastro);
    console.log('Tipo:', this.tipoCadastro);

    const loading = await this.loadingController.create({
      message: 'Validando código...'
    });
    await loading.present();

    // Valida código no backend
    this.usuarioService.validarCodigo(this.email, codigoDigitado).subscribe({
      next: async () => {
        console.log('Código validado com sucesso!');
        
        if (this.dadosCadastro) {
          // registration flow - update loading message
          loading.message = 'Criando conta...';
          console.log('Iniciando criação de usuário...');
          await this.criarUsuario(loading);
        } else {
          // password reset flow
          await loading.dismiss();
          this.router.navigate(['/mudar-senha'], { state: { email: this.email } });
        }
      },
      error: async (err) => {
        console.error('Erro ao validar código:', err);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Código Inválido',
          message: 'O código digitado não confere. Tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
        // clear inputs
        this.codigoControls.controls.forEach(c => c.setValue(''));
        const first = document.getElementById('digit-0') as HTMLInputElement | null;
        if (first) first.focus();
      }
    });
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = (input.value || '').replace(/[^0-9]/g, '');
    input.value = val;
    this.codigoControls.at(index).setValue(val);
    if (val && index < this.codigoControls.length - 1) {
      const next = document.getElementById('digit-' + (index + 1)) as HTMLInputElement | null;
      if (next) next.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById('digit-' + (index - 1)) as HTMLInputElement | null;
      if (prev) {
        prev.focus();
        prev.select();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') || '';
    if (!pasted) return;
    const chars = pasted.slice(0, this.codigoControls.length).split('');
    this.codigoControls.controls.forEach((c, i) => c.setValue(chars[i] || ''));
    // focus next after last pasted
    const lastIndex = Math.min(chars.length, this.codigoControls.length) - 1;
    const next = document.getElementById('digit-' + (lastIndex + 1)) as HTMLInputElement | null;
    if (next) next.focus();
  }

  private async criarUsuario(loading: any) {
    console.log('Entrando em criarUsuario');
    console.log('Tipo de cadastro:', this.tipoCadastro);

    if (this.tipoCadastro === 'funcionario') {
      // Criar funcionário
      const funcionario = new Funcionario();
      funcionario.nome = this.dadosCadastro.nome;
      funcionario.email = this.dadosCadastro.email;
      funcionario.senha = this.dadosCadastro.senha;
      funcionario.idSetor = this.dadosCadastro.idSetor;
      funcionario.role = 'funcionario';

      console.log('Criando funcionário:', funcionario);

      this.funcionarioService.salvar(funcionario).subscribe({
        next: async () => {
          console.log('Funcionário criado com sucesso!');
          await loading.dismiss();
          this.exibirMensagem('Conta criada com sucesso!');
          setTimeout(() => {
            this.router.navigate(['/login'], { replaceUrl: true });
          }, 1000);
        },
        error: async (err) => {
          console.error('Erro ao criar funcionário:', err);
          await loading.dismiss();
          this.exibirMensagem('Erro ao criar conta. Tente novamente.');
        }
      });
    } else {
      // Criar administrador
      const administrador = new Administrador();
      administrador.nome = this.dadosCadastro.nome;
      administrador.email = this.dadosCadastro.email;
      administrador.senha = this.dadosCadastro.senha;
      administrador.role = 'administrador';

      console.log('Criando administrador:', administrador);

      this.administradorService.salvar(administrador).subscribe({
        next: async () => {
          console.log('Administrador criado com sucesso!');
          await loading.dismiss();
          this.exibirMensagem('Conta criada com sucesso!');
          setTimeout(() => {
            this.router.navigate(['/login'], { replaceUrl: true });
          }, 1000);
        },
        error: async (err) => {
          console.error('Erro ao criar administrador:', err);
          await loading.dismiss();
          this.exibirMensagem('Erro ao criar conta. Tente novamente.');
        }
      });
    }
  }

  async enviarCodigoNovamente() {
    if (!this.email) {
      this.exibirMensagem('Email não encontrado.');
      return;
    }

    this.usuarioService.enviarCodigo(this.email).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Código Reenviado',
          message: `Um novo código foi enviado para ${this.email}`,
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async (err) => {
        this.exibirMensagem('Erro ao reenviar código. Tente novamente.');
        console.error('Erro ao reenviar:', err);
      }
    });
  }

  cancelar() {
    const rotaDestino = this.origemCadastro || '/login';
    this.router.navigate([rotaDestino]);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}


