import { useState, useEffect } from "react";
import ShinyText from "./components/ShinyText";

function App() {
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  useEffect(() => {
    // Show "Hello!" first
    const timer1 = setTimeout(() => {
      setShowFirst(true);
    }, 500);

    // Then show "My name is Aryan" after a delay
    const timer2 = setTimeout(() => {
      setShowSecond(true);
    }, 1500);

    // Then show "I am a developer" after another delay
    const timer3 = setTimeout(() => {
      setShowThird(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <>
      <div style={{ minHeight: "150px" }}>
        {showFirst && (
          <h1
            className="text-9xl font-bold"
            style={{
              animation: "fadeIn 0.5s ease-in",
              fontFamily: "'Fredoka One', cursive",
              marginTop: "200px",
              marginLeft: "100px",
            }}
          >
            <ShinyText
              text="Hello!"
              speed={2}
              delay={0}
              color="#16a34a"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h1>
        )}
        {showSecond && (
          <h2
            className="text-5xl font-semibold mt-4"
            style={{
              animation: "fadeIn 0.5s ease-in",
              fontFamily: " 'Fredoka One', cursive",
              marginTop: "20px",
              marginLeft: "12%",
              color: "darkgreen",
            }}
          >
            <ShinyText
              text="My name is Aryan"
              speed={2}
              delay={1}
              color="darkgreen"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
            />
          </h2>
        )}
        {showThird && (
          <h2
            className="text-5xl font-semibold mt-4"
            style={{
              animation: "fadeIn 0.5s ease-in",
              fontFamily: " 'Fredoka One', cursive",
              marginTop: "20px",
              marginLeft: "12%",
              color: "darkgreen",
            }}
          ></h2>
        )}
      </div>

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
    </>
  );
}
export default App;
