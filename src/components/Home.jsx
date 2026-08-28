import React, { useState, useEffect } from "react";
import "./Home.css";
import AIChat from "./AIChat";
import Modal from "./Modal";

const ROLES = [
  "full-stack applications",
  "AI-integrated products",
  "scalable REST APIs",
  "things people actually use",
];

const STATS = [
  { value: "13+", label: "Projects shipped" },
  { value: "1622", label: "LeetCode rating" },
  { value: "2", label: "Internships" },
  { value: "8.24", label: "CGPA" },
];

const MARQUEE = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Python",
  "FastAPI",
  "C++",
  "Firebase",
  "AWS",
  "Groq",
  "Gemini",
  "Redis",
  "Docker",
  "Tailwind",
];

const Home = ({ isDark = true }) => {
  const [stage, setStage] = useState(0); // 0 → 4, drives the staggered intro
  const [role, setRole] = useState(0);
  const [showResume, setShowResume] = useState(false);

  /* Staged intro — replays when the nav "Home" item is clicked */
  useEffect(() => {
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setStage(0);
      [220, 520, 820, 1120].forEach((ms, i) =>
        timers.push(setTimeout(() => setStage(i + 1), ms)),
      );
    };

    run();
    window.addEventListener("homeClicked", run);
    return () => {
      window.removeEventListener("homeClicked", run);
      timers.forEach(clearTimeout);
    };
  }, []);

  /* Rotating role line */
  useEffect(() => {
    const id = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2800);
    return () => clearInterval(id);
  }, []);

  const on = (n) => (stage >= n ? "hero__in is-in" : "hero__in");

  return (
    <div className="hero">
      <div className="hero__content">
        <div className={on(1)} style={{ "--d": "0ms" }}>
          <span className="hero__badge">
            <span className="hero__pulse" />
            Open to full-time & internship roles
          </span>
        </div>

        <h1 className="hero__title">
          <span className={on(2)} style={{ "--d": "0ms" }}>
            Hey, I&apos;m <span className="grad-text">Aryan</span>.
          </span>
          <span className={on(3)} style={{ "--d": "40ms" }}>
            I build{" "}
            <span className="hero__rotator">
              {ROLES.map((r, i) => (
                <span
                  key={r}
                  className={`hero__rotator-item ${i === role ? "is-active" : ""}`}
                  aria-hidden={i !== role}
                >
                  {r}
                </span>
              ))}
              <span className="hero__rotator-ghost">{ROLES[role]}</span>
            </span>
          </span>
        </h1>

        <p className={`hero__lede ${on(4)}`} style={{ "--d": "80ms" }}>
          AI benchmark author from India. I design the tasks that measure LLMs
          and frontier models — and I ship AI-integrated web apps, from a
          LeetCode analytics platform to a conversational commerce engine.
        </p>

        <div className={`hero__cta ${on(4)}`} style={{ "--d": "160ms" }}>
          <a
            className="btn btn-primary"
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View my work
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <button className="btn btn-ghost" onClick={() => setShowResume(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.4 12S6.2 5.4 12 5.4 21.6 12 21.6 12 17.8 18.6 12 18.6 2.4 12 2.4 12z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="2" />
            </svg>
            View Resume
          </button>
        </div>

        <div className={`hero__stats ${on(4)}`} style={{ "--d": "240ms" }}>
          {STATS.map((s) => (
            <div className="hero__stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`hero__marquee ${on(4)}`} style={{ "--d": "320ms" }}>
        <div className="hero__marquee-track">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={`${t}-${i}`}>{t}</span>
          ))}
        </div>
      </div>

      <a
        className="hero__scroll"
        href="#about"
        aria-label="Scroll to about"
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById("about")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="hero__scroll-track">
          <span className="hero__scroll-thumb" />
        </span>
        Scroll
      </a>

      <Modal
        open={showResume}
        onClose={() => setShowResume(false)}
        title="Aryan Kumar Raj — Résumé"
        subtitle="Full-stack &amp; AI engineer · Updated 2026"
        src="/resume.pdf"
        downloadName="Aryan-Kumar-Raj-Resume.pdf"
      />

      <AIChat isDark={isDark} />
    </div>
  );
};

export default Home;
