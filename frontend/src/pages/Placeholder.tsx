import styles from './Placeholder.module.css';

interface PlaceholderProps { title: string; icon: string; }

export default function Placeholder({ title, icon }: PlaceholderProps) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>This section is under construction.</p>
      </div>
    </div>
  );
}
