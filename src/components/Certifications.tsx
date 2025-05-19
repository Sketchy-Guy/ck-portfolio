
import { useState } from "react";
import { ExternalLink, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioData } from "@/contexts/DataContext";
import { CertificationData } from "@/types/portfolio";

const CertificationCard = ({ certification, isHovered, onHover, onLeaveHover }: {
  certification: CertificationData,
  isHovered: boolean,
  onHover: () => void,
  onLeaveHover: () => void
}) => {
  return (
    <div 
      className={`glass-card p-6 transition-all duration-300 hover:shadow-xl reveal ${
        isHovered ? 'scale-[1.03]' : 'scale-100'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeaveHover}
    >
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 mr-4 shadow-md">
          <img 
            src={certification.logo} 
            alt={certification.issuer}
            className="w-12 h-12 object-contain"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-portfolio-purple">{certification.title}</h3>
          <p className="text-gray-600">{certification.issuer}</p>
        </div>
      </div>
      
      <div className="border-l-4 border-portfolio-teal pl-4 py-2 mb-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Issued: {certification.date}</span>
          <span className="text-sm text-gray-500">Credential ID: {certification.credential}</span>
        </div>
      </div>
      
      {certification.link && (
        <Button 
          variant="outline" 
          className="w-full border-portfolio-teal text-portfolio-teal hover:bg-portfolio-teal hover:text-white"
          asChild
        >
          <a href={certification.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> View Certificate
          </a>
        </Button>
      )}
      
      {!certification.link && (
        <Button 
          variant="outline" 
          className="w-full border-gray-300 text-gray-500 cursor-not-allowed"
          disabled
        >
          <Award className="mr-2 h-4 w-4" /> In Progress
        </Button>
      )}
    </div>
  );
};

const Certifications = () => {
  const { data } = usePortfolioData();
  const [hoveredCert, setHoveredCert] = useState<string | null>(null);

  return (
    <section id="certifications" className="py-16 md:py-24 bg-gradient-to-b from-white to-portfolio-soft-teal/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Certifications</h2>
          <div className="w-20 h-1 bg-portfolio-teal mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-700 dark:text-gray-300">
            I believe in continuous learning. Here are some professional certifications I've earned.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.certifications.map((cert) => (
            <CertificationCard 
              key={cert.id}
              certification={cert}
              isHovered={hoveredCert === cert.id}
              onHover={() => setHoveredCert(cert.id)}
              onLeaveHover={() => setHoveredCert(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
