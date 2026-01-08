import { Component, OnInit } from '@angular/core';
import { Setor } from 'src/app/model/setor';
import { SetorService } from 'src/app/services/setor.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-setor',
  templateUrl: './setor.page.html',
  styleUrls: ['./setor.page.scss'],
  standalone: false,
})
export class SetorPage implements OnInit {

  setor: Setor;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private setorService: SetorService,
  ) {

    this.setor = new Setor();

    this.formGroup = this.formBuilder.group({
      'nomeSetor': ['', Validators.compose([Validators.required])],
      'descricaoSetor': ['', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    const id = parseFloat(this.activatedRoute.snapshot.params['id']);
    if (!isNaN(id)) {
      this.setorService.buscarPorId(id).subscribe({
        next: (setor) => {
          this.setor = setor;
          this.formGroup.get('nomeSetor')?.setValue(this.setor.nome);
          this.formGroup.get('descricaoSetor')?.setValue(this.setor.descricao);
        },
        error: (erro) => {
          console.error('Erro ao buscar setor por ID:', erro);
        }
      });
    }
  }

  salvar() {
    this.setor.nome = this.formGroup.value.nomeSetor;
    this.setor.descricao = this.formGroup.value.descricaoSetor;
    

    this.setorService.existeSetorComNome(this.setor.nome).subscribe({
      next: (existe) => {
        if (existe) {
          this.exibirMensagem('Este setor já está cadastrado.');
        } else {
          this.setorService.salvar(this.setor).subscribe({
            next: () => {
              this.exibirMensagem('Setor salvo com sucesso!!!');
              this.navController.navigateBack('/setores');
            },
            error: () => {
              this.exibirMensagem('Erro ao salvar setor.');
            }
          });
        }
      },
      error: () => {
        this.exibirMensagem('Erro ao verificar nome do setor.');
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

