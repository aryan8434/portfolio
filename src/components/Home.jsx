import React, { useState, useEffect } from "react";
import "./Home.css";
import ShinyText from "./ShinyText";
import AIChat from "./AIChat";

const Home = ({ isDark }) => {
  // Text Animation State
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  // helper to run the intro sequence
  useEffect(() => {
    let timers = [];
    const runSequence = () => {
      // reset
      setShowFirst(false);
      setShowSecond(false);
      setShowThird(false);

      // schedule with 1s increments and 0.4s visual transition
      timers.push(setTimeout(() => setShowFirst(true), 1000));
      timers.push(setTimeout(() => setShowSecond(true), 2000));
      timers.push(setTimeout(() => setShowThird(true), 3000));
    };

    // run once on mount
    runSequence();

    const handler = () => runSequence();
    window.addEventListener("homeClicked", handler);

    return () => {
      window.removeEventListener("homeClicked", handler);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="home-main-container">
      <div className="intro-text-container">
        {showFirst && (
          <h1 className="intro-text-h1">
            <ShinyText
              text="Hello!"
              speed={2}
              delay={0}
              color={isDark ? "#c9c6c6ff" : "purple"}
              shineColor="pink"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h1>
        )}
        {showSecond && (
          <h2 className="intro-text-h2">
            <ShinyText
              text="My name is Aryan"
              speed={2}
              delay={1}
              color={isDark ? "#c9c6c6ff" : "purple"}
              shineColor="pink"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h2>
        )}
        {showThird && (
          <h3 className="intro-text-h3">
            <ShinyText
              text="I am a developer"
              speed={2}
              delay={2}
              color={isDark ? "#c9c6c6ff" : "purple"}
              shineColor="pink"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h3>
        )}
      </div>

      <AIChat isDark={isDark} />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
