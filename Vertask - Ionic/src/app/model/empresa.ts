export class Empresa {
  idEmpresa: number = 0;
  nome: string = '';
  cnpj: string = '';
  fantasia: string = '';
  endereco: string = '';
  telefone: string = '';
  email: string = '';
  honorario: number = 0;

  constructor(init?: Partial<Empresa>) {
    Object.assign(this, init);
  }
}
