import React, { useState, useEffect, useCallback } from "react";
import "./Navbar.css";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Work" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  // index.html applies the saved theme before first paint, so the class on
  // <html> is already the source of truth by the time React mounts.
  const [isDark, setIsDark] = useState(
    () =>
      typeof document === "undefined" ||
      document.documentElement.classList.contains("dark"),
  );
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- theme ---------- */
  const applyTheme = useCallback((dark) => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
    try {
      window.dispatchEvent(
        new CustomEvent("themeChange", { detail: { isDark: dark } }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  /* ---------- active section + condensed nav on scroll ---------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      const line = window.innerHeight * 0.35;
      let current = LINKS[0].id;
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= line) current = link.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    if (id === "home") {
      try {
        window.dispatchEvent(new CustomEvent("homeClicked"));
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <button
          className="nav__brand"
          onClick={() => scrollTo("home")}
          aria-label="Back to top"
        >
          <span className="nav__mark">AR</span>
          <span className="nav__wordmark">
            Aryan<span className="nav__dot">.</span>
          </span>
        </button>

        <nav className="nav__rail" aria-label="Sections">
          {LINKS.map((link) => (
            <button
              key={link.id}
              className={`nav__link ${active === link.id ? "is-active" : ""}`}
              onClick={() => scrollTo(link.id)}
              aria-current={active === link.id ? "true" : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            onClick={toggleTheme}
            className="nav__theme"
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <span className="nav__theme-icon">{isDark ? "☾" : "☀"}</span>
          </button>

          <a
            className="btn btn-primary btn-sm nav__cta"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
          >
            Let's talk
          </a>

          <button
            className={`nav__burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav__sheet ${menuOpen ? "is-open" : ""}`}>
        {LINKS.map((link) => (
          <button
            key={link.id}
            className={`nav__sheet-link ${active === link.id ? "is-active" : ""}`}
            onClick={() => scrollTo(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
