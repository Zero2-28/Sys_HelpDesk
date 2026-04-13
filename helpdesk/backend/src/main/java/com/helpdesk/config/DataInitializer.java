package com.helpdesk.config;

import com.helpdesk.entity.Comentario;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.Usuario;
import com.helpdesk.enums.EstadoTicket;
import com.helpdesk.enums.Prioridad;
import com.helpdesk.enums.Rol;
import com.helpdesk.repository.ComentarioRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final TicketRepository ticketRepository;
    private final ComentarioRepository comentarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            log.info("Base de datos ya contiene datos. Omitiendo inicialización.");
            return;
        }

        log.info("Insertando datos de prueba...");

        // --- Usuarios (passwords encriptados con BCrypt) ---
        Usuario admin = usuarioRepository.save(Usuario.builder()
                .nombre("Admin Principal")
                .email("admin@helpdesk.com")
                .password(passwordEncoder.encode("admin123"))
                .rol(Rol.ADMIN)
                .build());

        Usuario tecnico = usuarioRepository.save(Usuario.builder()
                .nombre("Carlos Técnico")
                .email("carlos@helpdesk.com")
                .password(passwordEncoder.encode("tecnico123"))
                .rol(Rol.TECNICO)
                .build());

        Usuario cliente = usuarioRepository.save(Usuario.builder()
                .nombre("María Cliente")
                .email("maria@empresa.com")
                .password(passwordEncoder.encode("cliente123"))
                .rol(Rol.CLIENTE)
                .build());

        log.info("Usuarios creados: admin={}, técnico={}, cliente={}", admin.getId(), tecnico.getId(), cliente.getId());

        // --- Tickets ---
        Ticket ticket1 = ticketRepository.save(Ticket.builder()
                .titulo("No puedo acceder al sistema de facturación")
                .descripcion("Al intentar ingresar al módulo de facturación aparece error 403. Necesito acceso urgente para emitir facturas del mes.")
                .estado(EstadoTicket.ABIERTO)
                .prioridad(Prioridad.ALTA)
                .cliente(cliente)
                .build());

        Ticket ticket2 = ticketRepository.save(Ticket.builder()
                .titulo("Impresora de red no responde")
                .descripcion("La impresora HP LaserJet del piso 3 dejó de responder desde ayer por la tarde. Otros equipos tampoco pueden imprimir.")
                .estado(EstadoTicket.EN_PROGRESO)
                .prioridad(Prioridad.MEDIA)
                .cliente(cliente)
                .tecnico(tecnico)
                .build());

        Ticket ticket3 = ticketRepository.save(Ticket.builder()
                .titulo("Solicitud de instalación de software")
                .descripcion("Necesito que instalen el software AutoCAD 2024 en mi equipo. El equipo tiene Windows 11 Pro y 16GB RAM.")
                .estado(EstadoTicket.RESUELTO)
                .prioridad(Prioridad.BAJA)
                .cliente(cliente)
                .tecnico(tecnico)
                .build());

        log.info("Tickets creados: {}, {}, {}", ticket1.getId(), ticket2.getId(), ticket3.getId());

        // --- Comentarios ---
        comentarioRepository.save(Comentario.builder()
                .mensaje("Buenos días, estamos revisando el problema de acceso. ¿Puede indicarme desde qué equipo intenta ingresar?")
                .ticket(ticket1)
                .autor(tecnico)
                .build());

        comentarioRepository.save(Comentario.builder()
                .mensaje("Intento desde mi PC de escritorio (equipo HD-045). El problema aparece desde esta mañana.")
                .ticket(ticket1)
                .autor(cliente)
                .build());

        comentarioRepository.save(Comentario.builder()
                .mensaje("Ya me encuentro revisando la impresora. Parece ser un problema de configuración IP. En breve lo soluciono.")
                .ticket(ticket2)
                .autor(tecnico)
                .build());

        comentarioRepository.save(Comentario.builder()
                .mensaje("El software AutoCAD 2024 fue instalado correctamente. Por favor verifique que todo funcione bien.")
                .ticket(ticket3)
                .autor(tecnico)
                .build());

        comentarioRepository.save(Comentario.builder()
                .mensaje("Perfecto, el software funciona correctamente. Muchas gracias por la rapidez.")
                .ticket(ticket3)
                .autor(cliente)
                .build());

        log.info("Datos de prueba insertados correctamente.");
        log.info("==============================================");
        log.info("  Admin:    admin@helpdesk.com  / admin123");
        log.info("  Técnico:  carlos@helpdesk.com / tecnico123");
        log.info("  Cliente:  maria@empresa.com   / cliente123");
        log.info("==============================================");
    }
}
