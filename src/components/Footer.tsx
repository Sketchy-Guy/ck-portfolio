
import { Github, Linkedin, Twitter, Instagram, Facebook, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: "https://github.com/chinmaykumarpanda", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/chinmay-kumar-panda", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <footer className="bg-portfolio-dark-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Chinmay Kumar Panda</h3>
            <p className="text-gray-300 mb-4">
              Software Developer specializing in Python, JavaScript, and AI development.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#skills" className="text-gray-300 hover:text-white transition-colors">Skills</a>
              </li>
              <li>
                <a href="#projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <p className="text-gray-300 mb-2">
              Bhubaneswar, Odisha, India
            </p>
            <p className="text-gray-300 mb-2">
              chinmaykumarpanda004@gmail.com
            </p>
            <p className="text-gray-300">
              +91 7815014638
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Chinmay Kumar Panda. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with ❤️ by Chinmay Kumar Panda</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
