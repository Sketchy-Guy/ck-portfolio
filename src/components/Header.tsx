
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const navLinks = [
    { title: "Home", href: "#" },
    { title: "About", href: "#about" },
    { title: "Skills", href: "#skills" },
    { title: "Projects", href: "#projects" },
    { title: "Contact", href: "#contact" },
  ];
  
  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrollPosition > 50 
          ? "py-3 bg-white/80 dark:bg-portfolio-dark-blue/80 backdrop-blur-md shadow-md" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <a 
            href="#" 
            className={`text-2xl font-bold transition-colors duration-300 ${
              scrollPosition > 50 
                ? "text-portfolio-purple" 
                : "text-portfolio-purple"
            }`}
          >
            CK<span className="text-portfolio-teal">Panda</span>
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`hover:text-portfolio-purple transition-colors duration-300 ${
                  scrollPosition > 50 
                    ? "text-gray-800 dark:text-gray-200" 
                    : "text-gray-800"
                }`}
              >
                {link.title}
              </a>
            ))}
            
            <Button className="bg-portfolio-purple hover:bg-portfolio-purple/90" onClick={() => window.location.href = "#contact"}>
              Hire Me
            </Button>
          </nav>
          
          <button 
            className="md:hidden text-portfolio-purple"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
          
          {/* Mobile Menu */}
          <div 
            className={`fixed inset-0 bg-white dark:bg-portfolio-dark-blue z-50 flex flex-col p-8 md:hidden transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-8">
              <a href="#" className="text-2xl font-bold text-portfolio-purple">
                CK<span className="text-portfolio-teal">Panda</span>
              </a>
              <button 
                className="text-portfolio-purple"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-xl text-gray-800 dark:text-gray-200 hover:text-portfolio-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </a>
              ))}
              
              <Button 
                className="bg-portfolio-purple hover:bg-portfolio-purple/90 w-full mt-4"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = "#contact";
                }}
              >
                Hire Me
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
