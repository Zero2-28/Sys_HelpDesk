import api from './axios'

export const listarTickets = () =>
  api.get('/api/tickets')

export const obtenerTicket = (id) =>
  api.get(`/api/tickets/${id}`)

export const crearTicket = (datos) =>
  api.post('/api/tickets', datos)

export const cambiarEstado = (id, nuevoEstado) =>
  api.put(`/api/tickets/${id}/estado?nuevoEstado=${nuevoEstado}`)

export const asignarTecnico = (id, tecnicoId) =>
  api.put(`/api/tickets/${id}/asignar?tecnicoId=${tecnicoId}`)
