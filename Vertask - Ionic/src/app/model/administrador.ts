import { Usuario } from './usuario';
export class Administrador extends Usuario {
    idAdministrador: number;

    constructor() {
        super(); 
        this.idAdministrador = 0;
    }
}
