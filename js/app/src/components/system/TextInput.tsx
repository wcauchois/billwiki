import classNames from "classnames";
import React from "react";

interface TextInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  error?: boolean;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const {
    className: classNameFromProps,
    error,
    ...pushDownProps
  } = props;

  const classes = classNames(
    "border border-solid py-2 px-3 leading-tight w-full appearance-none focus:outline-none focus:shadow-outline rounded",
    { "border-red-400": error },
    classNameFromProps
  );
  return <input type="text" ref={ref} className={classes} {...pushDownProps} />;
});

export default TextInput;
