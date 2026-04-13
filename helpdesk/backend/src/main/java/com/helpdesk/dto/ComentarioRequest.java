package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComentarioRequest {

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;

    // El autor siempre se determina desde el token JWT del usuario autenticado
    private Long autorId;
}
