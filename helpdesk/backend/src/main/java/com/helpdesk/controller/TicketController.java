package com.helpdesk.controller;

import com.helpdesk.dto.TicketRequest;
import com.helpdesk.dto.TicketResponse;
import com.helpdesk.enums.EstadoTicket;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> crear(@Valid @RequestBody TicketRequest request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.crear(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listar(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.listar(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> obtener(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.obtener(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<TicketResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoTicket nuevoEstado) {
        return ResponseEntity.ok(ticketService.cambiarEstado(id, nuevoEstado));
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<TicketResponse> asignarTecnico(
            @PathVariable Long id,
            @RequestParam Long tecnicoId) {
        return ResponseEntity.ok(ticketService.asignarTecnico(id, tecnicoId));
    }
}
