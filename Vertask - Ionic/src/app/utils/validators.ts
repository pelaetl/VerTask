import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador de CPF: retorna { invalidCpf: true } quando inválido, ou null quando válido
export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value || '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null; // vazio será tratado pelo Validators.required quando aplicável
  if (digits.length !== 11) return { invalidCpf: true };

  // rejeita CPFs com todos dígitos iguais (ex: 00000000000, 11111111111, ...)
  if (/^(\d)\1{10}$/.test(digits)) return { invalidCpf: true };

  // cálculo do primeiro dígito verificador
  const calcDig = (cpf: string, factorStart: number) => {
    let total = 0;
    for (let i = 0; i < factorStart - 1; i++) {
      total += parseInt(cpf.charAt(i), 10) * (factorStart - i);
    }
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const first = calcDig(digits, 10);
  const second = calcDig(digits, 11);
  const dv1 = parseInt(digits.charAt(9), 10);
  const dv2 = parseInt(digits.charAt(10), 10);

  if (first !== dv1 || second !== dv2) return { invalidCpf: true };

  return null;
}

// CNPJ validation helper
export function isValidCnpj(value: string): boolean {
  if (!value) return false;
  const cnpj = String(value).replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (cnpjStr: string, pos: number) => {
    let sum = 0;
    let weight = pos - 7;
    for (let i = 0; i < pos - 1; i++) {
      sum += parseInt(cnpjStr.charAt(i), 10) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  // calc expects the 'pos' parameter to be the length of the base portion
  // for the first verifier use 12 (first 12 digits), for the second use 13 (first 13 digits)
  const dv1 = calc(cnpj, 12);
  const dv2 = calc(cnpj, 13);
  return dv1 === parseInt(cnpj.charAt(12), 10) && dv2 === parseInt(cnpj.charAt(13), 10);
}

export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value || '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null; // empty handled by required
  return isValidCnpj(digits) ? null : { invalidCnpj: true };
}
