import React, { useState, useEffect } from "react";

const Navbar = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Compute header height dynamically (handles responsive / different heights)
    const header = document.querySelector("header");
    const headerHeight = header ? header.offsetHeight : 0;

    // The app renders sections inside the root container (overflowY: 'auto'), so scroll that container
    const root = document.getElementById("root");
    const scrollContainer =
      (root && root.firstElementChild) ||
      document.scrollingElement ||
      document.documentElement;

    // Compute target top relative to the scroll container
    let targetTop = Math.max(0, el.offsetTop - headerHeight);

    // Add an extra 10% of the viewport height to ensure the section is fully visible
    const extra = Math.round(window.innerHeight * 0.1);
    targetTop += extra;

    // Cap to max scrollable position
    const maxTop =
      (scrollContainer &&
        scrollContainer.scrollHeight -
          (scrollContainer.clientHeight || window.innerHeight)) ||
      0;
    if (targetTop > maxTop) targetTop = maxTop;

    // Smoothly scroll the container
    if (scrollContainer && typeof scrollContainer.scrollTo === "function") {
      scrollContainer.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  };

  // Default UI to dark mode to ensure dark styling on first load
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        const dark = saved === "dark";
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
        // Notify other parts of the app about initial theme
        try {
          window.dispatchEvent(
            new CustomEvent("themeChange", { detail: { isDark: dark } }),
          );
        } catch (err) {}
      } else {
        // No saved preference: default to dark on first visit
        const dark = true;
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
        try {
          window.dispatchEvent(
            new CustomEvent("themeChange", { detail: { isDark: dark } }),
          );
        } catch (err) {}
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
      // Notify other parts of the app about theme change
      try {
        window.dispatchEvent(
          new CustomEvent("themeChange", { detail: { isDark: next } }),
        );
      } catch (err) {}
    } catch (e) {}
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1100,
        padding: "12px 20px",
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(12,12,12,0.6)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <nav>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "20px",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
        >
          <li
            style={{
              cursor: "pointer",
              fontFamily:
                "'moogalator-font','Baby Gemoy', 'Fredoka One', cursive",
            }}
            onClick={() => scrollTo("home")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollTo("home");
            }}
          >
            Home
          </li>
          <li
            style={{
              cursor: "pointer",
              fontFamily: "'Baby Gemoy', 'Fredoka One', cursive",
            }}
            onClick={() => scrollTo("about-page")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollTo("about-page");
            }}
          >
            About
          </li>
          <li
            style={{
              cursor: "pointer",
              fontFamily: "'Baby Gemoy', 'Fredoka One', cursive",
            }}
            onClick={() => scrollTo("projects")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollTo("projects");
            }}
          >
            My Projects
          </li>

          <li
            style={{
              cursor: "pointer",
              fontFamily: "'Baby Gemoy', 'Fredoka One', cursive",
            }}
            onClick={() => scrollTo("contact")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") scrollTo("contact");
            }}
          >
            Contact Me
          </li>
          <li>
            <button
              onClick={toggleTheme}
              aria-pressed={isDark}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              data-tooltip={isDark ? "Enable Light mode" : "Enable Dark mode"}
              className="theme-btn"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                color: "#fff",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
