import {Usuario} from './usuario';
import { StatusTarefa } from '../enum/status-tarefa.enum';
export class Tarefa {

    idTarefa: number;
    nome: string;
    descricao: string;
    dataInicio: Date;
    dataEntrega: Date;
    statusTarefa: StatusTarefa;
    idAdministrador: number;
    favorita: boolean;
    // Se true, o administrador receberá notificações por e-mail sobre início/conclusão
    notifyAdmin: boolean;
    // Comentário/observação informada ao concluir a tarefa
    observacao?: string;

    usuarios: Usuario[];
    usuariosIds: number[]; // Array para armazenar IDs dos usuários associados
    clienteId?: number;
    
    // Metadados do documento (anexo)
    documentoNome?: string;
    documentoMime?: string;
    documentoTamanho?: number;
    documentoPath?: string;


    constructor() {
        this.idTarefa = 0;
        this.nome = '';
        this.descricao = '';
        this.dataInicio = new Date();
        this.dataEntrega = new Date();
        this.statusTarefa = StatusTarefa.Pendente;
        this.idAdministrador = 0;
        this.favorita = false;
        this.notifyAdmin = false;
        this.observacao = '';

    // inicializar metadados de documento
    this.documentoNome = '';
    this.documentoMime = '';
    this.documentoTamanho = 0;
    this.documentoPath = '';

         //apagar esse usuarios e descobrir a solução
        this.usuarios = [];
        this.usuariosIds = [];
    }

     // Método para resetar dataInicio para agora
    setDataInicioAgora() {
        this.dataInicio = new Date();
    }

    // Método para formatar data para input datetime-local
    getDataEntregaFormatada(): string {
        if (!this.dataEntrega) return '';
        const date = new Date(this.dataEntrega);
        // Formato: YYYY-MM-DDTHH:mm (datetime-local)
        return date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0') + 'T' + 
               String(date.getHours()).padStart(2, '0') + ':' + 
               String(date.getMinutes()).padStart(2, '0');
    }

    // Método para definir data de entrega a partir do input
    setDataEntregaFromInput(dateString: string) {
        if (dateString) {
            this.dataEntrega = new Date(dateString);
        }
    }
}
