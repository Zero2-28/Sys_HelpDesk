import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarTickets } from '../../api/tickets'
import { useAuth } from '../../context/AuthContext'
import BadgeEstado from '../../components/BadgeEstado'
import BadgePrioridad from '../../components/BadgePrioridad'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import styles from './TicketsPage.module.css'

const ESTADOS   = ['', 'ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO']
const PRIORIDADES = ['', 'BAJA', 'MEDIA', 'ALTA']

function formatFecha(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function TicketsPage() {
  const { rol } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')

  useEffect(() => {
    listarTickets()
      .then(({ data }) => setTickets(data))
      .catch(() => setError('No se pudieron cargar los tickets'))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = tickets.filter((t) => {
    if (filtroEstado && t.estado !== filtroEstado) return false
    if (filtroPrioridad && t.prioridad !== filtroPrioridad) return false
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Tickets</h1>
        {(rol === 'CLIENTE' || rol === 'ADMIN') && (
          <button className={styles.btnNuevo} onClick={() => navigate('/tickets/nuevo')}>
            + Nuevo Ticket
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.slice(1).map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.slice(1).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className={styles.countLabel}>{filtrados.length} ticket(s)</span>
      </div>

      <ErrorMessage mensaje={error} />

      {filtrados.length === 0 && !error ? (
        <p className={styles.empty}>No hay tickets que coincidan con el filtro.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Cliente</th>
                <th>Técnico</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((t) => (
                <tr
                  key={t.id}
                  className={styles.row}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                  <td className={styles.tdId}>{t.id}</td>
                  <td className={styles.tdTitulo}>{t.titulo}</td>
                  <td><BadgeEstado estado={t.estado} /></td>
                  <td><BadgePrioridad prioridad={t.prioridad} /></td>
                  <td>{t.cliente?.nombre ?? '—'}</td>
                  <td>{t.tecnico?.nombre ?? <span className={styles.sinAsignar}>Sin asignar</span>}</td>
                  <td className={styles.tdFecha}>{formatFecha(t.fechaCreacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
