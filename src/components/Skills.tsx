
import { useState, useEffect } from "react";

interface Skill {
  name: string;
  category: string;
  level: number;
}

const skillData: Skill[] = [
  { name: "Python", category: "Programming Languages", level: 90 },
  { name: "JavaScript", category: "Programming Languages", level: 85 },
  { name: "Java", category: "Programming Languages", level: 75 },
  { name: "C", category: "Programming Languages", level: 70 },
  { name: "MySQL", category: "Databases", level: 80 },
  { name: "Firebase", category: "Databases", level: 75 },
  { name: "MongoDB", category: "Databases", level: 70 },
  { name: "HTML", category: "Web Development", level: 95 },
  { name: "CSS", category: "Web Development", level: 90 },
  { name: "React.js", category: "Web Development", level: 85 },
  { name: "Node.js", category: "Web Development", level: 80 },
  { name: "Git", category: "Tools & Platforms", level: 85 },
  { name: "VS Code", category: "Tools & Platforms", level: 95 },
  { name: "Figma", category: "Tools & Platforms", level: 75 },
  { name: "Canva", category: "Tools & Platforms", level: 90 },
  { name: "Data Structures", category: "Technical Skills", level: 85 },
  { name: "Algorithms", category: "Technical Skills", level: 80 },
  { name: "AI Prompting", category: "AI & ML", level: 90 },
  { name: "OpenAI/Gemini APIs", category: "AI & ML", level: 85 },
  { name: "Machine Learning", category: "AI & ML", level: 75 },
  { name: "Team Leadership", category: "Soft Skills", level: 90 },
  { name: "Communication", category: "Soft Skills", level: 85 },
  { name: "Project Coordination", category: "Soft Skills", level: 90 },
  { name: "Public Speaking", category: "Soft Skills", level: 80 },
];

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>(skillData);
  const [isAnimated, setIsAnimated] = useState(false);
  
  const categories = ["All", ...Array.from(new Set(skillData.map(skill => skill.category)))];
  
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredSkills(skillData);
    } else {
      setFilteredSkills(skillData.filter(skill => skill.category === activeCategory));
    }
    
    // Reset animation state
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 100);
    
    return () => clearTimeout(timer);
  }, [activeCategory]);
  
  useEffect(() => {
    // Start animation when component mounts
    const timer = setTimeout(() => setIsAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="skills" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">My Skills</h2>
          <div className="w-20 h-1 bg-portfolio-teal mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-700 dark:text-gray-300">
            I've acquired a diverse set of skills throughout my education and projects. 
            Here's a comprehensive list of my technical and professional competencies.
          </p>
        </div>
        
        <div className="mb-10 overflow-x-auto reveal">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category 
                  ? "bg-portfolio-purple text-white shadow-md" 
                  : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
          {filteredSkills.map((skill, index) => (
            <div 
              key={index}
              className={`glass-card p-6 transition-all duration-500 ${
                isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
                <span className="text-sm font-medium text-portfolio-purple">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-portfolio-purple to-portfolio-teal h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: isAnimated ? `${skill.level}%` : '0%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{skill.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
