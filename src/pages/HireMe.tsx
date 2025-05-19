
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Send, Calendar, Clock, Video } from "lucide-react";

const HireMe = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Request Submitted",
        description: "Thank you for your interest! I'll get back to you within 24 hours.",
      });
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-portfolio-soft-teal to-white py-16">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-white/50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Portfolio
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Hire Me</h1>
            <div className="w-20 h-1 bg-portfolio-teal mx-auto mb-8 rounded-full"></div>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              I'm currently available for freelance work and exciting opportunities. 
              Please fill out the form below to get in touch about your project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 reveal">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-portfolio-purple">Project Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Your Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Company (Optional)
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="projectType" className="text-sm font-medium text-gray-700">
                        Project Type
                      </label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-portfolio-teal"
                        required
                      >
                        <option value="" disabled>Select project type</option>
                        <option value="Website Development">Website Development</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Software Development">Software Development</option>
                        <option value="AI/ML Project">AI/ML Project</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="budget" className="text-sm font-medium text-gray-700">
                        Budget Range (USD)
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-portfolio-teal"
                        required
                      >
                        <option value="" disabled>Select budget range</option>
                        <option value="Less than $1,000">Less than $1,000</option>
                        <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000+">$10,000+</option>
                        <option value="Not sure yet">Not sure yet</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="timeline" className="text-sm font-medium text-gray-700">
                      Project Timeline
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-portfolio-teal"
                      required
                    >
                      <option value="" disabled>Select timeline</option>
                      <option value="Less than 1 month">Less than 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Project Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please describe your project in detail..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-portfolio-purple hover:bg-portfolio-purple/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-1 reveal">
              <div className="glass-card p-8 space-y-8">
                <h2 className="text-2xl font-bold mb-6 text-portfolio-purple">Schedule a Call</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Prefer to discuss your project directly? Schedule a free 30-minute consultation call.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Calendar className="h-5 w-5 text-portfolio-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Select a Date</h3>
                      <p className="text-sm text-gray-600">Flexible availability on weekdays</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Clock className="h-5 w-5 text-portfolio-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Choose a Time</h3>
                      <p className="text-sm text-gray-600">Time slots available in your timezone</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Video className="h-5 w-5 text-portfolio-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Video Platform</h3>
                      <p className="text-sm text-gray-600">Google Meet, Zoom, or Microsoft Teams</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-portfolio-teal hover:bg-portfolio-teal/90 mt-4">
                  Schedule Consultation
                </Button>
                
                <div className="text-center pt-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">
                    I'll respond to your inquiry within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireMe;
