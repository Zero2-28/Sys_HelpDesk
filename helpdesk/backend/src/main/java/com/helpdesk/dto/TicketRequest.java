package com.helpdesk.dto;

import com.helpdesk.enums.Prioridad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String descripcion;

    @NotNull(message = "La prioridad es obligatoria")
    private Prioridad prioridad;

    // Opcional cuando el usuario autenticado es CLIENTE (se usa su propio ID)
    // Requerido cuando ADMIN crea un ticket a nombre de otro usuario
    private Long clienteId;
}
