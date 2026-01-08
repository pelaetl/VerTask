import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
  standalone: false
})
export class ForgotPage implements OnInit {

  email: string;
  formGroup: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController
  ) {
    this.email = "";
    this.formGroup = this.formBuilder.group({
      'email': [this.email, Validators.compose([Validators.required, Validators.email])]
    });
  }

  ngOnInit() {}

  async enviarLink() {
    this.email = this.formGroup.value.email;

    const loading = await this.loadingController.create({
      message: 'Enviando...',
      spinner: 'crescent'
    });

    await loading.present(); // mostra o loading

    // Send verification code and navigate to code entry page
    this.usuarioService.enviarCodigo(this.email).subscribe({
      next: async () => {
        await loading.dismiss(); // esconde o loading

        const toast = await this.toastController.create({
          message: 'Código enviado para ' + this.email,
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        // Navigate to code page and pass the email in navigation state
        setTimeout(() => this.router.navigate(['/enviar-codigo'], { state: { email: this.email } }), 800);
      },
      error: async (err) => {
        await loading.dismiss(); // esconde o loading

        const toast = await this.toastController.create({
          message: 'Erro ao enviar código: ' + (err.error?.message || err.message || 'Tente novamente'),
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}