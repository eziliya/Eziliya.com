import React from "react";
import styles from '../buttons/CustomButton.module.css'
export default function CustomButton({text,style,handler=()=>{}}){
    return (
        <button className={`${styles.button} ${style}`} onClick={handler}>{text || 'Button'}</button>
    )
}