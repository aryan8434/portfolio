import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
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
import { logPortfolioVisit } from "./services/visitLogger.js";

function RootApp() {
  const containerRef = useRef(null);
  const darkVideoRef = useRef(null);
  const lightVideoRef = useRef(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handler = (e) => setIsDark(Boolean(e?.detail?.isDark));
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  useEffect(() => {
    let mounted = true;
    const tryPlay = async () => {
      if (!mounted) return;
      try {
        if (darkVideoRef.current && darkVideoRef.current.paused) {
          await darkVideoRef.current.play().catch(() => {});
        }
      } catch {
        /* ignore */
      }
      try {
        if (lightVideoRef.current && lightVideoRef.current.paused) {
          await lightVideoRef.current.play().catch(() => {});
        }
      } catch {
        /* ignore */
      }
    };

    tryPlay();
    const timer = setTimeout(tryPlay, 800);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isDark]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const recordVisit = async () => {
      try {
        await logPortfolioVisit();
        if (cancelled) return;
      } catch (error) {
        console.error("Failed to log portfolio visit:", error);
      }
    };

    recordVisit();

    return () => {
      cancelled = true;
    };
  }, []);

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
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: -2,
            background: isDark ? "transparent" : "#ffffff",
            transition: "background 360ms ease",
          }}
        >
          <DotGrid
            dotSize={3}
            gap={32}
            baseColor={isDark ? "#ffffff" : "#000000"}
            activeColor={isDark ? "#7c3aed" : "#ec4899"}
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

        <section
          id="home"
          className="home-section"
          style={{ scrollSnapAlign: "start" }}
        >
          <div className="home-bg-overlay" />
          <div
            className="chat-container-wrapper"
            style={{ width: "100%", flexDirection: "column" }}
          >
            <div
              className="chat-box"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Home isDark={isDark} />
            </div>
          </div>
        </section>

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
            <About isDark={isDark} />
          </div>
        </section>

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
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: 1100,
              margin: "40px auto",
              color: isDark ? "#fff" : "#000",
              transition: "color 360ms ease",
            }}
          >
            <Projects isDark={isDark} />
          </div>
        </section>

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
