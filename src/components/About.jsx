import React, { useState } from "react";
import "./About.css";
import Modal from "./Modal";
import { useReveal } from "../hooks/useReveal";

/**
 * Brand colours, used as a dot beside each chip. Anything without an official
 * colour (or whose brand is plain black, which reads as a hole in dark mode)
 * falls back to a neutral that stays legible in both themes.
 */
const TECH_COLORS = {
  "C++": "#00599C",
  C: "#A8B9CC",
  JavaScript: "#F7DF1E",
  TypeScript: "#3178C6",
  Python: "#3776AB",

  React: "#61DAFB",
  "Next.js": "#9CA3AF",
  Tailwind: "#06B6D4",
  GSAP: "#88CE02",
  "Three.js": "#9CA3AF",

  "Node.js": "#339933",
  Express: "#9CA3AF",
  FastAPI: "#009688",
  REST: "#8B5CF6",
  GraphQL: "#E10098",
  JWT: "#FB015B",

  MongoDB: "#47A248",
  PostgreSQL: "#4169E1",
  Redis: "#DC382D",
  Firebase: "#FFCA28",
  AWS: "#FF9900",
  Docker: "#2496ED",

  "Groq / LLaMA": "#F55036",
  Gemini: "#4285F4",
  RAG: "#22D3EE",
  Embeddings: "#A78BFA",
  "Prompt Design": "#D946EF",

  DSA: "#F59E0B",
  "System Design": "#38BDF8",
  OOP: "#FB7185",
  DBMS: "#34D399",
  "Operating Systems": "#94A3B8",
};

const SKILLS = [
  {
    title: "Languages",
    icon: "◆",
    items: ["C++", "JavaScript", "Python", "TypeScript", "C"],
  },
  {
    title: "Frontend",
    icon: "◈",
    items: ["React", "Next.js", "Tailwind", "GSAP", "Three.js"],
  },
  {
    title: "Backend",
    icon: "▣",
    items: ["Node.js", "Express", "FastAPI", "REST", "GraphQL", "JWT"],
  },
  {
    title: "Data & Cloud",
    icon: "◉",
    items: ["MongoDB", "PostgreSQL", "Redis", "Firebase", "AWS", "Docker"],
  },
  {
    title: "AI Engineering",
    icon: "✦",
    items: ["Groq / LLaMA", "Gemini", "RAG", "Embeddings", "Prompt Design"],
  },
  {
    title: "Foundations",
    icon: "▲",
    items: ["DSA", "System Design", "OOP", "DBMS", "Operating Systems"],
  },
];

const About = () => {
  const [showResume, setShowResume] = useState(false);
  useReveal([]);

  return (
    <div className="about">
      <header className="section-head reveal">
        <span className="eyebrow">About me</span>
        <h2 className="section-title">
          Backend depth, <span className="grad-text">product instinct</span>
        </h2>
      </header>

      {/* ---------- intro ---------- */}
      <div className="about__intro">
        <aside className="about__portrait reveal">
          <div className="about__portrait-frame">
            <img
              src="/avatar.png"
              alt="Aryan Kumar Raj"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="about__badges">
            <a
              className="about__badge"
              href="https://leetcode.com/u/aryan8434/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>1622</strong>
              <span>LeetCode</span>
            </a>
            <a
              className="about__badge"
              href="https://www.geeksforgeeks.org/profile/aryan8434"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>4★</strong>
              <span>GeeksForGeeks</span>
            </a>
          </div>
        </aside>

        <div className="about__text reveal" style={{ "--reveal-delay": "90ms" }}>
          <p className="about__lead">
            I&apos;m an AI benchmark author based in India. I design the tasks
            that measure LLMs and frontier models — real engineering problems,
            each one shipped with a reference solution and an automatic checker
            that grades the model on what it actually did.
          </p>
          <p>
            My work sits at the intersection of full-stack engineering and
            applied AI. I&apos;ve shipped a LeetCode analytics platform that
            generates hiring-readiness reports, an e-commerce flow driven
            entirely by natural language, and a RAG service that answers
            questions grounded in your own documents. Each one started as a
            backend problem before it became an interface.
          </p>
          <p>
            Outside of building, I practise algorithms daily on LeetCode and
            GeeksForGeeks — it keeps the fundamentals sharp and it shows up in
            the code I write.
          </p>

          <div className="about__plain">
            <span className="about__plain-tag">In simple words</span>
            <p>
              I build the part you see with <strong>React.js</strong>, and the
              part you don&apos;t see with <strong>Node.js</strong> and{" "}
              <strong>Express.js</strong>. The two talk to each other through{" "}
              <strong>REST APIs</strong> and <strong>GraphQL</strong>. The
              information is saved in <strong>MongoDB</strong>,{" "}
              <strong>Firestore</strong> or <strong>SQL</strong>. I put the
              finished app on an <strong>AWS EC2</strong> server and keep{" "}
              <strong>Nginx</strong> in front of it, so every request goes to
              the right place. Logging in is handled with{" "}
              <strong>JWT</strong> and <strong>Google OAuth</strong>, and the
              site is locked with a free <strong>Let&apos;s Encrypt SSL</strong>{" "}
              certificate. I keep my code on <strong>Git</strong> and{" "}
              <strong>GitHub</strong>, let <strong>CI/CD</strong> test and ship
              it on its own, check the APIs with <strong>Postman</strong>, use{" "}
              <strong>Docker</strong> so it runs the same on every computer, and
              add AI answers inside the app using the{" "}
              <strong>Groq SDK</strong>.
            </p>
          </div>

          <div className="about__actions">
            <button className="btn btn-primary" onClick={() => setShowResume(true)}>
              View résumé
            </button>
            <a
              className="btn btn-ghost"
              href="https://github.com/aryan8434"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className="btn btn-brand btn-linkedin"
              href="https://www.linkedin.com/in/aryan-kumar-raj-988587b3/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm6.5 0h3.8v1.65h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.65c0-1.35-.03-3.08-1.9-3.08-1.9 0-2.2 1.46-2.2 2.98V21h-4V9z" />
              </svg>
              LinkedIn
            </a>
            <a
              className="btn btn-brand btn-leetcode"
              href="https://leetcode.com/u/aryan8434/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.6 3.2l-2.1 2.2M9.4 8.6L5.6 12.5a3.4 3.4 0 000 4.8l2.9 2.9a3.4 3.4 0 004.8 0l2.1-2.1M9.4 8.6l3.1-3.2M9.4 8.6l3.4 3.4M20 12.9h-7.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              LeetCode
            </a>
          </div>
        </div>
      </div>

      {/* ---------- skills ---------- */}
      <div className="about__block">
        <h3 className="about__block-title reveal">Toolkit</h3>
        <div className="about__skills">
          {SKILLS.map((group, i) => (
            <div
              className="skillcard reveal"
              key={group.title}
              style={{ "--reveal-delay": `${i * 60}ms` }}
            >
              <div className="skillcard__head">
                <span className="skillcard__icon">{group.icon}</span>
                <h4>{group.title}</h4>
              </div>
              <ul>
                {group.items.map((s) => (
                  <li
                    key={s}
                    className="chip chip--tech"
                    style={{ "--tech": TECH_COLORS[s] || "var(--text-mute)" }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={showResume}
        onClose={() => setShowResume(false)}
        title="Aryan Kumar Raj — Résumé"
        subtitle="Full-stack &amp; AI engineer · Updated 2026"
        src="/resume.pdf"
        downloadName="Aryan-Kumar-Raj-Resume.pdf"
      />
    </div>
  );
};

export default About;
