import styles from './Badges.module.css'

const CONFIG = {
  ABIERTO:     { label: 'Abierto',      cls: 'estadoAbierto' },
  EN_PROGRESO: { label: 'En Progreso',  cls: 'estadoEnProgreso' },
  RESUELTO:    { label: 'Resuelto',     cls: 'estadoResuelto' },
  CERRADO:     { label: 'Cerrado',      cls: 'estadoCerrado' },
}

export default function BadgeEstado({ estado }) {
  const cfg = CONFIG[estado] ?? { label: estado, cls: 'estadoCerrado' }
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      {cfg.label}
    </span>
  )
}
