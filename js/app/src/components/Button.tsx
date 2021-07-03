import { ReactNode } from "react";

import styles from "./Button.module.scss";

interface ButtonProps {
  children: ReactNode;
  onClick?(): void;
}

export default function Button({
  children,
  onClick
}: ButtonProps) {
  return (
    <div className={styles.main} onClick={() => {
      if (onClick) {
        onClick();
      }
    }}>
      {children}
    </div>
  )
}