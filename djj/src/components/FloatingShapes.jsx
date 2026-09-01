import { useEffect, useRef } from "react";
import { C } from "../constants";

function FloatingShapes() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const shapes = [];
    const shapeCount = 15;

    const createShape = () => {
      const shape = document.createElement('div');
      const size = Math.random() * 100 + 50;
      const shapeType = Math.floor(Math.random() * 4);
      
      shape.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.05 + 0.02};
        pointer-events: none;
        animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
      `;

      switch (shapeType) {
        case 0:
          shape.style.borderRadius = '20px';
          shape.style.border = `1px solid ${C.gold}`;
          shape.style.transform = `rotate(${Math.random() * 45}deg)`;
          break;
        case 1:
          shape.style.borderRadius = '50%';
          shape.style.border = `1px solid ${C.blue}`;
          break;
        case 2:
          shape.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
          shape.style.background = `linear-gradient(135deg, ${C.gold} 0%, ${C.blue} 100%)`;
          break;
        case 3:
          shape.style.borderRadius = '0';
          shape.style.border = `1px solid ${C.gold}`;
          shape.style.transform = `rotate(${Math.random() * 90}deg)`;
          break;
      }

      container.appendChild(shape);
      shapes.push(shape);
    };

    for (let i = 0; i < shapeCount; i++) {
      createShape();
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-30px) rotate(5deg); }
        50% { transform: translateY(-15px) rotate(-5deg); }
        75% { transform: translateY(-40px) rotate(3deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      shapes.forEach(shape => shape.remove());
      style.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden"
      }}
    />
  );
}

export default FloatingShapes;
