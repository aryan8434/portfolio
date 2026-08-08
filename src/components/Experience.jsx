import React, { useState } from "react";
import "./Experience.css";
import Modal from "./Modal";
import { useReveal } from "../hooks/useReveal";

const EXPERIENCE = [
  {
    id: "handshake",
    period: "Jul 2026 — Present",
    role: "AI Evaluation Engineer",
    org: "Handshake",
    type: "Contract · Remote",
    current: true,
    summary:
      "Author benchmark tasks used to measure how well AI coding agents perform on real engineering work.",
    points: [
      "Design end-to-end evaluation tasks across software engineering, security, systems & infrastructure, data science, build/release management, and formal reasoning.",
      "Ship each task as a complete harness: a precise specification, a reference oracle solution, a pinned containerised environment, and an automated verifier that grades agent output on observable behaviour.",
      "Run adversarial QC on evaluations — probing for reward hacking such as agents symlinking graded output at golden files, leaking expected results into the agent image, or otherwise passing the verifier without solving the task.",
      "Calibrate task difficulty and document verification rationale so results stay comparable across the benchmark suite.",
    ],
    stack: ["Python", "Docker", "pytest", "SQLite", "Bash", "Task Design"],
  },
  {
    id: "proscon",
    period: "Jun 2025 — Aug 2025",
    role: "Frontend Developer Intern",
    org: "Proscon Automation, Kota",
    type: "Internship · On-site",
    summary:
      "Rebuilt and modernised the company's legacy website, with a focus on render performance.",
    points: [
      "Migrated an ageing codebase to a maintainable React structure.",
      "Cut load time by roughly 40% using memoisation and render-path fixes to eliminate redundant re-renders.",
      "Handled responsive layout work so the site held up on real client devices.",
    ],
    stack: ["React", "JavaScript", "CSS", "Performance"],
    certificate: {
      src: "/certificates/proscon.pdf",
      label: "Proscon Automation internship certificate",
    },
  },
  {
    id: "octanet",
    period: "May 2024 — Jul 2024",
    role: "Frontend Developer Intern",
    org: "Octanet",
    type: "Internship · Remote",
    summary:
      "Project-based frontend work that built the foundations I still rely on.",
    points: [
      "Shipped multiple frontend projects against real briefs and deadlines.",
      "Built depth in React fundamentals, component architecture and responsive layout systems.",
    ],
    stack: ["React", "JavaScript", "HTML/CSS"],
    certificate: {
      src: "/certificates/octanet.pdf",
      label: "Octanet internship certificate",
    },
  },
  {
    id: "education",
    period: "2022 — 2026",
    role: "B.Tech, Computer Science & Engineering",
    org: "Rajasthan Technical University, Kota",
    type: "CGPA 8.13",
    summary:
      "Final year, alongside daily competitive programming practice.",
    points: [
      "1500+ LeetCode rating and 4★ on GeeksForGeeks.",
      "Coursework in data structures, algorithms, DBMS, operating systems and system design.",
    ],
    stack: ["DSA", "DBMS", "Operating Systems", "System Design"],
  },
];

const CERTIFICATES = [
  {
    id: "cert-proscon",
    title: "Proscon Automation",
    subtitle: "Frontend Developer Internship · 2025",
    src: "/certificates/proscon.pdf",
    accent: ["#8b5cf6", "#22d3ee"],
  },
  {
    id: "cert-octanet",
    title: "Octanet",
    subtitle: "Frontend Developer Internship · 2024",
    src: "/certificates/octanet.pdf",
    accent: ["#d946ef", "#8b5cf6"],
  },
  {
    id: "cert-hackathon",
    title: "Hackathon Win",
    subtitle: "Competition · 2025",
    src: "/certificates/hackathon.pdf",
    accent: ["#fbbf24", "#34d399"],
  },
];

const Experience = () => {
  const [doc, setDoc] = useState(null); // { title, subtitle, src }
  useReveal([]);

  return (
    <div className="experience">
      <header className="section-head reveal">
        <span className="eyebrow">Experience</span>
        <h2 className="section-title">
          Where I&apos;ve <span className="grad-text">done the work</span>
        </h2>
        <p className="section-sub">
          Two frontend internships, and current contract work authoring the
          benchmark tasks that measure AI coding agents. Certificates are
          attached — click one to read it.
        </p>
      </header>

      <ol className="xp">
        {EXPERIENCE.map((item, i) => (
          <li
            className="xp__item reveal"
            key={item.id}
            style={{ "--reveal-delay": `${i * 80}ms` }}
          >
            <span className={`xp__marker ${item.current ? "is-current" : ""}`} />

            <div className="xp__card">
              <div className="xp__head">
                <div>
                  <span className="xp__period">{item.period}</span>
                  <h3 className="xp__role">{item.role}</h3>
                  <span className="xp__org">
                    {item.org}
                    <em> · {item.type}</em>
                  </span>
                </div>
                {item.current && <span className="xp__now">Currently here</span>}
              </div>

              <p className="xp__summary">{item.summary}</p>

              <ul className="xp__points">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="xp__foot">
                <ul className="xp__stack">
                  {item.stack.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>

                {item.certificate && (
                  <button
                    className="btn btn-ghost btn-sm xp__cert"
                    onClick={() =>
                      setDoc({
                        title: item.certificate.label,
                        subtitle: `${item.org} · ${item.period}`,
                        src: item.certificate.src,
                      })
                    }
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="9"
                        r="5.2"
                        stroke="currentColor"
                        strokeWidth="1.9"
                      />
                      <path
                        d="M8.4 13.4L7 21l5-2.4L17 21l-1.4-7.6"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View certificate
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* ---------- certificate wall ---------- */}
      <div className="certs">
        <h3 className="certs__title reveal">Certificates</h3>
        <div className="certs__grid">
          {CERTIFICATES.map((cert, i) => (
            <button
              key={cert.id}
              className="certcard reveal"
              style={{
                "--reveal-delay": `${i * 70}ms`,
                "--from": cert.accent[0],
                "--to": cert.accent[1],
              }}
              onClick={() =>
                setDoc({
                  title: cert.title,
                  subtitle: cert.subtitle,
                  src: cert.src,
                })
              }
            >
              <span className="certcard__seal">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="9"
                    r="5.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8.4 13.4L7 21l5-2.4L17 21l-1.4-7.6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="certcard__text">
                <strong>{cert.title}</strong>
                <em>{cert.subtitle}</em>
              </span>
              <span className="certcard__cue">View →</span>
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={!!doc}
        onClose={() => setDoc(null)}
        title={doc?.title}
        subtitle={doc?.subtitle}
        src={doc?.src}
        downloadName={doc?.title}
      />
    </div>
  );
};

export default Experience;
