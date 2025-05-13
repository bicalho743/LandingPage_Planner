import { Box, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { scrollToSection } from "@/lib/utils";

const quickLinks = [
  { text: "Features", href: "#features" },
  { text: "About Us", href: "#about" },
  { text: "Testimonials", href: "#testimonials" },
  { text: "Contact", href: "#contact" }
];

const resources = [
  { text: "Blog", href: "#" },
  { text: "Case Studies", href: "#" },
  { text: "Documentation", href: "#" },
  { text: "Help Center", href: "#" }
];

const legal = [
  { text: "Privacy Policy", href: "#" },
  { text: "Terms of Service", href: "#" },
  { text: "Cookie Policy", href: "#" },
  { text: "GDPR Compliance", href: "#" }
];

const socialLinks = [
  { icon: <Twitter className="text-lg" />, href: "#" },
  { icon: <Linkedin className="text-lg" />, href: "#" },
  { icon: <Facebook className="text-lg" />, href: "#" },
  { icon: <Instagram className="text-lg" />, href: "#" }
];

export default function Footer() {
  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.replace("#", ""));
    }
  };
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center mb-6">
              <Box className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold">ModernBiz</span>
            </div>
            <p className="text-gray-400 mb-6">
              Innovative solutions that drive business growth and transformation.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href);
                    }}
                    className="text-gray-400 hover:text-white transition-all"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-all"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Legal</h3>
            <ul className="space-y-3">
              {legal.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-all"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <p className="text-gray-400 text-center">© {new Date().getFullYear()} ModernBiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
