import { useEffect, useRef, useState } from "react";
import { C } from "../constants";

function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        style={{
          position: "fixed",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
          transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
          transition: "transform 0.1s ease-out",
          zIndex: 1,
          opacity: 0.15,
          filter: "blur(60px)"
        }}
      />
      <div
        style={{
          position: "fixed",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blueGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
          transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`,
          transition: "transform 0.15s ease-out",
          zIndex: 1,
          opacity: 0.1,
          filter: "blur(50px)"
        }}
      />
    </>
  );
}

export default MouseGlow;
