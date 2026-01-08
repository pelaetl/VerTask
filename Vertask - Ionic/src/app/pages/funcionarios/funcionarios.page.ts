import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/model/usuario';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.page.html',
  styleUrls: ['./funcionarios.page.scss'],
  standalone: false
})
export class FuncionariosPage implements OnInit {

  funcionarios: Usuario[];
  funcionariosFiltrados: Usuario[];
  searchTerm = '';
  new: any;
  avatarErro: Record<number, boolean> = {};

  constructor(private router: Router, private popoverController: PopoverController, private funcionarioService: FuncionarioService, public usuarioService: UsuarioService, private toastController: ToastController, private alertController: AlertController) {
    this.funcionarios = [];
    this.funcionariosFiltrados = [];
  }

  onAvatarError(idUsuario?: number) {
    if (!idUsuario) return;
    this.avatarErro[idUsuario] = true;
  }

  ngOnInit() {
    this.carregarFuncionarios();
  }

  ionViewWillEnter() {
    this.carregarFuncionarios();
  }

  onSearchChange(event: any) {
    const valor = event?.detail?.value || event?.target?.value || '';
    this.searchTerm = valor.toLowerCase();
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    if (!this.searchTerm.trim()) {
      this.funcionariosFiltrados = [...this.funcionarios];
    } else {
      this.funcionariosFiltrados = this.funcionarios.filter(f => {
        const nome = (f?.nome || '').toLowerCase();
        const email = (f?.email || '').toLowerCase();
        return nome.includes(this.searchTerm) || email.includes(this.searchTerm);
      });
    }
  }

  async excluir(funcionario: Usuario) {

    if (this.isAdmin(funcionario)) {
      this.exibirMensagem('Administrador não pode ser excluído aqui.');
      return;
    }

    // para segurança, só permite se houver idFuncionario
    const idFunc = (funcionario as any).idFuncionario;
    if (!idFunc) {
      this.exibirMensagem('Registro não possui id de funcionário.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirma a exclusão',
      message: funcionario.nome,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            this.funcionarioService.excluir(idFunc).subscribe({
              next:
                () => {
                  this.carregarFuncionarios();
                  this.exibirMensagem('Registro excluído com sucesso!');
                },
              error: (erro) => {
                console.error('Erro ao excluir tarefa:', erro);
                this.exibirMensagem('Erro ao excluir o registro.');
              }
            });
          }
        }
      ]
    })
    await alert.present()
  }

  editarFuncionario(funcionario: Usuario) {
    if (this.isAdmin(funcionario)) {
      this.exibirMensagem('Administrador não pode ser editado aqui.');
      return;
    }
    const idFunc = (funcionario as any).idFuncionario;
    if (!idFunc) {
      this.exibirMensagem('Registro não possui id de funcionário.');
      return;
    }
    this.router.navigate(['/editar-funcionario', idFunc]);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  carregarFuncionarios() {
    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.funcionarios = dados || [];
        this.aplicarFiltro();
      },
      error: (erro) => {
        console.error('Erro ao carregar usuarios:', erro);
      }
    });
  }

  isAdmin(user: Usuario) {
    return (user?.role || '').toLowerCase().includes('admin');
  }


  popoverAberto = false;
  popoverEvento: any;

  abrirPerfil(ev: any) {
    this.popoverEvento = ev;
    this.popoverAberto = true;
  }

  editarPerfil() {

  }

  sair() {
    // Fecha o popover primeiro
    this.popoverController.dismiss().then(() => {
      // Depois navega
      this.router.navigate(['/login']);
    });
  }

}


