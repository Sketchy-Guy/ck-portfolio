import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  name: string;
  category: string;
  level: number;
}

const PROFILE_ID = "10f6f545-cd03-4b5f-bbf4-96dc44158959";

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [isAnimated, setIsAnimated] = useState(false);

  // Fetch skills from Supabase
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("name, category, level")
        .eq("profile_id", PROFILE_ID);

      if (!error && data) {
        setSkills(data);
      }
    };
    fetchSkills();
  }, []);

  // Categories based on fetched skills
  const categories = ["All", ...Array.from(new Set(skills.map(skill => skill.category)))];

  // Filter skills by category
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredSkills(skills);
    } else {
      setFilteredSkills(skills.filter(skill => skill.category === activeCategory));
    }

    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [activeCategory, skills]);

  useEffect(() => {
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
