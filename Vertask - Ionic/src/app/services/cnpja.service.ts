import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CnpjaService {
  constructor(private http: HttpClient) {}

  lookup(cnpj: string) {
    const digits = (cnpj || '').replace(/\D/g, '');
    const url = `${environment.apiUrl}/api/v1/cnpja/${digits}`;
    return this.http.get(url);
  }
}
