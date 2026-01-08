import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Feriado {
  date: string;
  name: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeriadoService {
  private feriadosCache: Map<number, Feriado[]> = new Map();

  constructor(private http: HttpClient) {}

  buscarFeriados(ano: number): Observable<Feriado[]> {
    // Verifica se já temos os feriados deste ano no cache
    if (this.feriadosCache.has(ano)) {
      return of(this.feriadosCache.get(ano)!);
    }

    return this.http.get<Feriado[]>(`https://brasilapi.com.br/api/feriados/v1/${ano}`).pipe(
      map(feriados => {
        // Armazena no cache
        this.feriadosCache.set(ano, feriados);
        return feriados;
      }),
      catchError(error => {
        console.error('Erro ao buscar feriados:', error);
        return of([]);
      })
    );
  }

  isFeriado(data: Date, feriados: Feriado[]): boolean {
    const dataStr = data.toISOString().split('T')[0];
    return feriados.some(f => f.date === dataStr);
  }

  getFeriadoNome(data: Date, feriados: Feriado[]): string | null {
    const dataStr = data.toISOString().split('T')[0];
    const feriado = feriados.find(f => f.date === dataStr);
    return feriado ? feriado.name : null;
  }
}
