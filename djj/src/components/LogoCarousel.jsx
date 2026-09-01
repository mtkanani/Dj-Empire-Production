import { useState } from "react";

function LogoCarousel({ logos = [], speed = 35, direction = "left" }) {
  // Duplicate logos to create seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  const animationDuration = `${speed}s`;
  const animationDirection = direction === "left" ? "normal" : "reverse";

  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      padding: "60px 0",
      background: "rgba(255, 255, 255, 0.02)",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Left gradient fade */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "150px",
        background: "linear-gradient(to right, rgba(10, 10, 15, 1) 0%, transparent 100%)",
        zIndex: 10,
        pointerEvents: "none"
      }} />

      {/* Right gradient fade */}
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "150px",
        background: "linear-gradient(to left, rgba(10, 10, 15, 1) 0%, transparent 100%)",
        zIndex: 10,
        pointerEvents: "none"
      }} />

      {/* Scrolling container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "50px",
          animation: `scroll ${animationDuration} linear infinite`,
          animationDirection: animationDirection,
          width: "max-content"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            style={{
              flexShrink: 0,
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              cursor: logo.url ? "pointer" : "default"
            }}
            onClick={() => {
              if (logo.url) {
                window.open(logo.url, "_blank");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              const img = e.currentTarget.querySelector("img");
              if (img) {
                img.style.filter = "grayscale(0%)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              const img = e.currentTarget.querySelector("img");
              if (img) {
                img.style.filter = "grayscale(100%)";
              }
            }}
          >
            <img
              src={logo.image}
              alt={logo.name}
              style={{
                height: "100%",
                width: "auto",
                maxWidth: "150px",
                objectFit: "contain",
                filter: "grayscale(100%)",
                transition: "filter 0.3s ease"
              }}
            />
          </div>
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }

        @media (max-width: 768px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.33%);
            }
          }
        }
      `}</style>
    </div>
  );
}

export default LogoCarousel;
