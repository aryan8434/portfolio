import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import "./index.css";

import Navbar from "./components/Navbar.jsx";
import DotGrid from "./components/DotGrid.jsx";
import Home from "./components/Home.jsx";
import About from "./components/About.jsx";
import Experience from "./components/Experience.jsx";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LiveStrip from "./components/LiveStrip.jsx";
import { logPortfolioVisit } from "./services/visitLogger.js";
import { useFinePointer } from "./hooks/useFinePointer.js";

function RootApp() {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document === "undefined" ||
      document.documentElement.classList.contains("dark"),
  );
  const progressRef = useRef(null);

  /* Mouse-only flourishes are skipped entirely on touch devices. */
  const hasFinePointer = useFinePointer();

  /* Theme is owned by the Navbar; every other surface listens. */
  useEffect(() => {
    const handler = (e) => setIsDark(Boolean(e?.detail?.isDark));
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  /* Reading-progress bar */
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${pct})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Analytics */
  useEffect(() => {
    logPortfolioVisit().catch((error) =>
      console.error("Failed to log portfolio visit:", error),
    );
  }, []);

  return (
    <ErrorBoundary>
      <div ref={progressRef} className="scroll-progress" style={{ transform: "scaleX(0)" }} />

      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {hasFinePointer && (
        <div
          className="dotgrid-layer"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -2,
            pointerEvents: "none",
          }}
        >
          <DotGrid
            dotSize={2.6}
            gap={34}
            baseColor={isDark ? "#332d52" : "#cdc8e0"}
            activeColor={isDark ? "#a78bfa" : "#d946ef"}
            proximity={150}
            speedTrigger={100}
            shockRadius={250}
            shockStrength={5}
            maxSpeed={5000}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
      )}

      <div className="grain" aria-hidden="true" />

      {hasFinePointer && <CustomCursor />}
      <Navbar />

      <div className="livestrip-bar">
        <div className="shell">
          <LiveStrip />
        </div>
      </div>

      <main>
        <section id="home">
          <Home isDark={isDark} />
        </section>

        <section id="about" className="section">
          <div className="shell">
            <About />
          </div>
        </section>

        <section id="experience" className="section">
          <div className="shell">
            <Experience />
          </div>
        </section>

        <section id="projects" className="section">
          <div className="shell">
            <Projects />
          </div>
        </section>

        <section id="contact" className="section">
          <div className="shell">
            <Contact />
          </div>
        </section>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(<RootApp />);
