import Mousetrap from "mousetrap";
import { useEffect } from "react";

export function useMousetrap(key: string, callback: (() => void) | (() => boolean)) {
  useEffect(() => {
    Mousetrap.bind(key, callback);
    return () => {
      Mousetrap.unbind(key);
    };
  }, [key, callback]);
}
