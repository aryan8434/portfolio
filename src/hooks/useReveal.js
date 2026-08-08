import { useEffect } from "react";

/**
 * Adds `.is-visible` to every `.reveal` element once it scrolls into view.
 * Re-scans whenever `deps` change so freshly mounted cards animate too.
 */
const showAll = () =>
  document
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.add("is-visible"));

export function useReveal(deps = []) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    // Hidden-until-revealed styling only applies once JS is running, so a
    // scripting failure can never leave the page blank.
    document.documentElement.classList.add("reveal-ready");

    // Safety net: if the observer never fires (throttled tab, odd embed),
    // show everything rather than leaving content at opacity 0.
    const failsafe = setTimeout(showAll, 4000);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
    nodes.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
