import classNames from "classnames";
import { ReactNode } from "react";

export interface HeaderProps {
  level: 1 | 2 | 3 | 4;
  children: ReactNode;
}

export default function Header({ children, level }: HeaderProps) {
  const levelToClass = ["text-3xl", "text-2xl", "text-xl"];
  const classes = classNames(levelToClass[level - 1], "font-bold", "mb-2");

  return <div className={classes}>{children}</div>;
}
