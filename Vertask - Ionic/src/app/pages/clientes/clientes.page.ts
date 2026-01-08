import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService, ClienteDto } from 'src/app/services/cliente.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: false,
})
export class ClientesPage implements OnInit {
  clientes: ClienteDto[] = [];
  carregando = true;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.carregarClientes();
  }

  ionViewWillEnter() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.carregando = true;
    this.clienteService.list().subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes:', erro);
        this.exibirMensagem('Erro ao carregar clientes');
        this.carregando = false;
      }
    });
  }

  editarCliente(cliente: ClienteDto) {
    if (cliente.id) {
      this.router.navigate(['/editar-cliente', cliente.id]);
    }
  }

  async excluir(cliente: ClienteDto) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja excluir o cliente ${cliente.nome}?`,
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

  adicionarCliente() {
    this.router.navigate(['/add-cliente']);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }

}
