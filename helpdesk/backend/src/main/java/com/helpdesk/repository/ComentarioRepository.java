package com.helpdesk.repository;

import com.helpdesk.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByTicketIdOrderByFechaAsc(Long ticketId);
}
