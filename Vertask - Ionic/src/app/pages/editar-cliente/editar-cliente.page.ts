import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService, ClienteDto } from 'src/app/services/cliente.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.page.html',
  styleUrls: ['./editar-cliente.page.scss'],
  standalone: false
})
export class EditarClientePage implements OnInit {
  formGroup: FormGroup;
  cliente: ClienteDto | null = null;
  clienteId: number | null = null;
  carregando = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private formBuilder: FormBuilder,
    
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.formGroup = this.formBuilder.group({
      'tipo': ['empresa', Validators.required],
      'nome': ['', Validators.required],
      'nomeFantasia': [''],
      'cpf': [''],
      'cnpj': [''],
      'endereco': [''],
      'telefone': [''],
      'email': ['', Validators.email],
      'honorario': ['']
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.clienteId = parseInt(id, 10);
        this.carregarCliente(this.clienteId);
      } else {
        this.carregando = false;
      }
    });
  }

  carregarCliente(id: number) {
    this.clienteService.get(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.preencherFormulario();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar cliente:', erro);
        this.exibirMensagem('Erro ao carregar dados do cliente');
        this.carregando = false;
        this.router.navigate(['/clientes']);
      }
    });
  }

  private preencherFormulario() {
    if (this.cliente) {
      this.formGroup.patchValue({
        tipo: this.cliente.tipo || 'empresa',
        nome: this.cliente.nome || '',
        nomeFantasia: this.cliente.nomeFantasia || '',
        cpf: this.cliente.cpf || '',
        cnpj: this.cliente.cnpj || '',
        endereco: this.cliente.endereco || '',
        telefone: this.cliente.telefone || '',
        email: this.cliente.email || '',
        honorario: this.cliente.honorario || ''
      });

      // Desabilitar campos que não podem ser editados
      this.formGroup.get('tipo')?.disable();
      this.formGroup.get('cpf')?.disable();
      this.formGroup.get('cnpj')?.disable();
    }
  }

  salvar() {
    if (this.clienteId && this.cliente) {
      // Pegar valores dos campos habilitados e mantém valores originais para desabilitados
      const clienteAtualizado: ClienteDto = {
        id: this.clienteId,
        tipo: this.cliente.tipo, // mantém tipo original
        nome: this.formGroup.get('nome')?.value,
        nomeFantasia: this.formGroup.get('nomeFantasia')?.value,
        cpf: this.cliente.cpf, // mantém CPF original
        cnpj: this.cliente.cnpj, // mantém CNPJ original
        endereco: this.formGroup.get('endereco')?.value,
        telefone: this.formGroup.get('telefone')?.value,
        email: this.formGroup.get('email')?.value,
        honorario: this.formGroup.get('honorario')?.value
      };

      this.clienteService.update(this.clienteId, clienteAtualizado).subscribe({
        next: () => {
          this.exibirMensagem('Cliente salvo com sucesso');
          this.router.navigate(['/empresas']);
        },
        error: (erro) => {
          console.error('Erro ao salvar cliente:', erro);
          const mensagem = erro?.error?.message || 'Erro ao salvar cliente';
          this.exibirMensagem(mensagem);
        }
      });
    } else {
      this.exibirMensagem('Formulário inválido');
    }
  }

  cancelar() {
    this.router.navigate(['/empresas']);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}
