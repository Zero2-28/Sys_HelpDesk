import api from './axios'

export const listarComentarios = (ticketId) =>
  api.get(`/api/tickets/${ticketId}/comentarios`)

export const crearComentario = (ticketId, mensaje) =>
  api.post(`/api/tickets/${ticketId}/comentarios`, { mensaje })
