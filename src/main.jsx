import { createRoot } from "react-dom/client";
import { useState, useRef, useEffect } from "react";
import "./index.css";
import Navbar from "./components/Navbar.jsx";
import "./components/Navbar.css";
import DotGrid from "./components/DotGrid.jsx";
import About from "./components/About.jsx";
import "./components/About.css";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import Home from "./components/Home.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";


function RootApp() {
  const containerRef = useRef(null);
  // Default to dark mode on initial render to avoid flicker
  const [isDark, setIsDark] = useState(true);

  // Listen for theme changes (fired from Navbar toggle)
  useEffect(() => {
    const handler = (e) => setIsDark(Boolean(e?.detail?.isDark));
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  // Refs to background videos so we can call play() when needed (some browsers block autoplay without an explicit play call)
  const darkVideoRef = useRef(null);
  const lightVideoRef = useRef(null);

  // Try to start videos on mount and when theme changes
  useEffect(() => {
    let mounted = true;
    const tryPlay = async () => {
      if (!mounted) return;
      try {
        if (darkVideoRef.current && darkVideoRef.current.paused) {
          await darkVideoRef.current.play().catch(() => {});
        }
      } catch (e) { /* ignore */ }
      try {
        if (lightVideoRef.current && lightVideoRef.current.paused) {
          await lightVideoRef.current.play().catch(() => {});
        }
      } catch (e) { /* ignore */ }
    };
    tryPlay();
    // Also attempt a delayed play in case loading takes longer
    const t = setTimeout(tryPlay, 800);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [isDark]);



  return (
    <ErrorBoundary>
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        display: "block",
        position: "relative",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
      }}
    >
      <CustomCursor />
      {/* Dot Grid Background */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -2,
          // White page background in light mode so black dots are visible
          background: isDark ? "transparent" : "#ffffff",
          transition: "background 360ms ease",
        }}
      >
        <DotGrid
          dotSize={3}
          gap={32}
          baseColor={isDark ? "#ffffff" : "#000000"}
          activeColor={isDark ? "#ffffff" : "#000000"}
          proximity={150}
          speedTrigger={100}
          shockRadius={250}
          shockStrength={5}
          maxSpeed={5000}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <Navbar />


      {/* Page 1: Home (Avatar + Hello) */}
      <section id="home" className="home-section" style={{ scrollSnapAlign: 'start' }}>
        <div className="home-bg-overlay" />
        
        <div className="chat-container-wrapper" style={{ width: '100%', flexDirection: 'column' }}>
          <div className="chat-box" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Home />
          </div>
        </div>
      </section>

      {/* Page 2: About (Navbar + About content only) */}
      <section
        id="about-page"
        style={{
          position: "relative",
          height: "100vh",
          boxSizing: "border-box",
          width: "100%",
          padding: "20px",
          background: "transparent",
          paddingTop: "64px",
          overflow: "hidden",
          scrollMarginTop: "64px",
          scrollSnapAlign: "start",
        }}
      >
        {/* About background (sits above DotGrid but behind content) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isDark
              ? "linear-gradient(120deg, #0f172a 0%, #071128 100%)"
              : "#ffffff",
            zIndex: -1,
            transition: "background 360ms ease",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 900,
            margin: "40px auto",
            color: isDark ? "#fff" : "#000",
            transition: "color 360ms ease",
          }}
        >
          <About />
        </div>
      </section>

      {/* Page 3: Projects */}
      <section
        id="projects"
        style={{
          position: "relative",
          height: "100vh",
          boxSizing: "border-box",
          width: "100%",
          padding: "20px",
          paddingTop: "64px",
          scrollMarginTop: "64px",
          overflowY: "auto",
          scrollSnapAlign: "start",
        }}
      >
        {/* Background videos (cross-fade between dark/light) */}
        <video
          ref={darkVideoRef}
          className="bg-video dark-video"
          src="/bgvid.mp4"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            opacity: isDark ? 1 : 0,
            transition: "opacity 420ms ease",
          }}
        />
        <video
          ref={lightVideoRef}
          className="bg-video light-video"
          src="/light.mp4"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            opacity: isDark ? 0 : 1,
            transition: "opacity 420ms ease",
          }}
        />
        {/* Optional overlay to darken/lighten the video for legibility with transition */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isDark
              ? "rgba(3, 7, 18, 0.45)"
              : "rgba(255,255,255,0.6)",
            zIndex: 0,
            pointerEvents: "none",
            transition: "background 360ms ease, opacity 360ms ease",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1100,
            margin: "40px auto",
            color: "#fff",
          }}
        >
          <Projects />
        </div>
      </section>

      {/* Page 4: Contact */}
      <section
        id="contact"
        style={{
          position: "relative",
          height: "100vh",
          boxSizing: "border-box",
          width: "100%",
          padding: "20px",
          paddingTop: "64px",
          scrollMarginTop: "64px",
          overflowY: "auto",
          scrollSnapAlign: "start",
        }}
      >
        {/* Opaque overlay to hide DotGrid background under Contact */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isDark
              ? "linear-gradient(180deg, rgba(10,10,10,0.95), rgba(20,20,20,0.95))"
              : "transparent",
            zIndex: 0,
            pointerEvents: "none",
            transition: "background 360ms ease",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 900,
            margin: "40px auto",
            color: isDark ? "#fff" : "#000",
            transition: "color 360ms ease",
          }}
        >
          <Contact />
        </div>
      </section>
    </div>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(<RootApp />);
