
import { CheckCircle } from "lucide-react";

const About = () => {
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
              <div className="border-l-4 border-portfolio-purple pl-4 py-2">
                <h4 className="text-xl font-semibold">Nalanda Institute of Technology</h4>
                <p className="text-gray-600 dark:text-gray-400">Bachelor of Technology in Computer Science</p>
                <p className="text-sm text-gray-500">2022 - 2026</p>
              </div>
              
              <div className="border-l-4 border-portfolio-purple pl-4 py-2">
                <h4 className="text-xl font-semibold">Bhadrak Autonomous College</h4>
                <p className="text-gray-600 dark:text-gray-400">+2, Science</p>
                <p className="text-sm text-gray-500">2020 - 2022</p>
              </div>
              
              <div className="border-l-4 border-portfolio-purple pl-4 py-2">
                <h4 className="text-xl font-semibold">SSVM Bouth</h4>
                <p className="text-gray-600 dark:text-gray-400">10th, BSE (75%)</p>
                <p className="text-sm text-gray-500">2020</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-8 reveal">
            <h3 className="text-2xl font-bold mb-6 text-portfolio-purple">Professional Experience</h3>
            
            <div className="space-y-6">
              <div className="border-l-4 border-portfolio-teal pl-4 py-2">
                <h4 className="text-xl font-semibold">Campus Executive Officer</h4>
                <p className="text-gray-600 dark:text-gray-400">Coding Ninjas 10X Club</p>
                <p className="text-sm text-gray-500">Dec 2024 - Present</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-portfolio-teal mr-2 flex-shrink-0 mt-0.5" />
                    <span>Team Leadership and Management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-portfolio-teal mr-2 flex-shrink-0 mt-0.5" />
                    <span>Event Organization and Planning</span>
                  </li>
                </ul>
              </div>
              
              <div className="border-l-4 border-portfolio-teal pl-4 py-2">
                <h4 className="text-xl font-semibold">President</h4>
                <p className="text-gray-600 dark:text-gray-400">TECHXERA</p>
                <p className="text-sm text-gray-500">Jun 2024 - Present</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-portfolio-teal mr-2 flex-shrink-0 mt-0.5" />
                    <span>Led 20+ members organizing 10+ coding workshops</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-portfolio-teal mr-2 flex-shrink-0 mt-0.5" />
                    <span>Conducted Python & AI masterclasses for 200+ students</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
