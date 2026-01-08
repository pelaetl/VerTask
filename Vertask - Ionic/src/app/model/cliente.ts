export class Cliente {
	id?: number;
	tipo?: 'empresa' | 'pessoa';
	nome?: string;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	cpf?: string | null;
	cnpj?: string | null;
	endereco?: string | null;
	telefone?: string | null;
	email?: string | null;
	honorario?: number | null;
}

