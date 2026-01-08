import { Component, OnInit } from '@angular/core';
import { Administrador } from 'src/app/model/administrador';
import { AdministradorService } from 'src/app/services/administrador.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-cadastro-administrador',
  templateUrl: './cadastro-administrador.page.html',
  styleUrls: ['./cadastro-administrador.page.scss'],
  standalone: false,
})
export class CadastroAdministradorPage implements OnInit {

  administrador: Administrador;
  formGroup: FormGroup;

  constructor(
    private administradorService: AdministradorService, 
    private formBuilder: FormBuilder, 
    private toastController: ToastController,
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute, 
    private navController: NavController, 
    private router: Router,
    private usuarioService: UsuarioService
  ) {

    this.administrador = new Administrador();

    this.formGroup = this.formBuilder.group({
      'nome': [this.administrador.nome, Validators.compose([Validators.required])],
      'email': [
        this.administrador.email,
        Validators.compose([Validators.required, Validators.email])
      ],
      'senha': [this.administrador.senha, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
  }

  async salvar() {
    if (this.formGroup.invalid) {
      this.exibirMensagem('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando código de verificação...'
    });
    await loading.present();

    const email = this.formGroup.value.email;
    
    // Backend gera e envia o código
    this.usuarioService.enviarCodigo(email).subscribe({
      next: async () => {
        await loading.dismiss();
        
        const dadosCadastro = {
          nome: this.formGroup.value.nome,
          email: this.formGroup.value.email,
          senha: this.formGroup.value.senha
        };

        // Redireciona para página de verificação
        this.router.navigate(['/enviar-codigo'], {
          state: {
            email: email,
            dadosCadastro: dadosCadastro,
            tipo: 'administrador',
            origem: 'cadastro-administrador'
          }
        });
      },
      error: async (err) => {
        await loading.dismiss();
        this.exibirMensagem('Erro ao enviar código de verificação. Tente novamente.');
        console.error('Erro ao enviar código:', err);
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

}
