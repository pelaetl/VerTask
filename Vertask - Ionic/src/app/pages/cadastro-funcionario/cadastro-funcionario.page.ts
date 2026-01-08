import { Component, OnInit } from '@angular/core';
import { Funcionario } from 'src/app/model/funcionario';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { Setor } from 'src/app/model/setor';
import { SetorService } from 'src/app/services/setor.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro-funcionario',
  templateUrl: './cadastro-funcionario.page.html',
  styleUrls: ['./cadastro-funcionario.page.scss'],
  standalone: false,
})
export class CadastroFuncionarioPage implements OnInit {

  setores: Setor[];
  funcionario: Funcionario;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private toastController: ToastController, 
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute, 
    private navController: NavController, 
    private router: Router,
    private funcionarioService: FuncionarioService, 
    private setorService: SetorService,
    private usuarioService: UsuarioService
  ) {
    this.setores = [];
    this.funcionario = new Funcionario();

    this.formGroup = this.formBuilder.group({
      'setor': [this.funcionario.idSetor, Validators.compose([Validators.required])],
      'nome': [this.funcionario.nome, Validators.compose([Validators.required])],
      'email': [
        this.funcionario.email,
        Validators.compose([Validators.required, Validators.email])
      ],
      'senha': [this.funcionario.senha, Validators.compose([Validators.required])],
    });
  }


  ngOnInit() {
    this.carregarSetores();
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
          senha: this.formGroup.value.senha,
          idSetor: this.formGroup.value.setor
        };

        // Redireciona para página de verificação
        this.router.navigate(['/enviar-codigo'], {
          state: {
            email: email,
            dadosCadastro: dadosCadastro,
            tipo: 'funcionario',
            origem: 'cadastro-funcionario'
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

  carregarSetores() {
    this.setorService.listar().subscribe({
      next: (setores) => {
        this.setores = setores;
      },
      error: (err) => {
        this.exibirMensagem('Erro ao carregar os setores.');
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

