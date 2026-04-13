package com.helpdesk.controller;

import com.helpdesk.dto.ComentarioRequest;
import com.helpdesk.dto.ComentarioResponse;
import com.helpdesk.service.ComentarioService;
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
public class ComentarioController {

    private final ComentarioService comentarioService;

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> crear(
            @PathVariable Long id,
            @Valid @RequestBody ComentarioRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comentarioService.crear(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/comentarios")
    public ResponseEntity<List<ComentarioResponse>> listar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(comentarioService.listarPorTicket(id, userDetails.getUsername()));
    }
}
