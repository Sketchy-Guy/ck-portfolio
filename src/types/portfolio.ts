
export interface UserData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profileImage?: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

export interface SkillData {
  name: string;
  category: string;
  level: number;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  demo?: string;
}

export interface CertificationData {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential: string;
  link?: string;
  logo: string;
}

export interface PortfolioData {
  user: UserData;
  skills: SkillData[];
  projects: ProjectData[];
  certifications: CertificationData[];
}

// Default data for the portfolio
export const defaultData: PortfolioData = {
  user: {
    name: "Chinmay Kumar Panda",
    title: "Software Developer | Python | AI | JavaScript",
    email: "chinmaykumarpanda004@gmail.com",
    phone: "+91 7815014638",
    location: "Bhubaneswar, Odisha, India",
    bio: "Aspiring software developer with expertise in Python, JavaScript, and AI. Passionate about building scalable applications and leveraging AI tools to improve productivity.",
    profileImage: "/lovable-uploads/78295e37-4b4d-4900-b613-21ed6626ab3f.png",
    social: {
      github: "https://github.com/chinmaykumarpanda",
      linkedin: "https://linkedin.com/in/chinmay-kumar-panda",
      twitter: "#",
      instagram: "#",
      facebook: "#"
    }
  },
  skills: [
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
    { name: "Data Structures", category: "Technical Skills", level: 85 },
    { name: "Algorithms", category: "Technical Skills", level: 80 },
    { name: "AI Prompting", category: "AI & ML", level: 90 },
    { name: "OpenAI/Gemini APIs", category: "AI & ML", level: 85 },
    { name: "Machine Learning", category: "AI & ML", level: 75 },
    { name: "Team Leadership", category: "Soft Skills", level: 90 },
    { name: "Communication", category: "Soft Skills", level: 85 },
  ],
  projects: [
    {
      id: "1",
      title: "AI-Powered Symptom Checker",
      description: "Developed an AI-powered symptom checker that analyzes user health data and predicts potential diseases using Python, AI, ML, and Gemini AI.",
      technologies: ["Python", "AI", "ML", "Gemini AI"],
      image: "/lovable-uploads/84ae8bec-4c2f-4a49-94cf-34673064b572.png",
      github: "https://github.com/chinmaykumarpanda/ai-symptom-checker",
    },
    {
      id: "2",
      title: "Coding Ninjas Platform",
      description: "Contributed to the Coding Ninjas developer club platform, organizing workshops and hackathons for students.",
      technologies: ["React", "Node.js", "MongoDB", "JavaScript"],
      image: "/lovable-uploads/1480455c-5be4-41bc-891a-58010ebc836f.png",
      github: "https://github.com/chinmaykumarpanda/coding-ninjas",
      demo: "https://coding-ninjas.com",
    },
    {
      id: "3",
      title: "Portfolio Website",
      description: "My personal portfolio website showcasing my projects, skills, and experience. Built with modern web technologies.",
      technologies: ["React", "Tailwind CSS", "TypeScript"],
      image: "/lovable-uploads/a5f88509-5d42-4d11-8b7c-6abe9e64cfd0.png",
      github: "https://github.com/chinmaykumarpanda/portfolio",
      demo: "#",
    },
  ],
  certifications: [
    {
      id: "1",
      title: "Crash Course on Python",
      issuer: "Google",
      date: "Jun 2024",
      credential: "JA55X9WMWGYK",
      link: "https://coursera.org/verify/JA55X9WMWGYK",
      logo: "/lovable-uploads/f9f301cf-7ee5-4609-845e-2f2afc316a9a.png",
    },
    {
      id: "2",
      title: "Python for Data Science",
      issuer: "IBM",
      date: "In Progress",
      credential: "In Progress",
      logo: "/lovable-uploads/bb075ae5-f91f-43e6-b800-4ad15066260c.png",
    },
    {
      id: "3",
      title: "Microsoft Cybersecurity Analyst",
      issuer: "Microsoft",
      date: "In Progress",
      credential: "In Progress",
      logo: "/lovable-uploads/84ae8bec-4c2f-4a49-94cf-34673064b572.png",
    },
  ]
};
