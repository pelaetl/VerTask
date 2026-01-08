import { Injectable } from '@angular/core';
import { Administrador } from '../model/administrador';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AdministradorService {

    private apiUrlAdministrador = 'http://localhost:8080/api/v1/administrador';
    //private apiUrlUsuario = 'http://localhost:8080/api/v1/usuario';
  
    constructor(private http: HttpClient) { }
  
    salvar(administrador: Administrador): Observable<Administrador> {
      if (administrador.idAdministrador === 0) {
        // Criar nova administrador (POST) 
        return this.http.post<Administrador>(this.apiUrlAdministrador, administrador);
      } else {
        // Atualizar administrador existente (PUT) 
        return this.http.put<Administrador>(`${this.apiUrlAdministrador}/${administrador.idAdministrador}`, administrador);
      }
    }
  
    listar(): Observable<Administrador[]> {
      return this.http.get<Administrador[]>(this.apiUrlAdministrador);
    }
  
    buscarPorId(id: number): Observable<Administrador> {
      return this.http.get<Administrador>(`${this.apiUrlAdministrador}/${id}`);
    }
  
    excluir(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrlAdministrador}/${id}`);
    }

}
