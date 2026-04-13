package com.helpdesk.service;

import com.helpdesk.dto.AuthRequest;
import com.helpdesk.dto.AuthResponse;
import com.helpdesk.dto.UsuarioRequest;
import com.helpdesk.entity.Usuario;
import com.helpdesk.repository.UsuarioRepository;
import com.helpdesk.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + request.getEmail());
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .build();
        usuario = usuarioRepository.save(usuario);
        String token = jwtUtil.generarToken(usuario);
        return AuthResponse.builder()
                .token(token)
                .usuario(usuarioService.toResponse(usuario))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        String token = jwtUtil.generarToken(usuario);
        return AuthResponse.builder()
                .token(token)
                .usuario(usuarioService.toResponse(usuario))
                .build();
    }
}
