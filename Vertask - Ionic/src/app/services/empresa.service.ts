import { Injectable } from '@angular/core';
import { Empresa } from '../model/empresa';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = 'http://localhost:8080/api/v1/empresa';

  constructor(private http: HttpClient, private usuarioService: UsuarioService) { }

  salvar(empresa: Empresa): Observable<Empresa> {
    if (!empresa.idEmpresa || empresa.idEmpresa === 0) {
      return this.http.post<Empresa>(this.apiUrl, empresa, this.getHttpOptions());
    } else {
      return this.http.put<Empresa>(`${this.apiUrl}/${empresa.idEmpresa}`, empresa, this.getHttpOptions());
    }
  }

  listar() {
    return this.http.get<Empresa[]>(this.apiUrl, this.getHttpOptions());
  }

  buscarPorId(id: number) {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  excluir(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions());
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
