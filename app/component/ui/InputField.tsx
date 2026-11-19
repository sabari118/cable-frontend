import { ChangeEvent } from "react";
import styles from "./InputField.module.css";
type InputFieldProp = {
    type:string;
    placeholder:string;
    value:string;
    onChange:(e:ChangeEvent<HTMLInputElement>)=> void;
}

export default function  InputField({type,placeholder,value,onChange}:InputFieldProp){
    return(
        <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        />
    )
}