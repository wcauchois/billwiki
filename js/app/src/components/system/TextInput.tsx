import classNames from "classnames";

interface TextInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  error?: boolean;
}

export default function TextInput({
  className: classNameFromProps,
  error,
  ...pushDownProps
}: TextInputProps) {
  const classes = classNames(
    "border border-solid py-2 px-3 leading-tight w-full appearance-none focus:outline-none focus:shadow-outline rounded",
    { "border-red-400": error },
    classNameFromProps
  );
  return <input type="text" className={classes} {...pushDownProps} />;
}
