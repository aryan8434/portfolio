import React, { useMemo, useState } from "react";
import "./Projects.css";
import { PROJECTS, CATEGORIES } from "../data/projects";
import { useReveal } from "../hooks/useReveal";

/* ---------- icons ---------- */

const IconExternal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 17L17 7M17 7H9M17 7v8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" />
  </svg>
);

const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="4"
      y="10"
      width="16"
      height="11"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 10V7a4 4 0 118 0v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ---------- generated cover for projects without a screenshot ---------- */

const Cover = ({ project }) => {
  const [from, to] = project.accent;
  const initials = project.title
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  if (project.image) {
    return (
      <div className="pcard__cover">
        <img src={project.image} alt="" loading="lazy" />
        <span className="pcard__cover-veil" />
      </div>
    );
  }

  return (
    <div
      className="pcard__cover pcard__cover--generated"
      style={{ "--from": from, "--to": to }}
    >
      <span className="pcard__cover-grid" />
      <span className="pcard__cover-orb" />
      <span className="pcard__monogram">{initials}</span>
      <span className="pcard__cover-veil" />
    </div>
  );
};

/* ---------- card ---------- */

const ProjectCard = ({ project, index }) => {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article
      className={`pcard reveal ${project.featured ? "pcard--featured" : ""}`}
      style={{
        "--reveal-delay": `${Math.min(index, 6) * 70}ms`,
        "--from": project.accent[0],
        "--to": project.accent[1],
      }}
      onMouseMove={onMove}
    >
      <span className="pcard__spot" aria-hidden="true" />

      <Cover project={project} />

      <div className="pcard__body">
        <div className="pcard__meta">
          <span className="pcard__year">{project.year}</span>
          {project.live ? (
            <span className="pcard__status pcard__status--live">
              <span className="pcard__status-dot" />
              Live
            </span>
          ) : (
            <span className="pcard__status">
              <IconLock />
              {project.repoPrivate ? "Private repo" : "Source only"}
            </span>
          )}
        </div>

        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__tagline">{project.tagline}</p>
        <p className="pcard__desc">{project.desc}</p>

        <ul className="pcard__tech">
          {project.tech.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>

        <div className="pcard__actions">
          {project.live && (
            <a
              className="btn btn-primary btn-sm"
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo <IconExternal />
            </a>
          )}
          {project.code && (
            <a
              className="btn btn-ghost btn-sm"
              href={project.code}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGithub /> Source
            </a>
          )}
          {!project.code && project.repoPrivate && (
            <span className="pcard__note">
              <IconLock /> Repository available on request
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---------- section ---------- */

const Projects = () => {
  const [filter, setFilter] = useState("all");

  const list = useMemo(
    () =>
      filter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.tags.includes(filter)),
    [filter],
  );

  useReveal([filter]);

  const liveCount = PROJECTS.filter((p) => p.live).length;

  return (
    <div className="projects">
      <header className="section-head reveal">
        <span className="eyebrow">Selected work</span>
        <h2 className="section-title">
          Things I&apos;ve <span className="grad-text">built &amp; shipped</span>
        </h2>
        <p className="section-sub">
          {PROJECTS.length} projects spanning AI-integrated products, full-stack
          platforms and backend systems — {liveCount} of them deployed and live
          right now. Personal builds and engineering assessments both included.
        </p>
      </header>

      <div className="projects__filters reveal" role="tablist">
        {CATEGORIES.map((cat) => {
          const count =
            cat.id === "all"
              ? PROJECTS.length
              : PROJECTS.filter((p) => p.tags.includes(cat.id)).length;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={filter === cat.id}
              className={`projects__filter ${filter === cat.id ? "is-active" : ""}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
              <span className="projects__count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="projects__grid">
        {list.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>

      <div className="projects__more reveal">
        <p>Every repository, including work in progress, lives on GitHub.</p>
        <a
          className="btn btn-ghost"
          href="https://github.com/aryan8434?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconGithub /> Browse all repositories
        </a>
      </div>
    </div>
  );
};

export default Projects;
