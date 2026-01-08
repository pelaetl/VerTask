import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.page.html',
  styleUrls: ['./empresas.page.scss'],
  standalone: false,
})
export class EmpresasPage implements OnInit {
  clientes: Array<any> = [];
  clientesFiltrados: Array<any> = [];
  searchTerm: string = '';

  constructor(
    private clienteService: ClienteService,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadClientes();
  }

  ionViewWillEnter() {
    // Reload clientes every time the page is entered (e.g., after adding a new cliente)
    this.loadClientes();
  }

  async loadClientes() {
    this.clienteService.list().subscribe({
      next: (res: any[]) => {
        this.clientes = res || [];
        this.clientesFiltrados = this.clientes.slice();
      },
      error: async (err) => {
        console.error('Erro ao listar clientes', err);
        const t = await this.toastController.create({ message: 'Erro ao carregar clientes', duration: 2000 });
        await t.present();
      }
    });
  }

  onSearchChange(event: any) {
    // Ensure we don't mix `??` with `||` without parentheses — compute safely
    const raw = (event?.detail?.value ?? event?.target?.value ?? this.searchTerm);
    const v = (raw || '').toString().trim();
    this.searchTerm = v;
    const term = v.toLowerCase();
    const digits = (v || '').replace(/\D/g, '');

    if (!term) {
      this.clientesFiltrados = this.clientes.slice();
      return;
    }

    this.clientesFiltrados = this.clientes.filter(c => {
      const nome = (c.nome || c.razaoSocial || '').toString().toLowerCase();
      if (nome.includes(term)) return true;
      const cnpj = (c.cnpj || '').toString().replace(/\D/g, '');
      const cpf = (c.cpf || '').toString().replace(/\D/g, '');
      if (digits && (cnpj.includes(digits) || cpf.includes(digits))) return true;
      // also allow searching formatted numbers (with dots/dashes)
      if ((c.cnpj || c.cpf || '').toString().toLowerCase().includes(term)) return true;
      return false;
    });
  }

  editarCliente(cliente: any, ev?: Event) {
    ev?.stopPropagation();
    if (cliente?.id) {
      this.router.navigate(['/editar-cliente', cliente.id]);
    }
  }

  async excluir(cliente: any, ev?: Event) {
    ev?.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja excluir o cliente ${cliente?.nome}?`,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Excluir',
          cssClass: 'danger',
          handler: () => {
            // Implementar exclusão quando tiver o serviço de delete
            this.exibirMensagem('Funcionalidade de exclusão em desenvolvimento');
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }

}
