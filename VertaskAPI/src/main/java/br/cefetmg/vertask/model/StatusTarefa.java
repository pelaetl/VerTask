package br.cefetmg.vertask.model;

public enum StatusTarefa {
    PENDENTE("Pendente"),
    EM_ANDAMENTO("Em Andamento"),
    CONCLUIDA("Concluída"),
    CONCLUIDA_ATRASADA("Concluída Atrasada"),
    ATRASADO("Atrasado");

    private final String value;

    StatusTarefa(String value) {
        this.value = value;
    }
    

    @Override
    public String toString() {
        return value;
    }
}