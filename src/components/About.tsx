
import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AboutEntry {
  id: string;
  order?: number;
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  period?: string;
}

const About = () => {
  const [educationEntries, setEducationEntries] = useState<AboutEntry[]>([]);
  const [experienceEntries, setExperienceEntries] = useState<AboutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const { data, error } = await supabase
          .from('about_me')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('Error fetching about data:', error);
          return;
        }

        if (data) {
          const education = data.filter(entry => entry.type === 'education');
          const experience = data.filter(entry => entry.type === 'experience');
          
          setEducationEntries(education);
          setExperienceEntries(experience);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const renderEntries = (entries: AboutEntry[], borderColor: string) => {
    if (entries.length === 0) {
      return (
        <div className="border-l-4 border-gray-300 pl-4 py-2">
          <p className="text-gray-500">No entries available</p>
        </div>
      );
    }

    return entries.map((entry) => (
      <div key={entry.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
        <h4 className="text-xl font-semibold">{entry.title}</h4>
        <p className="text-gray-600 dark:text-gray-400">{entry.subtitle}</p>
        <p className="text-sm text-gray-500">{entry.period}</p>
        {entry.description && (
          <div className="mt-2">
            {entry.description.split('\n').map((line, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-portfolio-teal mr-2 flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-white to-portfolio-soft-teal/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="text-center">Loading about information...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-white to-portfolio-soft-teal/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About Me</h2>
          <div className="w-20 h-1 bg-portfolio-teal mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-700 dark:text-gray-300">
            I'm a passionate and results-driven software developer specializing in Python, 
            JavaScript, and AI development. Currently pursuing my B.Tech in Computer Science 
            at Nalanda Institute of Technology, Bhubaneswar.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="glass-card p-8 reveal">
            <h3 className="text-2xl font-bold mb-6 text-portfolio-purple">Education</h3>
            <div className="space-y-6">
              {renderEntries(educationEntries, 'border-portfolio-purple')}
            </div>
          </div>
          
          <div className="glass-card p-8 reveal">
            <h3 className="text-2xl font-bold mb-6 text-portfolio-purple">Professional Experience</h3>
            <div className="space-y-6">
              {renderEntries(experienceEntries, 'border-portfolio-teal')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;