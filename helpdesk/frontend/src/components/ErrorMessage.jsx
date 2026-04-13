import styles from './ErrorMessage.module.css'

export default function ErrorMessage({ mensaje }) {
  if (!mensaje) return null
  return (
    <div className={styles.error}>
      <span className={styles.icon}>!</span>
      <span>{mensaje}</span>
    </div>
  )
}
