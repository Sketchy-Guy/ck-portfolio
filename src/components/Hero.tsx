import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Github, Linkedin, Mail, Twitter, Instagram, Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://lvjfqefqrmgzwkhtknbj.supabase.co";
const BUCKET = "portfolio"; // Bucket name
const FOLDER = "profile_photo"; // Folder inside the bucket

const Hero = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [typedText, setTypedText] = useState("");

  // Fetch the profile image directly from Supabase
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile") // Replace "users" with your actual table name
          .select("profile_image")
          .eq("id", "10f6f545-cd03-4b5f-bbf4-96dc44158959") // Replace with the correct user ID or condition
          .single();

        if (error) {
          console.error("Error fetching profile image:", error.message);
          setProfileImage(null);
        } else if (data?.profile_image) {
          const imageUrl = data.profile_image.startsWith("http")
            ? `${data.profile_image}?t=${Date.now()}`
            : `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${data.profile_image}?t=${Date.now()}`;
          setProfileImage(imageUrl);
        }
      } catch (err) {
        console.error("Error fetching profile image:", err);
        setProfileImage(null);
      }
    };

    fetchProfileImage();
  }, []);

  // Typing effect for the title
  useEffect(() => {
    const fullText = "Software Developer | Python | AI | JavaScript";
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center pt-16 md:pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10 md:gap-16 lg:gap-24">
          <div className="w-full lg:w-1/2 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-medium text-portfolio-teal mb-2 leading-relaxed">
              Hello, I'm
            </h3>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 gradient-text leading-tight">
              Chinmay Kumar Panda
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-6 leading-relaxed break-words">
              {typedText}
              <span className="ml-1 inline-block w-2 h-full bg-portfolio-purple animate-pulse"></span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-lg leading-loose break-words">
              Aspiring software developer with expertise in Python, JavaScript, and AI. Passionate about building scalable applications and leveraging AI tools to improve productivity.
            </p>
          </div>

          <div className="w-full lg:w-1/2 relative z-10 mb-8 lg:mb-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-xs sm:max-w-md max-h-xs sm:max-h-md z-10">
              <div className="w-full h-full rounded-full bg-portfolio-purple opacity-5 animate-spin-slow blur-3xl"></div>
            </div>
            <div className="w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto relative z-20 animate-float">
              {!imageLoaded && profileImage && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100">
                  <div className="animate-spin h-12 w-12 border-4 border-portfolio-purple border-t-transparent rounded-full"></div>
                </div>
              )}
              {profileImage && !imageError ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={`rounded-full object-cover border-4 border-white shadow-xl w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  onLoad={() => {
                    setImageLoaded(true);
                  }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
