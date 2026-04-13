import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { obtenerTicket, cambiarEstado, asignarTecnico } from '../../api/tickets'
import { listarComentarios, crearComentario } from '../../api/comentarios'
import { listarUsuarios } from '../../api/usuarios'
import { useAuth } from '../../context/AuthContext'
import BadgeEstado from '../../components/BadgeEstado'
import BadgePrioridad from '../../components/BadgePrioridad'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import styles from './TicketDetallePage.module.css'

const ESTADOS_VALIDOS = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO']

function formatFecha(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TicketDetallePage() {
  const { id } = useParams()
  const { rol } = useAuth()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cambiar estado
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [savingEstado, setSavingEstado] = useState(false)
  const [errorEstado, setErrorEstado] = useState('')

  // Asignar técnico
  const [tecnicoId, setTecnicoId] = useState('')
  const [savingTecnico, setSavingTecnico] = useState(false)
  const [errorTecnico, setErrorTecnico] = useState('')

  // Nuevo comentario
  const [mensaje, setMensaje] = useState('')
  const [savingComent, setSavingComent] = useState(false)
  const [errorComent, setErrorComent] = useState('')

  useEffect(() => {
    const promises = [
      obtenerTicket(id).then(({ data }) => {
        setTicket(data)
        setNuevoEstado(data.estado)
      }),
      listarComentarios(id).then(({ data }) => setComentarios(data)),
    ]
    if (rol === 'ADMIN' || rol === 'TECNICO') {
      promises.push(
        listarUsuarios().then(({ data }) =>
          setTecnicos(data.filter((u) => u.rol === 'TECNICO'))
        )
      )
    }
    Promise.all(promises)
      .catch(() => setError('No se pudo cargar el ticket'))
      .finally(() => setLoading(false))
  }, [id, rol])

  const handleCambiarEstado = async () => {
    setErrorEstado('')
    setSavingEstado(true)
    try {
      const { data } = await cambiarEstado(id, nuevoEstado)
      setTicket(data)
    } catch (err) {
      setErrorEstado(err.response?.data?.error ?? 'Error al cambiar estado')
    } finally {
      setSavingEstado(false)
    }
  }

  const handleAsignar = async () => {
    if (!tecnicoId) return
    setErrorTecnico('')
    setSavingTecnico(true)
    try {
      const { data } = await asignarTecnico(id, tecnicoId)
      setTicket(data)
    } catch (err) {
      setErrorTecnico(err.response?.data?.error ?? 'Error al asignar técnico')
    } finally {
      setSavingTecnico(false)
    }
  }

  const handleComentario = async (e) => {
    e.preventDefault()
    if (!mensaje.trim()) return
    setErrorComent('')
    setSavingComent(true)
    try {
      const { data } = await crearComentario(id, mensaje.trim())
      setComentarios((prev) => [...prev, data])
      setMensaje('')
    } catch (err) {
      setErrorComent(err.response?.data?.error ?? 'Error al enviar comentario')
    } finally {
      setSavingComent(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className={styles.page}><ErrorMessage mensaje={error} /></div>
  if (!ticket) return null

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/tickets')}>
        ← Volver a tickets
      </button>

      {/* Cabecera del ticket */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.ticketId}>Ticket #{ticket.id}</span>
          <div className={styles.badges}>
            <BadgeEstado estado={ticket.estado} />
            <BadgePrioridad prioridad={ticket.prioridad} />
          </div>
        </div>
        <h1 className={styles.titulo}>{ticket.titulo}</h1>
        <p className={styles.descripcion}>{ticket.descripcion}</p>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Cliente</span>
            <span>{ticket.cliente?.nombre ?? '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Técnico asignado</span>
            <span>{ticket.tecnico?.nombre ?? <em className={styles.sinAsignar}>Sin asignar</em>}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Creado</span>
            <span>{formatFecha(ticket.fechaCreacion)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Actualizado</span>
            <span>{formatFecha(ticket.fechaActualizacion)}</span>
          </div>
        </div>
      </div>

      {/* Cambiar estado — TECNICO y ADMIN */}
      {(rol === 'TECNICO' || rol === 'ADMIN') && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Cambiar Estado</h2>
          <div className={styles.actionRow}>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              {ESTADOS_VALIDOS.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              className={styles.btnPrimary}
              onClick={handleCambiarEstado}
              disabled={savingEstado || nuevoEstado === ticket.estado}
            >
              {savingEstado ? 'Guardando...' : 'Actualizar Estado'}
            </button>
          </div>
          <ErrorMessage mensaje={errorEstado} />
        </div>
      )}

      {/* Asignar técnico — solo ADMIN */}
      {rol === 'ADMIN' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Asignar Técnico</h2>
          <div className={styles.actionRow}>
            <select
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
            >
              <option value="">Seleccionar técnico...</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            <button
              className={styles.btnPrimary}
              onClick={handleAsignar}
              disabled={savingTecnico || !tecnicoId}
            >
              {savingTecnico ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
          <ErrorMessage mensaje={errorTecnico} />
        </div>
      )}

      {/* Comentarios */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          Comentarios ({comentarios.length})
        </h2>

        {comentarios.length === 0 ? (
          <p className={styles.noComentarios}>No hay comentarios aún.</p>
        ) : (
          <div className={styles.comentariosList}>
            {comentarios.map((c) => (
              <div key={c.id} className={styles.comentario}>
                <div className={styles.comentarioHeader}>
                  <span className={styles.comentarioAutor}>{c.autor?.nombre}</span>
                  <span className={styles.comentarioFecha}>{formatFecha(c.fecha)}</span>
                </div>
                <p className={styles.comentarioMensaje}>{c.mensaje}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComentario} className={styles.comentarioForm}>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            required
          />
          <ErrorMessage mensaje={errorComent} />
          <button type="submit" className={styles.btnPrimary} disabled={savingComent}>
            {savingComent ? 'Enviando...' : 'Agregar Comentario'}
          </button>
        </form>
      </div>
    </div>
  )
}
