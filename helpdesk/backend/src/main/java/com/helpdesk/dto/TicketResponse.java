package com.helpdesk.dto;

import com.helpdesk.enums.EstadoTicket;
import com.helpdesk.enums.Prioridad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private EstadoTicket estado;
    private Prioridad prioridad;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private UsuarioResponse cliente;
    private UsuarioResponse tecnico;
}
