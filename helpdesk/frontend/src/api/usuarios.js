import api from './axios'

export const listarUsuarios = () =>
  api.get('/api/usuarios')

export const crearUsuario = (datos) =>
  api.post('/api/usuarios', datos)
