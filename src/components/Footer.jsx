import React from "react";
import "./Footer.css";

const LINKS = [
  { label: "GitHub", href: "https://github.com/aryan8434" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/aryan-kumar-raj-988587b3/",
  },
  { label: "LeetCode", href: "https://leetcode.com/u/aryan8434/" },
  { label: "Email", href: "mailto:arkrraj@gmail.com" },
];

const Footer = () => (
  <footer className="footer">
    <div className="shell footer__inner">
      <div className="footer__brand">
        <span className="footer__mark">AR</span>
        <div>
          <strong>Aryan Kumar Raj</strong>
          <span>Full-stack &amp; AI engineer · Kota, India</span>
        </div>
      </div>

      <nav className="footer__links" aria-label="Elsewhere">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="footer__meta">
        <span>© {new Date().getFullYear()} Aryan Kumar Raj</span>
        <button
          className="footer__top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          Back to top
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M6 11l6-6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
