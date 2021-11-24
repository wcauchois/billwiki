import classNames from "classnames";

export default function TextInput({
  className: classNameFromProps,
  ...pushDownProps
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  const classes = classNames(
    "border border-solid py-2 px-3 leading-tight w-full appearance-none focus:outline-none focus:shadow-outline rounded",
    classNameFromProps
  );
  return <input type="text" className={classes} {...pushDownProps} />;
}
