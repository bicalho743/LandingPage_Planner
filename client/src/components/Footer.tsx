import { ClipboardCheck, Twitter, Linkedin, Facebook, Instagram, Mail, Phone } from "lucide-react";
import { scrollToSection } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const productLinks = [
  { text: "Features", href: "#features" },
  { text: "Pricing", href: "#pricing" },
  { text: "Testimonials", href: "#testimonials" },
  { text: "FAQ", href: "#" }
];

const resources = [
  { text: "Blog", href: "#" },
  { text: "Help Center", href: "#" },
  { text: "Organizing Tips", href: "#" },
  { text: "Webinars", href: "#" }
];

const company = [
  { text: "About Us", href: "#about" },
  { text: "Contact", href: "#contact" },
  { text: "Careers", href: "#" },
  { text: "Partners", href: "#" }
];

const legal = [
  { text: "Privacy Policy", href: "#" },
  { text: "Terms of Service", href: "#" },
  { text: "Cookie Policy", href: "#" },
  { text: "GDPR Compliance", href: "#" }
];

const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
  { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
  { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
  { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" }
];

export default function Footer() {
  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.replace("#", ""));
    }
  };
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          <div className="md:w-1/3">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-1.5 mr-2">
                <ClipboardCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Planner<span className="text-blue-300">Organizer</span>
              </span>
            </div>
            <p className="text-gray-400 mb-8">
              Helping professional organizers streamline their business, manage clients, and boost productivity with elegant digital tools.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <Mail className="text-blue-400 h-4 w-4 mr-3" />
                <a href="mailto:support@plannerorganizer.com" className="text-gray-300 hover:text-white transition-all">
                  support@plannerorganizer.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="text-blue-400 h-4 w-4 mr-3" />
                <a href="tel:+18005551234" className="text-gray-300 hover:text-white transition-all">
                  1-800-555-1234
                </a>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href}
                  aria-label={link.label}
                  className="bg-gray-800 hover:bg-primary p-2 rounded-full text-gray-400 hover:text-white transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:w-2/3">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                      className="text-gray-400 hover:text-blue-300 transition-all text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2">
                {resources.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-300 transition-all text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                {company.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault();
                          handleLinkClick(link.href);
                        }
                      }}
                      className="text-gray-400 hover:text-blue-300 transition-all text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                {legal.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-300 transition-all text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Planner Organizer. All rights reserved.
          </p>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleLinkClick("#pricing")}
              className="bg-primary hover:bg-primary/90 text-white text-sm h-9"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
