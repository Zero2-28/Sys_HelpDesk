import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ texto = 'Cargando...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.texto}>{texto}</p>
    </div>
  )
}
