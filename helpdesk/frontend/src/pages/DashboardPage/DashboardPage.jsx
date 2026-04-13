import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listarTickets } from '../../api/tickets'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import styles from './DashboardPage.module.css'

const ESTADOS = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO']
const ESTADO_LABEL = {
  ABIERTO:     'Abierto',
  EN_PROGRESO: 'En Progreso',
  RESUELTO:    'Resuelto',
  CERRADO:     'Cerrado',
}
const ESTADO_COLOR = {
  ABIERTO:     styles.cardAbierto,
  EN_PROGRESO: styles.cardEnProgreso,
  RESUELTO:    styles.cardResuelto,
  CERRADO:     styles.cardCerrado,
}

const BIENVENIDA = {
  ADMIN:   'Tienes acceso completo al sistema.',
  TECNICO: 'Puedes gestionar y resolver los tickets asignados.',
  CLIENTE: 'Aquí puedes ver el estado de tus solicitudes.',
}

export default function DashboardPage() {
  const { usuario, rol } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarTickets()
      .then(({ data }) => setTickets(data))
      .catch(() => setError('No se pudieron cargar los tickets'))
      .finally(() => setLoading(false))
  }, [])

  const conteo = ESTADOS.reduce((acc, estado) => {
    acc[estado] = tickets.filter((t) => t.estado === estado).length
    return acc
  }, {})

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.welcomeBox}>
        <h1 className={styles.welcome}>
          Bienvenido, <span>{usuario?.nombre}</span>
        </h1>
        <p className={styles.rolMsg}>{BIENVENIDA[rol]}</p>
      </div>

      <ErrorMessage mensaje={error} />

      <h2 className={styles.sectionTitle}>Resumen de Tickets</h2>
      <div className={styles.cards}>
        {ESTADOS.map((estado) => (
          <div key={estado} className={`${styles.card} ${ESTADO_COLOR[estado]}`}>
            <span className={styles.count}>{conteo[estado]}</span>
            <span className={styles.label}>{ESTADO_LABEL[estado]}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalBox}>
        <span>Total de tickets visibles:</span>
        <strong>{tickets.length}</strong>
      </div>
    </div>
  )
}
