import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

const ROL_LABEL = { ADMIN: 'Administrador', TECNICO: 'Técnico', CLIENTE: 'Cliente' }

export default function Navbar() {
  const { usuario, logout, rol } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path) ? styles.active : ''

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logo}>HelpDesk</span>
      </div>

      <div className={styles.links}>
        <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard')}`}>
          Dashboard
        </Link>
        <Link to="/tickets" className={`${styles.link} ${isActive('/tickets')}`}>
          Tickets
        </Link>
        {(rol === 'CLIENTE' || rol === 'ADMIN') && (
          <Link to="/tickets/nuevo" className={`${styles.link} ${isActive('/tickets/nuevo')}`}>
            Nuevo Ticket
          </Link>
        )}
      </div>

      <div className={styles.userArea}>
        <span className={styles.userName}>{usuario?.nombre}</span>
        <span className={`${styles.rolBadge} ${styles[`rol${rol}`]}`}>
          {ROL_LABEL[rol] ?? rol}
        </span>
        <button onClick={logout} className={styles.logoutBtn}>
          Salir
        </button>
      </div>
    </nav>
  )
}
