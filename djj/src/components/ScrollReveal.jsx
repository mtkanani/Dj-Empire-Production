import { useEffect, useRef, useState } from "react";

function ScrollReveal({ children, delay = 0, direction = "up" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return "translateY(0) scale(1)";
    switch (direction) {
      case "up":
        return "translateY(60px) scale(0.95)";
      case "down":
        return "translateY(-60px) scale(0.95)";
      case "left":
        return "translateX(60px) scale(0.95)";
      case "right":
        return "translateX(-60px) scale(0.95)";
      default:
        return "translateY(60px) scale(0.95)";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
