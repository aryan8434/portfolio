import React, { useState } from "react";
import "./Projects.css";

const placeholders = [
  {
    title: "Travo AI",
    desc: "Book your entire trip and resolve travel distress in minutes with simple text commands.",
    url: "http://65.1.131.213:5000/",
    image: "/travo.png",
  },
  {
    title: "Shopper",
    desc: "An e-commerce site to enhance your shopping experience",
    url: "https://shopper-ai-lake.vercel.app/",
    image: "/shopper.png",
  },
  
  {
    title: "Multidoc Querying System",
    desc: "Ask one question. Get answers from all your documents.",
    url: "http://localhost:5174/",
    image: "/multi.png",
  },
];

const Projects = ({ isDark }) => {
  const n = placeholders.length;
  const [index, setIndex] = useState(0); // currently focused project index

  const prev = () => setIndex((i) => (i - 1 + n) % n);
  const next = () => setIndex((i) => (i + 1) % n);

  const visible = [(index - 1 + n) % n, index, (index + 1) % n];

  return (
    <section className="projects-section" aria-label="Projects">
      <h2 style={{ marginBottom: 16 }}>Projects</h2>

      <div className="projects-carousel" aria-roledescription="carousel">
        <button
          className="carousel-arrow left"
          onClick={prev}
          style={{ color: isDark ? "white" : "black" }}
          aria-label="Previous project"
        >
          ‹
        </button>

        <div className="carousel-track">
          {visible.map((idx, pos) => {
            const project = placeholders[idx];
            const isCenter = pos === 1;
            return (
              <article
                key={idx}
                className={`project-card ${isCenter ? "center" : "side"}`}
                aria-hidden={!isCenter}
              >
                <div
                  className="project-image-placeholder"
                  aria-hidden="true"
                  style={{
                    backgroundImage: project.image
                      ? `url(${project.image})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.desc}</p>
                <div className="project-actions">
                  {project.url ? (
                    <a
                      className="project-link"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-tooltip={`Visit ${project.title}`}
                    >
                      View
                    </a>
                  ) : (
                    <button
                      className="project-link"
                      disabled
                      aria-disabled="true"
                      title="Link coming soon"
                      data-tooltip="Link coming soon"
                    >
                      Coming soon
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="carousel-arrow right"
          style={{ color: isDark ? "white" : "black" }}
          onClick={next}
          aria-label="Next project"
        >
          ›
        </button>
      </div>

      {/* Optional: a grid fallback or thumbnails could go here */}
    </section>
  );
};

export default Projects;
