import { Component, OnInit } from '@angular/core';
import { Setor } from 'src/app/model/setor';
import { SetorService } from 'src/app/services/setor.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setores',
  templateUrl: './setores.page.html',
  styleUrls: ['./setores.page.scss'],
  standalone: false
})
export class SetoresPage implements OnInit {

  setores: Setor[];
  usuarioAtual: any = null;
  new: any;

  constructor(
    private router: Router, 
    private popoverController: PopoverController, 
    private setorService: SetorService, 
    private usuarioService: UsuarioService,
    private toastController: ToastController, 
    private alertController: AlertController
  ) {
    this.setores = []
  }

  ngOnInit() {
    this.carregarSetores();
    this.carregarUsuarioAtual();
  }

  carregarUsuarioAtual() {
    this.usuarioService.currentUser$.subscribe((usuario: any) => {
      this.usuarioAtual = usuario;
    });
  }

  ionViewWillEnter() {
    this.carregarSetores();
  }

  async excluir(setor: Setor) {

    const alert = await this.alertController.create({
      header: 'Confirma a exclusão',
      message: setor.nome,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            this.setorService.excluir(setor.idSetor).subscribe({
              next:
                () => {
                  this.carregarSetores();
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

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  carregarSetores() {
    this.setorService.listar().subscribe({
      next: (dados) => {
        this.setores = dados;
      },
      error: (erro) => {
        console.error('Erro ao carregar setores:', erro);
      }
    });
  }

  editarSetor(setor: Setor) {
    this.router.navigate(['/setor', setor.idSetor]);
  }

  novoSetor() {
    this.router.navigate(['/setor']);
  }

  popoverAberto = false;
  popoverEvento: any;

  abrirPerfil(ev: any) {
    this.popoverEvento = ev;
    this.popoverAberto = true;
  }

  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  sair() {
    // Fecha o popover primeiro
    this.popoverController.dismiss().then(() => {
      // Depois navega
      this.router.navigate(['/login']);
    });
  }

}


