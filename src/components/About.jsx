import React, { useState } from "react";
import "./About.css";
import Modal from "./Modal";
import { useReveal } from "../hooks/useReveal";

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
              <strong>1500+</strong>
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
            I&apos;m a final-year Computer Science student who spends most of his
            time on the parts of a product that other people don&apos;t see —
            the API design, the data model, the reason a page loads in 300ms
            instead of 3 seconds.
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
              className="btn btn-ghost"
              href="https://www.linkedin.com/in/aryan-kumar-raj-988587b3/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
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
                  <li key={s} className="chip">
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
