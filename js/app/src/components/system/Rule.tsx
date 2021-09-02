import classNames from "classnames";

export default function Rule() {
  const classes = classNames("border-b", "border-solid");

  return <div className={classes} />;
}
