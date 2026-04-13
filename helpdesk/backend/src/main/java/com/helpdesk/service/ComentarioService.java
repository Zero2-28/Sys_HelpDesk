package com.helpdesk.service;

import com.helpdesk.dto.ComentarioRequest;
import com.helpdesk.dto.ComentarioResponse;
import com.helpdesk.entity.Comentario;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.Usuario;
import com.helpdesk.enums.Rol;
import com.helpdesk.repository.ComentarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final TicketService ticketService;
    private final UsuarioService usuarioService;

    @Transactional
    public ComentarioResponse crear(Long ticketId, ComentarioRequest request, String emailAutenticado) {
        Ticket ticket = ticketService.obtenerEntidad(ticketId);
        Usuario autor = usuarioService.obtenerPorEmail(emailAutenticado);
        if (autor.getRol() == Rol.CLIENTE && !ticket.getCliente().getId().equals(autor.getId())) {
            throw new IllegalArgumentException("No tienes acceso a este ticket");
        }
        Comentario comentario = Comentario.builder()
                .mensaje(request.getMensaje())
                .ticket(ticket)
                .autor(autor)
                .build();
        return toResponse(comentarioRepository.save(comentario));
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarPorTicket(Long ticketId, String emailAutenticado) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailAutenticado);
        if (usuario.getRol() == Rol.CLIENTE) {
            Ticket ticket = ticketService.obtenerEntidad(ticketId);
            if (!ticket.getCliente().getId().equals(usuario.getId())) {
                throw new IllegalArgumentException("No tienes acceso a este ticket");
            }
        }
        return comentarioRepository.findByTicketIdOrderByFechaAsc(ticketId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ComentarioResponse toResponse(Comentario c) {
        return ComentarioResponse.builder()
                .id(c.getId())
                .mensaje(c.getMensaje())
                .fecha(c.getFecha())
                .autor(usuarioService.toResponse(c.getAutor()))
                .build();
    }
}
