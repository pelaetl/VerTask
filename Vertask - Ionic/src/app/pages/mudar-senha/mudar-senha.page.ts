import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mudar-senha',
  templateUrl: './mudar-senha.page.html',
  styleUrls: ['./mudar-senha.page.scss'],
  standalone: false
})
export class MudarSenhaPage implements OnInit {

  form: FormGroup;
  email: string = '';
  mostrarNova = false;
  mostrarConfirmar = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.form = this.fb.group({
      // allow 4+ chars so short numeric codes used in the app (e.g. 4 digits) are accepted
      novaSenha: ['', [Validators.required, Validators.minLength(4)]],
      confirmarSenha: ['', Validators.required]
    });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state) {
      this.email = state['email'] || '';
    }
  }

  ngOnInit() {
    if (!this.email) {
      this.toastCtrl.create({ message: 'Email não fornecido.', duration: 1500 }).then(t => t.present());
      this.router.navigate(['/login']);
    }
  }

  toggleNovaSenha() { this.mostrarNova = !this.mostrarNova; }
  toggleConfirmarSenha() { this.mostrarConfirmar = !this.mostrarConfirmar; }

  async submit() {
    if (this.form.invalid) return;
    const novaSenha = this.form.value.novaSenha;
    const confirmar = this.form.value.confirmarSenha;
    if (novaSenha !== confirmar) {
      const t = await this.toastCtrl.create({ message: 'As senhas não coincidem.', duration: 1500, color: 'danger' });
      await t.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Atualizando senha...' });
    await loading.present();

    this.usuarioService.resetPassword(this.email, novaSenha).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Senha alterada com sucesso.', duration: 1500, color: 'success' });
        await toast.present();
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Erro ao alterar senha. Tente novamente.', duration: 2000, color: 'danger' });
        await toast.present();
      }
    });
  }

}

