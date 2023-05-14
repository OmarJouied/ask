import styles from '@/styles/Input.module.css';

const Input = ({ children, name, placeholder, value, setValue, className, ...props }) => {
  return (
    <div className={styles.Input + ' ' + className} {...(children?.length ? {title: value} : {})}>
        <input
            type="text"
            name={name}
            id={name}
            placeholder={placeholder}
            aria-placeholder={placeholder}
            value={value}
            onChange={({ target: { value } }) => setValue((p) => ({ ...p, [name]: value}))}
            {...props}
        />
        { children }
    </div>
  )
}

export default Input