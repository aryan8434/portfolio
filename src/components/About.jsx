import { color } from "motion";
import React, { useState, useEffect } from "react";
import "./About.css";

const SkillCategory = ({ title, skills }) => (
  <div className="mb-2">
    <span className="text-base font-bold text-black mr-2">{title}:</span>
    <ul className="inline-flex flex-wrap gap-2 p-0 list-none align-middle">
      {skills.map((skill) => (
        <li
          key={skill}
          className="bg-white/10 px-3 py-1 rounded-full cursor-pointer transition-all duration-300 font-medium text-sm hover:bg-red-500 hover:text-white hover:scale-110 hover:shadow-lg shadow-red-500/40"
        >
          {skill}
        </li>
      ))}
    </ul>
  </div>
);

const About = () => {
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowResume(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openResume = () => setShowResume(true);
  const closeResume = () => setShowResume(false);

  return (
    <div className="about">
      <div className="details">
        <h1>About Me</h1>I am a final-year Computer Science student with strong
        skills in competitive programming and full-stack web development. I
        regularly solve algorithmic problems on platforms like{" "}
        <a
          className="leetcode"
          href="https://leetcode.com/u/aryan8434/"
          data-tooltip="Visit LeetCode"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit LeetCode"
        >
          LeetCode
        </a>{" "}
        and{" "}
        <a
          href="https://www.geeksforgeeks.org/profile/aryan8434"
          className="geeks"
          data-tooltip="Visit GeeksForGeeks"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit GeeksForGeeks"
        >
          GeeksForGeeks
        </a>
        <br />
        <br />
        <button
          onClick={openResume}
          className="bg-purple-500 transition duration-150 hover:bg-purple-800 hover:font-bold text-white py-3 px-5"
          aria-haspopup="dialog"
        >
          Resume
        </button>
        {showResume && (
          <div
            className="resume-overlay"
            onClick={closeResume}
            role="presentation"
          >
            <div
              className="resume-content"
              role="dialog"
              aria-modal="true"
              aria-label="Resume dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="resume-close bg-red-400 font-bold transition delay-50 hover:bg-red-600 hover:font-extrabold"
                onClick={closeResume}
                aria-label="Close resume"
              >
                Close
              </button>
              <iframe
                src="/resume.pdf"
                title="Resume"
                className="resume-iframe"
              />
            </div>
          
          </div>
        )}
        <br />
        <br />
        

        <h2>Skills</h2>
        <div className="mt-8">
          <SkillCategory title="Programming Languages" skills={["C++", "C", "Python", "JavaScript"]} />
          <SkillCategory title="Backend Development" skills={["Express.js", "Backend System Design"]} />
          <SkillCategory title="API Development" skills={["REST APIs", "API Design", "JWT Authentication"]} />
          <SkillCategory title="Databases & Clouds" skills={["PostgreSQL", "MongoDB", "Amazon EC2"]} />
        </div>
        </div>
    </div>
  );
};

export default About;
