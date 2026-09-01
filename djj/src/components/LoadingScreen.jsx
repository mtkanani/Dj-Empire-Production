import { useEffect, useState } from "react";
import { C } from "../constants";

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease-out"
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ 
          fontFamily: "Space Grotesk", 
          fontWeight: 700, 
          fontSize: 48, 
          color: C.text, 
          marginBottom: 40,
          letterSpacing: 4,
          background: `linear-gradient(135deg, ${C.gold} 0%, ${C.blue} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "pulse 2s ease-in-out infinite"
        }}>
          DJ EMPIRE
        </div>
        
        <div style={{ 
          width: 300, 
          height: 2, 
          background: C.bgPanel, 
          borderRadius: 2, 
          overflow: "hidden",
          marginBottom: 20
        }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.gold} 0%, ${C.blue} 100%)`,
              transition: "width 0.1s ease-out",
              boxShadow: `0 0 20px ${C.goldGlow}`
            }}
          />
        </div>
        
        <div style={{ 
          fontFamily: "Montserrat", 
          fontSize: 14, 
          color: C.muted, 
          letterSpacing: 4,
          textTransform: "uppercase"
        }}>
          Loading {progress}%
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
