import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const carouselImages = [
  "/carousel/c1.png",
  "/carousel/c2.png",
  "/carousel/c3.png",
  "/carousel/c4.png",
  "/carousel/c5.png",
  "/carousel/c6.png",
  "/carousel/c7.png",
  "/carousel/c8.png",
  "/carousel/c9.png",
  "/carousel/c10.png",
  "/carousel/c11.png",
  "/carousel/c12.png",
  "/carousel/c13.png",
  "/carousel/c14.png",
  "/carousel/c15.png",
  "/carousel/c16.jpeg"
];

function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{ 
      padding: "100px 40px", 
      maxWidth: "1200px", 
      margin: "0 auto" 
    }}>
      <div style={{ 
        fontFamily: "Inter", 
        fontSize: 13, 
        color: "#888", 
        textTransform: "uppercase", 
        letterSpacing: 2, 
        marginBottom: 16, 
        fontWeight: 600 
      }}>
        Our Work
      </div>
      <h2 style={{ 
        fontFamily: "Space Grotesk", 
        fontWeight: 700, 
        fontSize: 42, 
        color: "#fff", 
        marginBottom: 48, 
        lineHeight: 1.2 
      }}>
        Featured Projects
      </h2>

      <div style={{ 
        position: "relative", 
        width: "100%", 
        height: "500px",
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        {/* Main Image */}
        <img
          src={carouselImages[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transition: "opacity 0.5s ease-in-out"
          }}
        />

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            color: "#FFD700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 215, 0, 0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            color: "#FFD700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 215, 0, 0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          zIndex: 10
        }}>
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? 30 : 10,
                height: 10,
                borderRadius: 5,
                background: index === currentIndex ? "#FFD700" : "rgba(255, 255, 255, 0.3)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = "rgba(255, 215, 0, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }
              }}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0, 0, 0, 0.6)",
          padding: "8px 16px",
          borderRadius: 20,
          color: "#FFD700",
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: 600,
          zIndex: 10
        }}>
          {currentIndex + 1} / {carouselImages.length}
        </div>
      </div>
    </div>
  );
}

export default ImageCarousel;
