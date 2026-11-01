"use client";
import { createContext, useContext, useEffect, useState } from "react";

type MobileMotion = { mobile: boolean; enabled: boolean; limited: boolean };
const Context = createContext<MobileMotion>({
  mobile: false,
  enabled: false,
  limited: false,
});
export function MobileMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<MobileMotion>({
    mobile: false,
    enabled: false,
    limited: false,
  });
  useEffect(() => {
    const mobile = matchMedia("(max-width:1023px)");
    const reduced = matchMedia("(prefers-reduced-motion:reduce)");
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: {
        saveData?: boolean;
        addEventListener?: (name: string, listener: () => void) => void;
        removeEventListener?: (name: string, listener: () => void) => void;
      };
    };
    const update = () => {
      const limited =
        reduced.matches ||
        Boolean(nav.connection?.saveData) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
        (navigator.hardwareConcurrency > 0 &&
          navigator.hardwareConcurrency <= 2);
      setState((previous) =>
        previous.mobile === mobile.matches && previous.limited === limited
          ? previous
          : {
              mobile: mobile.matches,
              enabled: mobile.matches && !limited,
              limited,
            },
      );
    };
    update();
    mobile.addEventListener("change", update);
    reduced.addEventListener("change", update);
    nav.connection?.addEventListener?.("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      nav.connection?.removeEventListener?.("change", update);
    };
  }, []);
  useEffect(() => {
    if (!state.mobile) return;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        window.dispatchEvent(new Event("resize")),
      );
    };
    refresh();
    const observer =
      state.enabled && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(refresh)
        : null;
    const shell = document.getElementById("site-content");
    if (shell) observer?.observe(shell);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [state.mobile, state.enabled]);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export const useMobileMotion = () => useContext(Context);
