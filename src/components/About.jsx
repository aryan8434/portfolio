import { color } from "motion";
import React, { useState, useEffect } from "react";
import "./About.css";

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
      <img className="skills" src="skills.png" alt="" />
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
      </div>
    </div>
  );
};

export default About;
