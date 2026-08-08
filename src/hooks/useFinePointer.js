import { useEffect, useState } from "react";

/**
 * True only for devices driven by a real mouse or trackpad.
 *
 * Phones and tablets get neither the custom cursor (which pulls a large GIF
 * that can never be seen on a touch screen) nor the animated dot grid, which
 * runs a full-canvas animation loop on hardware that can least afford it.
 */
export const useFinePointer = () => {
  const [isFine, setIsFine] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const query = window.matchMedia("(pointer: fine) and (hover: hover)");
    const handler = (event) => setIsFine(event.matches);

    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isFine;
};
