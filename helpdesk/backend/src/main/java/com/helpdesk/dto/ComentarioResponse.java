package com.helpdesk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComentarioResponse {
    private Long id;
    private String mensaje;
    private LocalDateTime fecha;
    private UsuarioResponse autor;
}
