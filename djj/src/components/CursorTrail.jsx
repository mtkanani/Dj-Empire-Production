import { useEffect, useRef } from "react";
import { C } from "../constants";

function CursorTrail() {
  const canvasRef = useRef(null);
  const trailsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      trailsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 3 + 1,
        life: 1,
        color: Math.random() > 0.5 ? C.gold : C.blue
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailsRef.current = trailsRef.current.filter(trail => {
        trail.life -= 0.02;
        trail.size *= 0.98;
        
        if (trail.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
        ctx.fillStyle = trail.color;
        ctx.globalAlpha = trail.life * 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999
      }}
    />
  );
}

export default CursorTrail;
