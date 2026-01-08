import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ClienteDto {
  id?: number;
  tipo: 'empresa' | 'pessoa';
  nome: string;
  nomeFantasia?: string | null;
  razaoSocial?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  email?: string | null;
  honorario?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl}/api/v1/clientes`;
  constructor(private http: HttpClient) {}

  create(cliente: ClienteDto) {
    return this.http.post<ClienteDto>(this.base, cliente);
  }

  list() {
    return this.http.get<ClienteDto[]>(this.base);
  }

  get(id: number) {
    return this.http.get<ClienteDto>(`${this.base}/${id}`);
  }

  update(id: number, cliente: ClienteDto) {
    return this.http.put<ClienteDto>(`${this.base}/${id}`, cliente);
  }
}

