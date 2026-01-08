package br.cefetmg.vertask.model;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CpfInfo {
    private String cpf;
    private String nome;
    // raw vendor response for fields not explicitly modeled
    private Map<String, Object> raw;
}
