import { Injectable } from '@angular/core';
import { Funcionario } from '../model/funcionario';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';
@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

    private apiUrlFuncionario = 'http://localhost:8080/api/v1/funcionario';
    //private apiUrlUsuario = 'http://localhost:8080/api/v1/usuario';
  
    constructor(private http: HttpClient, private usuarioService: UsuarioService) { }
  
    salvar(funcionario: Funcionario): Observable<Funcionario> {
      if (funcionario.idFuncionario === 0) {
        // Criar nova funcionario (POST) 
        return this.http.post<Funcionario>(this.apiUrlFuncionario, funcionario, this.getHttpOptions());
      } else {
        // Atualizar funcionario existente (PUT) 
        return this.http.put<Funcionario>(`${this.apiUrlFuncionario}/${funcionario.idFuncionario}`, funcionario, this.getHttpOptions());
      }
    }
  
    listar(): Observable<Funcionario[]> {
      return this.http.get<Funcionario[]>(this.apiUrlFuncionario, this.getHttpOptions());
    }
  
    buscarPorId(id: number): Observable<Funcionario> {
      return this.http.get<Funcionario>(`${this.apiUrlFuncionario}/${id}`, this.getHttpOptions());
    }
  
    excluir(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrlFuncionario}/${id}`, this.getHttpOptions());
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
