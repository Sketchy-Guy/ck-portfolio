import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
	{ title: "Home", href: "#" },
	{ title: "About", href: "#about" },
	{ title: "Skills", href: "#skills" },
	{ title: "Projects", href: "#projects" },
	{ title: "Contact", href: "#contact" },
];

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [activeSection, setActiveSection] = useState("Home");

	useEffect(() => {
		const handleScroll = () => {
			setScrollPosition(window.scrollY);

			// Simple active section detection (improve as needed)
			const offsets = navLinks.map((link) => {
				const el = document.querySelector(link.href);
				return el instanceof HTMLElement ? el.offsetTop : 0;
			});
			const scroll = window.scrollY + 80; // adjust offset for navbar height
			let current = "Home";
			for (let i = 0; i < offsets.length; i++) {
				if (scroll >= offsets[i]) current = navLinks[i].title;
			}
			setActiveSection(current);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<header
				className="sticky top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-lg"
				style={{
					background: "rgba(255,255,255,0.35)",
					WebkitBackdropFilter: "blur(12px)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid rgba(0,0,0,0.05)",
				}}
			>
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center">
						<a
							href="#"
							className="text-2xl font-bold text-portfolio-purple transition-colors duration-300"
						>
							CK<span className="text-portfolio-teal">Panda</span>
						</a>

						{/* Desktop Nav */}
						<nav className="hidden md:flex items-center space-x-8 relative">
							{navLinks.map((link, index) => (
								<a
									key={index}
									href={link.href}
									className={`relative transition-colors duration-300 pb-1 ${
										activeSection === link.title
											? "text-portfolio-purple font-semibold"
											: "text-gray-800 dark:text-gray-200"
									}`}
									onClick={() => setActiveSection(link.title)}
								>
									{link.title}
									{/* Sliding underline */}
									<span
										className={`absolute left-0 -bottom-0.5 h-0.5 rounded bg-portfolio-purple transition-all duration-300 ${
											activeSection === link.title ? "w-full" : "w-0"
										}`}
										style={{ height: "2px" }}
									/>
								</a>
							))}

							<Button
								className="bg-portfolio-purple hover:bg-portfolio-purple/90"
								onClick={() => (window.location.href = "#contact")}
							>
								Hire Me
							</Button>
						</nav>

						{/* Mobile Menu Button */}
						<button
							className="md:hidden text-portfolio-purple"
							onClick={() => setIsMenuOpen(true)}
							aria-label="Open mobile menu"
						>
							<Menu size={24} />
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Menu rendered outside header for stacking context */}
			{isMenuOpen && (
				<div
					className="fixed inset-0 z-[9999] w-full h-full flex flex-col p-6 md:hidden transition-transform duration-300 ease-in-out overflow-y-auto"
					style={{
						background: "rgba(255,255,255,0.92)",
						WebkitBackdropFilter: "blur(16px)",
						backdropFilter: "blur(16px)",
					}}
				>
					<div className="flex justify-between items-center mb-8">
						<a href="#" className="text-2xl font-bold text-portfolio-purple">
							CK<span className="text-portfolio-teal">Panda</span>
						</a>
						<button
							className="text-portfolio-purple"
							onClick={() => setIsMenuOpen(false)}
							aria-label="Close mobile menu"
						>
							<X size={24} />
						</button>
					</div>
					<nav className="flex flex-col space-y-6">
						{navLinks.map((link, index) => (
							<a
								key={index}
								href={link.href}
								className={`text-xl text-gray-900 transition-colors ${
									activeSection === link.title
										? "text-portfolio-purple font-semibold"
										: "text-gray-900"
								}`}
								onClick={() => {
									setIsMenuOpen(false);
									setActiveSection(link.title);
								}}
							>
								{link.title}
							</a>
						))}

						<Button
							className="bg-portfolio-purple hover:bg-portfolio-purple/90 w-full mt-4 text-white"
							onClick={() => {
								setIsMenuOpen(false);
								window.location.href = "#contact";
							}}
						>
							Hire Me
						</Button>
					</nav>
				</div>
			)}
		</>
	);
};

export default Header;
