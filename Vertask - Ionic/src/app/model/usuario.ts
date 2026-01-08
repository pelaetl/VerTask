//colocar abstract para que não seja possível instanciar a classe Usuario
export class Usuario {
     idUsuario: number;
     nome: string;
     email: string;
     senha: string;
     role: string; // para compatibilidade com backend que usa 'role' em vez de 'tipo'
     token: string; // token de autenticação, se aplicável
     foto: string;

    constructor() {
        this.idUsuario = 0;
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.role = '';
        this.token = '';
        this.foto = '';
    }
}
