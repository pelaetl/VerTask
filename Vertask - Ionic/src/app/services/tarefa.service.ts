import { Injectable } from '@angular/core';
import {Tarefa} from '../model/tarefa';
import { UsuarioService } from './usuario.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../model/usuario';


@Injectable({
  providedIn: 'root'
})
export class TarefaService {


   private apiUrl = 'http://localhost:8080/api/v1/tarefa';
   private apiUrl2 = 'http://localhost:8080/api/v1/tarefausuario';

  constructor(private http: HttpClient, private usuarioService: UsuarioService) {


   }

  salvar(tarefa: Tarefa): Observable<Tarefa> {
    if (tarefa.idTarefa === 0) {
      return this.http.post<Tarefa>(this.apiUrl, tarefa, this.getHttpOptions());
    } else {
      return this.http.put<Tarefa>(`${this.apiUrl}/${tarefa.idTarefa}`, tarefa, this.getHttpOptions());
    }
  }

  // Envia multipart/form-data com o campo 'tarefa' (JSON) e opcionalmente 'documento' (file)
  salvarComArquivo(formData: FormData): Observable<Tarefa> {
    // Quando enviamos FormData, não devemos fixar Content-Type; apenas enviar Authorization header
    return this.http.post<Tarefa>(this.apiUrl, formData, this.getHttpOptions());
  }

  iniciarTarefa(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${tarefa.idTarefa}/iniciar`, tarefa, this.getHttpOptions());
  }

  concluirTarefa(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${tarefa.idTarefa}/concluir`, tarefa, this.getHttpOptions());
  }

  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl, this.getHttpOptions());
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`, this.getHttpOptions());
  }

  // Método específico para atualizar status de favorito
  favoritar(idTarefa: number, favorita: boolean, idUsuario: number): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl2}/${idTarefa}/${idUsuario}/favorito`, { favorita }, this.getHttpOptions());
  }

  desFavoritar(idTarefa: number, idUsuario: number): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl2}/${idTarefa}/${idUsuario}/desfavorito`, { favorita: false }, this.getHttpOptions());
  }

  //metodo para ver se uma tarefa esta favoritada por um usuario
  isFavorita(idTarefa: number, idUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl2}/${idTarefa}/${idUsuario}/isfavorito`, this.getHttpOptions());
  }

  listarFavoritas(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl2}/${idUsuario}/favoritas`, this.getHttpOptions());
  }

  notificarUsuariosNovaTarefa(idTarefa: number, usuariosIds: number[]): Observable<void> {
    const body = { usuariosIds };
    return this.http.post<void>(`${this.apiUrl2}/${idTarefa}/novaTarefa`, body, this.getHttpOptions());
  }

  notificarAdministradorTarefaConcluida(idTarefa: number, idAdministrador: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${idTarefa}/${idAdministrador}/tarefaConcluida`, {}, this.getHttpOptions());
  }

  notificarAdministradorTarefaIniciada(idTarefa: number, idAdministrador: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${idTarefa}/${idAdministrador}/tarefaIniciada`, {}, this.getHttpOptions());
  }

  
  getAndamentos(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/${idUsuario}/count/em-andamento`, this.getHttpOptions());
  }

  getConcluidas(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/${idUsuario}/count/concluida`, this.getHttpOptions());
  }
  
  getAtrasadas(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/${idUsuario}/count/atrasada`, this.getHttpOptions());
  }

  /** Update task status (used by Kanban drag & drop). Backend should accept PATCH /api/v1/tarefa/{id}/status */
  updateStatus(id: number, status: string, observacao?: string): Observable<Tarefa> {
    const body: any = { status };
    if (observacao != null) {
      body.observacao = observacao;
    }
    return this.http.patch<Tarefa>(`${this.apiUrl}/${id}/status`, body, this.getHttpOptions());
  }

  getPendentes(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/${idUsuario}/count/pendente`, this.getHttpOptions());
  }


  
  getResponsaveis(idTarefa: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl2}/${idTarefa}/responsaveis`, this.getHttpOptions());
  }


    
    //fiz hoje depois SE NAO DER CERTO APAGA
  listarPorIdUsuario(idUsuario: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl2}/${idUsuario}/tarefas`, this.getHttpOptions());
  }


  
  novaTarefa(idTarefa: number): Observable<Tarefa> {
    return this.http.post<Tarefa>(`${this.apiUrl2}/${idTarefa}/novaTarefa`, {}, this.getHttpOptions());
  }

  // Retorna a URL pública para download/visualização do documento de uma tarefa
  getDocumentoUrl(idTarefa: number): string {
    return `${this.apiUrl}/${idTarefa}/documento`;
  }

  /**
   * Faz download do documento (blob) usando os headers de autenticação.
   * Retorna um Observable<Blob> para o componente montar um object URL.
   */
  downloadDocumento(idTarefa: number): Observable<Blob> {
    const url = this.getDocumentoUrl(idTarefa);
    const opts = this.getHttpOptions() as any || {};
    // Build options explicitly to help TypeScript pick the correct overload.
    // Ensure we request the response body as a blob and observe the body so the return type is Observable<Blob>.
    const options: any = { ...opts, responseType: 'blob', observe: 'body' };
    // Use a double-cast via unknown to satisfy TypeScript overloads reliably.
    return this.http.get(url, options) as unknown as Observable<Blob>;
  }

  //fiz hoje depois SE NAO DER CERTO APAGA
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

