import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/model/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Administrador } from 'src/app/model/administrador';
import { Funcionario } from 'src/app/model/funcionario';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  usuario: Usuario;
  login: String;
  senha: String;
  formGroup: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, private toastController: ToastController, private navController: NavController, private usuarioService: UsuarioService) {
    this.login = "";
    this.senha = "";
    this.usuario = new Usuario();

    this.formGroup = this.formBuilder.group({
      'login': [
        this.login,
        Validators.compose([Validators.required, Validators.email])
      ],
      'senha': [this.senha, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.usuarioService.encerrar();
  }

  autenticar() {
    this.login = this.formGroup.value.login;
    this.senha = this.formGroup.value.senha;

    this.usuarioService.autenticar(this.login, this.senha).subscribe({
      next: user => {
        this.usuarioService.setCurrentUser(user);
        const role = (user.role ?? '').trim().toLowerCase();
        console.log('Role recebido do backend:', user.role, 'normalizado:', role);

        if (role === 'administrador') {
          this.router.navigate(['/inicio-administrador']);
          this.exibirMensagem('Login realizado com sucesso!');
        } else if (role === 'funcionario') {
          this.router.navigate(['/inicio-funcionario']);
          this.exibirMensagem('Login realizado com sucesso!');
        } else {
          this.exibirMensagem('Tipo de usuário desconhecido!');
        }

        this.formGroup.reset();
        
      },
      error: err => {
        console.error('login error', err);
        this.exibirMensagem('Login e/ou senha inválidos');
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


