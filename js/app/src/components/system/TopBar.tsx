import { ReactNode, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";
import TextInput from "./TextInput";

import homeSrc from "../../assets/images/home.svg";
import classNames from "classnames";

export interface TopBarProps {
  title: string;
  rightControls?: ReactNode;
  initialSearch?: string;
}

function HomeButton({ className }: { className?: string }) {
  const history = useHistory();
  const goHome = () => {
    history.push(`/wiki/Home`);
  };
  const classes = classNames(
    "inline-block rounded-full border-solid border-2 p-2 cursor-pointer border-gray-200 hover:border-gray-400",
    className
  );
  return (
    <div className={classes} onClick={goHome}>
      <img src={homeSrc} width="15" className="block" />
    </div>
  );
}

export default function TopBar({
  title,
  rightControls,
  initialSearch,
}: TopBarProps) {
  const history = useHistory();

  const [searchText, setSearchText] = useState(initialSearch ?? "");

  const onSearch = useCallback(
    (searchText: string) => {
      history.push(`/search?q=${encodeURIComponent(searchText)}`);
    },
    [history]
  );

  return (
    <div className="flex justify-between border-b-2 border-solid mb-4">
      <div className="flex items-center">
        <HomeButton className="mr-2" />
        <Header level={1}>{title}</Header>
      </div>
      <div className="flex">
        {rightControls}
        <div className="flex items-center w-60">
          <TextInput
            placeholder="Search"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(searchText);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
