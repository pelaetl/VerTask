import { Injectable } from '@angular/core';
import { Setor } from '../model/setor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class SetorService {

  private apiUrl = 'http://localhost:8080/api/v1/setor';

  constructor(private http: HttpClient, private usuarioService: UsuarioService) { }

  salvar(setor: Setor): Observable<Setor> {
    if (setor.idSetor === 0) {
      // Criar nova setor (POST) 
      return this.http.post<Setor>(this.apiUrl, setor, this.getHttpOptions());
    } else {
      // Atualizar setor existente (PUT) 
      return this.http.put<Setor>(`${this.apiUrl}/${setor.idSetor}`, setor, this.getHttpOptions());
    }
  }

  listar(): Observable<Setor[]> {
    return this.http.get<Setor[]>(this.apiUrl, this.getHttpOptions());
  }

  buscarPorId(id: number): Observable<Setor> {
    return this.http.get<Setor>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  existeSetorComNome(nome: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/existe?nome=${nome}`, this.getHttpOptions());
  }

  private getHttpOptions() {
    const usuario = this.usuarioService.carregar?.() ?? this.usuarioService.getCurrentUserValue?.();
    const rawToken = usuario?.token ?? '';

    if (!rawToken) {
      return {};
    }

    const headerValue = /^Bearer\s+/i.test(rawToken) ? rawToken : `Bearer ${rawToken}`;

    return {
      headers: new HttpHeaders({
        Authorization: headerValue
      })
    };
  }
}

