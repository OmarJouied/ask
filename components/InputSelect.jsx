import { arrowSelect, clean } from '@/images'

import styles from '@/styles/InputSelect.module.css';
import Input from './Input';

let idx = 0;

const InputSelect = ({ name, options, placeholder, value, setValue }) => {

  const onClick = (e) => {
    const { target } = e;
    setValue((p) => ({ ...p, [name]: target.innerText}));
    target.blur();
  }

  const handleKeyPress = (e) => {
    try {
        if (e.keyCode === 40) {
            idx++;
            document.querySelector(`input[name=${name}] ~ ul li:nth-child(${idx})`).focus();
        }
    } catch (error) {
        idx--;
    }
    if (e.keyCode === 38 && idx > 1) {
        idx--;        
        document.querySelector(`input[name=${name}] ~ ul li:nth-child(${idx})`).focus();
    }
    if (e.keyCode === 13) onClick(e);
  }

  return (
    <Input name={name} placeholder={placeholder} value={value} setValue={setValue} className={styles.InputSelect}>
        <label htmlFor={name} style={{ cursor: "pointer" }}>
        {
            value && (
                <img src={clean.src} alt="clean input" style={{ width: 14 }} onClick={() => setValue((p) => ({...p, [name]: ""}))} />
            )
        }
            <img src={arrowSelect.src} alt="arrow" style={{ width: 16 }} />
        </label>
        <ul>
            <section>
            {
                options.map((option, idx) => option.toLowerCase().startsWith(value.toLowerCase()) && (
                        <li
                            key={option + idx}
                            tabIndex={0}
                            onClick={onClick}
                            onKeyDown={handleKeyPress}
                        >
                            {option}
                        </li>
                    )
                )
            }
            {
                (!options.find(option => option.toLowerCase().startsWith(value.toLowerCase())) && !!value) && (
                    <li style={{color: 'red', pointerEvents: "none"}}>* select a valid choise!</li>
                )
            }
            </section>
        </ul>
    </Input>
  )
}

export default InputSelect