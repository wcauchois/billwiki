import classnames from "classnames";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?(): void;
  primary?: boolean;
}

export default function Button({
  children,
  onClick,
  primary
}: ButtonProps) {
  const buttonStyle = primary ? "primary" : "secondary";
  const buttonStyles = {
    primary: classnames(
      "bg-blue-600",
      "border-blue-800",
      "hover:bg-blue-500",
      "active:bg-blue-600",
    ),
    secondary: classnames(
      "bg-gray-600",
      "border-gray-800",
      "hover:bg-gray-500",
      "active:bg-gray-600",
    )
  };

  const classes = classnames(
    "border-solid",
    "border",
    "cursor-pointer",
    "inline-block",
    "px-5",
    "py-1.5",
    "rounded",
    "select-none",
    "shadow",
    "text-white",
    "transition-colors",
    buttonStyles[buttonStyle]
  );

  return (
    <div className={classes} onClick={() => {
      if (onClick) {
        onClick();
      }
    }}>
      {children}
    </div>
  )
}
