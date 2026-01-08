import { Component, OnInit } from '@angular/core';
import { Funcionario } from 'src/app/model/funcionario';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { Setor } from 'src/app/model/setor';
import { SetorService } from 'src/app/services/setor.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-editar-funcionario',
  templateUrl: './editar-funcionario.page.html',
  styleUrls: ['./editar-funcionario.page.scss'],
  standalone: false,
})
export class EditarFuncionarioPage implements OnInit {

  funcionario: Funcionario;
  formGroup: FormGroup;
  setores: Setor[];
  

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private funcionarioService: FuncionarioService,
    private setorService: SetorService
  ) {

    this.funcionario = new Funcionario();
    this.setores = [];

    this.formGroup = this.formBuilder.group({
      'nome': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required])],
      'setor': ['', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.carregarSetores();
    
    const id = parseFloat(this.activatedRoute.snapshot.params['id']);
    if (!isNaN(id)) {
      this.funcionarioService.buscarPorId(id).subscribe({
        next: (funcionario) => {
          this.funcionario = funcionario;
          this.formGroup.get('nome')?.setValue(this.funcionario.nome);
          this.formGroup.get('email')?.setValue(this.funcionario.email);
          this.formGroup.get('setor')?.setValue(this.carregarNomeSetor());
        },
        error: (erro) => {
          console.error('Erro ao buscar funcionario por ID:', erro);
        }
      });
    }
  }

  carregarNomeSetor(){
    this.setorService.buscarPorId(this.funcionario.idSetor).subscribe({
      next: (setor) => {
        this.formGroup.get('setor')?.setValue(setor.idSetor);
      },
      error: (erro) => {
        console.error('Erro ao buscar setor por ID:', erro);
      }
    });
  }
  salvar() {
    this.funcionario.nome = this.formGroup.value.nome;
    this.funcionario.email = this.formGroup.value.email;
    this.funcionario.senha = this.funcionario.senha;
    this.funcionario.idSetor = this.formGroup.value.setor;

    //this.funcionarioService.existeFuncionarioComNome(this.funcionario.nome).subscribe({
    // next: (existe) => {
    //   if (existe) {
    //     this.exibirMensagem('Este funcionario já está cadastrado.');
    //   } else {
    this.funcionarioService.salvar(this.funcionario).subscribe({
      next: () => {
        this.exibirMensagem('Funcionario salvo com sucesso!!!');
        this.navController.navigateBack('/funcionarios');
      },
      error: () => {
        this.exibirMensagem('Erro ao salvar funcionario.');
      }
    });
    //   }
    // },
    //error: () => {
    //  this.exibirMensagem('Erro ao verificar nome do funcionario.');
    //}
    //});
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

