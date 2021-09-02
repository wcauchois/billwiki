import Mousetrap from "mousetrap";
import { useEffect } from "react";

export function useMoustrap(key: string, callback: () => void) {
  useEffect(() => {
    Mousetrap.bind(key, callback);
    return () => {
      Mousetrap.unbind(key);
    };
  }, [key, callback]);
}
