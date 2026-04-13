import styles from './Badges.module.css'

const CONFIG = {
  BAJA:  { label: 'Baja',  cls: 'prioridadBaja' },
  MEDIA: { label: 'Media', cls: 'prioridadMedia' },
  ALTA:  { label: 'Alta',  cls: 'prioridadAlta' },
}

export default function BadgePrioridad({ prioridad }) {
  const cfg = CONFIG[prioridad] ?? { label: prioridad, cls: 'prioridadBaja' }
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      {cfg.label}
    </span>
  )
}
