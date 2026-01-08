import { Usuario } from './usuario';

export class Funcionario extends Usuario {

    idFuncionario: number;
    idSetor: number;

    constructor() {
        super();
        this.idFuncionario = 0;
        this.idSetor = 0;
    }
}
