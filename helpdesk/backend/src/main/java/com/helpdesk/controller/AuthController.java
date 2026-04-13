package com.helpdesk.controller;

import com.helpdesk.dto.AuthRequest;
import com.helpdesk.dto.AuthResponse;
import com.helpdesk.dto.UsuarioRequest;
import com.helpdesk.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
