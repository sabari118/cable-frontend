import { ReactNode } from "react";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.container}>
               <div className={styles.formBox}>{children}</div>
        </div>
    )
}