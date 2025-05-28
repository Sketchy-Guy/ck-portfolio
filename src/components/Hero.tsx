import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Github, Linkedin, Twitter, Instagram, Facebook, Heart, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";
import "./HeroGradient.css";

// Supabase constants
const SUPABASE_URL = "https://lvjfqefqrmgzwkhtknbj.supabase.co";
const BUCKET = "portfolio";
const FOLDER = "profile_photo";
const PROFILE_ID = "10f6f545-cd03-4b5f-bbf4-96dc44158959";
const SITE_LIKES_ID = 1;
const LIKE_KEY = "site_like_given";
const VISIT_KEY = "site_visit_given";

const Hero = () => {
  // State for profile image, name, title, social links, email, like/visit counts, errors, and animation
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(""); // <-- NEW
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });
  const [emails, setEmails] = useState<string[]>([]); // <-- NEW
  const [likeCount, setLikeCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [likeError, setLikeError] = useState("");
  const [heartBeat, setHeartBeat] = useState(false);
  const [profileEmail, setProfileEmail] = useState(""); // <-- Add this

  // Fetch profile image, name, title, and email from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("profile_image, title, name, email")
          .eq("id", PROFILE_ID)
          .single();

        if (error) {
          console.error("Error fetching profile data:", error.message);
          setProfileImage(null);
        } else if (data) {
          if (data.profile_image) {
            const imageUrl = data.profile_image.startsWith("http")
              ? data.profile_image
              : `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${data.profile_image}`;
            setProfileImage(imageUrl);
          }
          setProfileTitle(data.title || "");
          setProfileName(data.name || "");
          setProfileEmail(data.email || ""); // <-- Set email
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setProfileImage(null);
      }
    };

    fetchProfileData();
  }, []);

  // Fetch social links from Supabase and map by platform
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("social_links")
          .select("platform, url")
          .eq("profile_id", PROFILE_ID);

        if (error) {
          console.error("Error fetching social links:", error.message);
          setSocialLinks({
            github: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            facebook: "",
          });
        } else if (data && Array.isArray(data)) {
          const links = { github: "", linkedin: "", twitter: "", instagram: "", facebook: "" };
          data.forEach((row) => {
            if (row.platform && links.hasOwnProperty(row.platform)) {
              links[row.platform] = row.url || "";
            }
          });
          setSocialLinks(links);
        }
      } catch (err) {
        console.error("Error fetching social links:", err);
        setSocialLinks({
          github: "",
          linkedin: "",
          twitter: "",
          instagram: "",
          facebook: "",
        });
      }
    };

    fetchSocialLinks();
  }, []);

  // Fetch emails from Supabase (assuming you have a table or field for emails)
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // Try to fetch from user_profile table, assuming 'emails' is a text[] or a single email field
        const { data, error } = await supabase
          .from("user_profile")
          .select("email")
          .eq("id", PROFILE_ID)
          .single();

        if (!error && data && data.email) {
          // If email is a string, wrap in array for consistency
          setEmails(Array.isArray(data.email) ? data.email : [data.email]);
        }
      } catch (err) {
        setEmails([]);
      }
    };
    fetchEmails();
  }, []);

  // Fetch like and visit counts from Supabase
  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("site_likes" as any)
        .select("count, visits")
        .eq("id", SITE_LIKES_ID)
        .single();
      if (!error && data) {
        setLikeCount((data as any).count || 0);
        setVisitCount((data as any).visits || 0);
      }
    };
    fetchCounts();
  }, []);

  // Live polling for visitors count every 5 seconds
  useEffect(() => {
    const fetchVisitors = async () => {
      const { data, error } = await supabase
        .from("site_likes" as any)
        .select("visits")
        .eq("id", SITE_LIKES_ID)
        .single();
      if (!error && data) {
        setVisitCount((data as any).visits || 0);
      }
    };
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Increment visit count only once per device (localStorage + cookie)
  useEffect(() => {
    const alreadyVisited = localStorage.getItem(VISIT_KEY) || Cookies.get(VISIT_KEY);
    if (!alreadyVisited) {
      const incrementVisits = async () => {
        const { data, error } = await supabase
          .from("site_likes" as any)
          .select("visits")
          .eq("id", SITE_LIKES_ID)
          .single();
        if (!error && data) {
          const latestVisits = (data as any).visits || 0;
          await supabase
            .from("site_likes" as any)
            .update({ visits: latestVisits + 1 })
            .eq("id", SITE_LIKES_ID);
          localStorage.setItem(VISIT_KEY, "1");
          Cookies.set(VISIT_KEY, "1", { expires: 365 });
        }
      };
      incrementVisits();
    }
    // eslint-disable-next-line
  }, [visitCount]);

  // Typing effect for the profile title
  useEffect(() => {
    if (!profileTitle) return;
    let currentIndex = 0;
    setTypedText(""); // reset before typing
    const typingInterval = setInterval(() => {
      if (currentIndex < profileTitle.length) {
        setTypedText(profileTitle.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [profileTitle]);

  // Like button handler: prevent multiple likes per device (localStorage + cookie)
  const handleLike = async () => {
    setLikeError("");
    const alreadyLiked = localStorage.getItem(LIKE_KEY) || Cookies.get(LIKE_KEY);
    if (alreadyLiked) {
      setLikeError("Multiple likes from the same device are not allowed");
      return;
    }
    const { data, error } = await supabase
      .from("site_likes" as any)
      .update({ count: likeCount + 1 })
      .eq("id", SITE_LIKES_ID)
      .select()
      .single();
    if (!error && data) {
      setLikeCount((data as any).count);
      localStorage.setItem(LIKE_KEY, "1");
      Cookies.set(LIKE_KEY, "1", { expires: 365 });
    }
  };

  // Animate heart on page load
  useEffect(() => {
    setHeartBeat(true);
    const timeout = setTimeout(() => setHeartBeat(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      className="min-h-screen flex flex-col justify-center pt-8 sm:pt-12 md:pt-20 pb-8 bg-white dark:bg-portfolio-dark-blue"
    >
      <div className="w-full px-2 sm:px-4 md:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-10 md:gap-16 lg:gap-24 w-full">
          {/* Left: Text and Socials */}
          <div className="w-full lg:w-1/2 animate-fade-in">
            <h3 className="text-base sm:text-lg md:text-2xl font-medium text-portfolio-teal mb-2 leading-relaxed">
              Hello, I'm
            </h3>
            <h1
              className="animated-gradient-text text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 break-words w-full"
              style={{
                lineHeight: "1.1",
                wordBreak: "break-word",
                whiteSpace: "pre-line", // allow dynamic line breaks
                letterSpacing: "0.01em",
              }}
            >
              {profileName || "Loading..."}
            </h1>
            <h2 className="text-sm sm:text-lg md:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-6 leading-relaxed break-words w-full">
              {typedText}
              <span className="ml-1 inline-block w-2 h-full bg-portfolio-purple animate-pulse"></span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-full leading-loose break-words">
              Aspiring software developer with expertise in Python, JavaScript, and AI. Passionate about building scalable applications and leveraging AI tools to improve productivity.
            </p>
            {/* Social Media Icons - wrap and space on all screens */}
            <div className="flex flex-wrap gap-4 mb-8 w-full">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Github size={24} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Linkedin size={24} />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Twitter size={24} />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Instagram size={24} />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Facebook size={24} />
                </a>
              )}
              {/* Email Icon */}
              {profileEmail && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${profileEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Email"
                  className="text-gray-600 hover:text-portfolio-purple transition-colors"
                >
                  <Mail size={24} />
                </a>
              )}
            </div>
          </div>
          {/* Right: Profile Image, Like & Visitor Counter */}
          <div className="w-full lg:w-1/2 relative z-10 mb-8 lg:mb-0 flex flex-col items-center gap-y-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[10rem] sm:max-w-[14rem] md:max-w-[18rem] lg:max-w-[20rem] max-h-[10rem] sm:max-h-[14rem] md:max-h-[18rem] lg:max-h-[20rem] z-0 pointer-events-none">
              <div className="w-full h-full rounded-full bg-portfolio-purple opacity-5 animate-spin-slow blur-3xl"></div>
            </div>
            {/* Profile image with higher z-index, responsive size */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 mx-auto relative z-10 animate-float">
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
            {/* Like & Visitor Counter - small pill, responsive */}
            <div className="flex flex-wrap items-center justify-center mt-4 z-20 w-full">
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-full shadow-lg border border-white/30 w-full max-w-[8rem] sm:max-w-[10rem] mx-auto"
                style={{
                  background: "rgba(255,255,255,0.35)",
                  WebkitBackdropFilter: "blur(12px)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <button
                  onClick={handleLike}
                  className="flex items-center focus:outline-none"
                  style={{ touchAction: "manipulation" }}
                >
                  <Heart
                    className={`text-portfolio-purple mr-2 transition-transform duration-200 ${heartBeat ? "animate-heartbeat" : ""}`}
                    size={24}
                  />
                  <span className="font-semibold text-gray-700">{likeCount}</span>
                </button>
                <span className="ml-2 text-gray-500 text-sm whitespace-nowrap">Visitors: {visitCount}</span>
              </div>
              {likeError && (
                <span className="ml-4 text-red-500 text-sm">{likeError}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
