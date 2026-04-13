package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.enums.EstadoTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByClienteId(Long clienteId);
    List<Ticket> findByTecnicoId(Long tecnicoId);
    List<Ticket> findByEstado(EstadoTicket estado);
}
