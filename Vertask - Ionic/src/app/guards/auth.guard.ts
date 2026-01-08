import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

type GuardResult = boolean | UrlTree;

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private readonly usuarioService: UsuarioService, private readonly router: Router) {}

  canActivate(): GuardResult {
    return this.isAuthenticated();
  }

  canLoad(_route: Route, _segments: UrlSegment[]): GuardResult {
    return this.isAuthenticated();
  }

  private isAuthenticated(): GuardResult {
    const usuario = this.usuarioService.getCurrentUserValue?.() ?? this.usuarioService.carregar?.();
    const token = usuario?.token?.trim();

    if (token) {
      return true;
    }
    //isso foi oque o chat fez, depois que eu voltar com as configuraçoes de seguranaça
    //do backend eu tiro essa parte e deixo so a de cima

    if (usuario) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
