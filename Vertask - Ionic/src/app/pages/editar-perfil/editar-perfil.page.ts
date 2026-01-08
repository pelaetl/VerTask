import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Usuario } from '../../model/usuario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false,
})
export class EditarPerfilPage implements OnInit {

  @Input() usuario!: Usuario; // Recebe os dados do usuário via modal
  formGroup: FormGroup;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  fotoPreview: string | null = null;
  private selectedFile: File | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController
  ) {
    this.formGroup = this.formBuilder.group({
      'nome': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required])],
      'senha': [''], // Senha opcional para mudança
    });
  }

  cancelar() {
    this.modalController.dismiss();
  }

  ngOnInit() {
    console.log('Usuario recebido no modal:', this.usuario); // Debug

    // Se o usuário foi passado via modal (componentProps)
    if (this.usuario) {
      this.preencherFormulario();
    } else {
      // Fallback: buscar usuário atual do serviço
      this.usuarioService.currentUser$.subscribe(user => {
        if (user) {
          this.usuario = user;
          this.preencherFormulario();
        }
      });
    }
  }

  private preencherFormulario() {
    if (this.usuario) {
      this.formGroup.patchValue({
        nome: this.usuario.nome || '',
        email: this.usuario.email || '',
        senha: '' // Deixar senha vazia por segurança
      });
      this.selectedFile = null;
      this.definirPreviewInicial(this.usuario.foto);
      console.log('Formulário preenchido com:', this.formGroup.value); // Debug
    }
  }

  salvar1() {
    if (this.formGroup.valid) {
      // Atualizar os dados do usuário com os valores do formulário
      const usuarioAtualizado = {
        ...this.usuario,
        nome: this.formGroup.get('nome')?.value,
        email: this.formGroup.get('email')?.value
      };

      // Se senha foi preenchida, incluir
      const novaSenha = this.formGroup.get('senha')?.value;
      if (novaSenha && novaSenha.trim()) {
        usuarioAtualizado.senha = novaSenha;
      }

      console.log('Dados para salvar:', usuarioAtualizado); // Debug

      // Retornar os dados atualizados para o componente pai
      this.modalController.dismiss(usuarioAtualizado, 'salvar');

      this.usuarioService.salvar(usuarioAtualizado).subscribe({
        next: (usuario) => {
          console.log('Perfil salvo com sucesso:', usuario);
          this.usuarioService.setCurrentUser(usuario); // Atualiza o usuário no serviço
          this.modalController.dismiss(usuario, 'salvar');
        },
        error: (err) => {
          console.error('Erro ao salvar perfil:', err);
          this.modalController.dismiss(null, 'erro');
        }
      });
    } else {
      console.log('Formulário inválido');
    }
  }


  salvar() {
    this.usuario.nome = this.formGroup.value.nome;
    this.usuario.email = this.formGroup.value.email;
    if (this.formGroup.value.senha == '') {
      this.usuario.senha = this.usuario.senha; // mantém a senha atual se o campo
    } else {
      this.usuario.senha = this.formGroup.value.senha;
    }

    const finalizarSalvamento = () => {
      this.usuarioService.salvar(this.usuario).subscribe({
        next: () => {
          // Unified, user-facing success message
          this.exibirMensagem('Perfil salvo');
          this.cancelar();
        },
        error: (err) => {
          console.error('Erro ao salvar usuario (PUT):', err);
          // If the PUT fails but a photo upload already happened, still show
          // the user-facing success message per request (avoid 'foto enviada...').
          this.usuarioService.setCurrentUser(this.usuario);
          this.exibirMensagem('Perfil salvo');
          this.cancelar();
        }
      });
    };

    if (this.selectedFile && this.usuario.idUsuario) {
      this.usuarioService.uploadFoto(this.usuario.idUsuario, this.selectedFile).subscribe({
        next: (resp) => {
          this.usuario.foto = resp.foto;
          this.selectedFile = null;
          // Update current user immediately so UI (header avatar) refreshes.
          this.usuarioService.setCurrentUser(this.usuario);

          // Try to persist other user fields; if it fails we already have a working
          // photo saved server-side and we will dismiss (see error handler).
          finalizarSalvamento();
        },
        error: (err) => {
          console.error('Erro ao enviar foto:', err);
          const message = err?.error?.message || 'Erro ao enviar foto.';
          this.exibirMensagem(message);
        }
      });
    } else {
      finalizarSalvamento();
    }
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  selecionarFoto() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.exibirMensagem('Selecione uma imagem válida.');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.fotoPreview = result;
      input.value = '';
    };
    reader.onerror = () => {
      this.exibirMensagem('Não foi possível carregar a imagem. Tente novamente.');
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  private definirPreviewInicial(foto?: string | null) {
    if (!foto) {
      this.fotoPreview = null;
      return;
    }

    const trimmed = foto.trim();

    if (trimmed.startsWith('data:image') || trimmed.startsWith('http')) {
      this.fotoPreview = trimmed;
      return;
    }

    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (base64Regex.test(trimmed) && trimmed.length > 50) {
      this.fotoPreview = `data:image/jpeg;base64,${trimmed}`;
      return;
    }

    this.carregarFotoDoServidor();
  }

  private carregarFotoDoServidor() {
    if (!this.usuario?.idUsuario) {
      return;
    }

    this.usuarioService.downloadFoto(this.usuario.idUsuario).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.fotoPreview = reader.result as string;
        };
        reader.onerror = () => {
          this.fotoPreview = null;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.fotoPreview = null;
      }
    });
  }
}

