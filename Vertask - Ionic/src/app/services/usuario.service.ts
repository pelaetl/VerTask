import { Injectable } from '@angular/core';
import { Usuario } from '../model/usuario';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface LoginResponse {
  token?: {
    token?: string;
    expiration?: string;
  };
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  //fiz hoje depois SE NAO DER CERTO APAGA
  carregar() {
    const usuarioJson = localStorage.getItem('usuarioAutenticado');
    if (usuarioJson) {
      return JSON.parse(usuarioJson) as Usuario;
    }
    return null;
  }

  private apiUrl = 'http://localhost:8080/api/v1/usuario';
  private authUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$: Observable<Usuario | null> = this.currentUserSubject.asObservable();
 //httpHeaders: { headers: HttpHeaders };

  //usuario: Usuario;
  constructor(private http: HttpClient) {

    // this.usuario = this.recuperarAutenticacao();

    // this.httpHeaders = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'Authorization': this.usuario?.token || ''
    //   })
    // };
    const usuarioPersistido = this.carregar();
    if (usuarioPersistido) {
      this.currentUserSubject.next(usuarioPersistido);
    }
  }

  autenticar(login: String, senha: String): Observable<Usuario> {
    const payload = { email: login, senha };
    return this.http.post<LoginResponse | Usuario>(`${this.apiUrl}/auth`, payload).pipe(
      map(resp => {
        const possivelResposta = resp as LoginResponse;
        const usuarioResposta: Usuario = (possivelResposta.usuario ?? (resp as Usuario)) ?? ({} as Usuario);
        const tokenValue = possivelResposta.token?.token ?? (usuarioResposta as any)?.token ?? '';

        return {
          ...usuarioResposta,
          token: tokenValue,
        } as Usuario;
      }),
      tap(user => this.setCurrentUser(user))
    );
  }

  salvar(usuario: Usuario): Observable<Usuario> {
    if (usuario.idUsuario === 0) {
      return this.http.post<Usuario>(this.apiUrl, usuario, this.getHttpOptions()).pipe(
        tap(user => this.setCurrentUser(user))
      );
    } else {
      return this.http.put<Usuario>(`${this.apiUrl}/${usuario.idUsuario}`, usuario, this.getHttpOptions()).pipe(
        tap(user => this.setCurrentUser(user))
      );
    }
  }

  uploadFoto(id: number, file: File): Observable<{ foto: string; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.buildAuthHeaders();
    const options: { headers?: HttpHeaders; responseType: 'json' } = {
      responseType: 'json' as const
    };

    if (headers) {
      options.headers = headers;
    }

    return this.http.post<{ foto: string; message?: string }>(`${this.apiUrl}/${id}/foto`, formData, options);
  }

  getFotoUrl(id: number): string {
    // adiciona timestamp para evitar cache de navegador após upload
    return `${this.apiUrl}/${id}/foto?ts=${Date.now()}`;
  }

  downloadFoto(id: number): Observable<Blob> {
    const headers = this.buildAuthHeaders();
    const options: { headers?: HttpHeaders; responseType: 'blob' } = {
      responseType: 'blob' as const
    };

    if (headers) {
      options.headers = headers;
    }

    // append timestamp query param to force fresh fetch and avoid cached image
    const url = `${this.apiUrl}/${id}/foto?ts=${Date.now()}`;
    return this.http.get(url, options) as Observable<Blob>;
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, this.getHttpOptions());
  }
  // método para setar manualmente (útil ao obter user por outro endpoint)
  setCurrentUser(user: Usuario | null) {
    if (user) {
      const tokenAtual = this.currentUserSubject.value?.token || this.carregar()?.token || '';
      const userComToken = tokenAtual && !user.token ? { ...user, token: tokenAtual } : user;
      localStorage.setItem('usuarioAutenticado', JSON.stringify(userComToken));
      this.currentUserSubject.next(userComToken);
    } else {
      localStorage.removeItem('usuarioAutenticado');
      this.currentUserSubject.next(null);
    }
  }

  // método para obter valor síncrono (opcional)
  getCurrentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  //localStorage
  registrar(usuario: Usuario) {
    this.setCurrentUser(usuario);
  }

  existeUsuarioComEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/existe?email=${email}`, this.getHttpOptions());
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  recuperarSenha(email: String): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/recuperar-senha`, { email });
  }

  enviarCodigo(email: String): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/enviar-codigo`, { email });
  }

  validarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validar-codigo`, { email, codigo });
  }

  resetPassword(email: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, novaSenha });
  }

  //localStorage
  encerrar() {
    this.setCurrentUser(null);
  }

  recuperarAutenticacao(): Usuario {
    let usuario = new Usuario();
    usuario = JSON.parse(localStorage.getItem('usuarioAutenticado') || "{}");
    return usuario;
  }

  private getHttpOptions() {
    const headers = this.buildAuthHeaders();
    return headers ? { headers } : {};
  }

  private buildAuthHeaders(): HttpHeaders | null {
    const usuario = this.carregar?.() ?? this.getCurrentUserValue?.();
    const rawToken = usuario?.token ?? '';

    if (!rawToken) {
      return null;
    }

    const headerValue = /^Bearer\s+/i.test(rawToken) ? rawToken : `Bearer ${rawToken}`;

    return new HttpHeaders({
      Authorization: headerValue
    });
  }

}

