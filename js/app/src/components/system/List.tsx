import classNames from "classnames";
import { ReactNode } from "react";

export default function List({
  items,
  fluid,
  horizontal
}: {
  items: ReactNode | ReactNode[],
  fluid?: boolean;
  horizontal?: boolean;
}) {
  const classes = classNames(
    fluid ? "grid" : "inline-grid",
    "gap-2",
    ...(horizontal ? [
      "grid-rows-1",
      "grid-flow-col",
    ] : [
      "grid-cols-1",
    ])
  );
  return (
    <div className={classes}>
      {items}
    </div>
  );
}
