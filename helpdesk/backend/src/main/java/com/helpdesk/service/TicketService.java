package com.helpdesk.service;

import com.helpdesk.dto.TicketRequest;
import com.helpdesk.dto.TicketResponse;
import com.helpdesk.dto.UsuarioResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.Usuario;
import com.helpdesk.enums.EstadoTicket;
import com.helpdesk.enums.Rol;
import com.helpdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UsuarioService usuarioService;

    @Transactional
    public TicketResponse crear(TicketRequest request, String emailAutenticado) {
        Usuario usuarioAutenticado = usuarioService.obtenerPorEmail(emailAutenticado);
        Usuario cliente;
        if (usuarioAutenticado.getRol() == Rol.CLIENTE) {
            cliente = usuarioAutenticado;
        } else {
            if (request.getClienteId() == null) {
                throw new IllegalArgumentException("Se requiere clienteId para crear el ticket");
            }
            cliente = usuarioService.obtenerEntidad(request.getClienteId());
        }
        Ticket ticket = Ticket.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .prioridad(request.getPrioridad())
                .estado(EstadoTicket.ABIERTO)
                .cliente(cliente)
                .build();
        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> listar(String emailAutenticado) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailAutenticado);
        List<Ticket> tickets = usuario.getRol() == Rol.CLIENTE
                ? ticketRepository.findByClienteId(usuario.getId())
                : ticketRepository.findAll();
        return tickets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse obtener(Long id, String emailAutenticado) {
        Ticket ticket = obtenerEntidad(id);
        Usuario usuario = usuarioService.obtenerPorEmail(emailAutenticado);
        if (usuario.getRol() == Rol.CLIENTE && !ticket.getCliente().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes acceso a este ticket");
        }
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse cambiarEstado(Long id, EstadoTicket nuevoEstado) {
        Ticket ticket = obtenerEntidad(id);
        ticket.setEstado(nuevoEstado);
        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse asignarTecnico(Long ticketId, Long tecnicoId) {
        Ticket ticket = obtenerEntidad(ticketId);
        Usuario tecnico = usuarioService.obtenerEntidad(tecnicoId);
        ticket.setTecnico(tecnico);
        if (ticket.getEstado() == EstadoTicket.ABIERTO) {
            ticket.setEstado(EstadoTicket.EN_PROGRESO);
        }
        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public Ticket obtenerEntidad(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public TicketResponse toResponse(Ticket t) {
        UsuarioResponse tecnicoResponse = t.getTecnico() != null
                ? usuarioService.toResponse(t.getTecnico())
                : null;
        return TicketResponse.builder()
                .id(t.getId())
                .titulo(t.getTitulo())
                .descripcion(t.getDescripcion())
                .estado(t.getEstado())
                .prioridad(t.getPrioridad())
                .fechaCreacion(t.getFechaCreacion())
                .fechaActualizacion(t.getFechaActualizacion())
                .cliente(usuarioService.toResponse(t.getCliente()))
                .tecnico(tecnicoResponse)
                .build();
    }
}
