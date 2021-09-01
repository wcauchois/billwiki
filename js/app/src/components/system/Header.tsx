import classNames from "classnames";
import { ReactNode } from "react";

export interface HeaderProps {
  level: 1;
  children: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const classes = classNames(
    "text-3xl",
    "font-bold",
    "underline",
    "mb-2"
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
