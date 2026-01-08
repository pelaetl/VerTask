import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CpfService {
  // Service intentionally disabled — CPF integration was cancelled by the user.
  lookup(_: string) {
    throw new Error('CpfService disabled: CPF lookup integration has been removed.');
  }
}
