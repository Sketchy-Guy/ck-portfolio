import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import scrollToTopAnimation from "@/assets/lottie/scroll-to-top.json";


const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-3 rounded-full bg-portfolio-purple text-white shadow-lg transition-all duration-300 z-20 flex items-center justify-center ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`}
      aria-label="Scroll to top"
      style={{ background: "#8e2de2" }}
    >
      <span className="wobble-animation">
        <Lottie
          animationData={scrollToTopAnimation}
          loop
          autoplay
          style={{ width: 32, height: 32 }}
        />
      </span>
    </button>
  );
};

export default ScrollToTop;
