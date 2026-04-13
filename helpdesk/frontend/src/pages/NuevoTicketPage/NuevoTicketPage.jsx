import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearTicket } from '../../api/tickets'
import ErrorMessage from '../../components/ErrorMessage'
import styles from './NuevoTicketPage.module.css'

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA']

export default function NuevoTicketPage() {
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState('MEDIA')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await crearTicket({ titulo, descripcion, prioridad })
      navigate('/tickets')
    } catch (err) {
      const msg = err.response?.data?.error
        ?? err.response?.data?.errores?.[0]
        ?? 'Error al crear el ticket'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nuevo Ticket</h1>
        <p className={styles.sub}>Describe el problema para que el equipo de soporte pueda ayudarte.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="titulo">Título <span className={styles.req}>*</span></label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Mi impresora no imprime"
              required
              maxLength={120}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible..."
              rows={5}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="prioridad">Prioridad <span className={styles.req}>*</span></label>
            <select
              id="prioridad"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <ErrorMessage mensaje={error} />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate('/tickets')}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
