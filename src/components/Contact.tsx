import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CONTACT_ID = "10f6f545-cd03-4b5f-bbf4-96dc44158959";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch contact info from Supabase
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data, error } = await supabase
        .from("user_profile")
        .select("email, phone, location")
        .eq("id", CONTACT_ID)
        .single();

      if (!error && data) {
        setContactInfo({
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
        });
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message! I'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Get In Touch</h2>
          <div className="w-20 h-1 bg-portfolio-teal mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-700 dark:text-gray-300">
            Feel free to reach out to me for any inquiries, collaboration opportunities, 
            or just to say hello!
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8 reveal">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-portfolio-purple">Contact Information</h3>
              <div className="space-y-6">
                <a 
                  href={`mailto:${contactInfo.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="p-3 bg-portfolio-purple/10 rounded-full text-portfolio-purple group-hover:bg-portfolio-purple group-hover:text-white transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Email</h4>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-portfolio-purple transition-colors">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="p-3 bg-portfolio-purple/10 rounded-full text-portfolio-purple group-hover:bg-portfolio-purple group-hover:text-white transition-colors">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Phone</h4>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-portfolio-purple transition-colors">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="p-3 bg-portfolio-purple/10 rounded-full text-portfolio-purple group-hover:bg-portfolio-purple group-hover:text-white transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-portfolio-purple transition-colors">
                      {contactInfo.location}
                    </p>
                  </div>
                </a>
              </div>
              <div className="mt-8">
                <Button 
                  className="w-full bg-portfolio-purple hover:bg-portfolio-purple/90"
                  onClick={() => {
                    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Chinmay Kumar Panda
TEL;TYPE=CELL:${contactInfo.phone}
EMAIL:${contactInfo.email}
ADR;TYPE=HOME:;;${contactInfo.location}
END:VCARD`;

                    const blob = new Blob([vcardData], { type: 'text/vcard' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'chinmay_kumar_panda.vcf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast({
                      title: "Contact Details Downloaded",
                      description: "Contact details have been downloaded successfully!",
                    });
                  }}
                >
                  Download Contact Details
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 reveal">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-portfolio-purple">Send Me a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="contact-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="contact-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can I help you?"
                    required
                    className="contact-input"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    rows={5}
                    required
                    className="contact-input resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-portfolio-purple hover:bg-portfolio-purple/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
