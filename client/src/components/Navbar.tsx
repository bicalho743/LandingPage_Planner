import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, scrollToSection } from "@/lib/utils";
import { ClipboardCheck, Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { text: "Features", href: "#features" },
  { text: "Pricing", href: "#pricing" },
  { text: "Testimonials", href: "#testimonials" },
  { text: "About", href: "#about" },
  { text: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setSheetOpen(false);
    scrollToSection(href.replace("#", ""));
  };

  return (
    <header className={cn(
      "fixed w-full bg-white bg-opacity-98 z-50 transition-all duration-200",
      isScrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-1.5 mr-2">
                <ClipboardCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Planner<span className="text-gray-800">Organizer</span>
              </span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-gray-600 hover:text-primary font-medium transition-all text-sm"
              >
                {link.text}
              </a>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => handleNavClick("#lead-form")}
              className="border-gray-300 hover:border-primary text-gray-700 hover:text-primary"
            >
              Try Free
            </Button>
            <Button 
              onClick={() => handleNavClick("#pricing")}
              className="bg-primary hover:bg-primary/90 text-white group"
            >
              View Plans <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex items-center mt-6 mb-6">
                <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-1.5 mr-2">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Planner<span className="text-gray-800">Organizer</span>
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="text-gray-600 hover:text-primary font-medium transition-all py-2"
                  >
                    {link.text}
                  </a>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleNavClick("#lead-form")}
                    className="w-full border-gray-300 hover:border-primary text-gray-700 hover:text-primary"
                  >
                    Try Free
                  </Button>
                  <Button 
                    onClick={() => handleNavClick("#pricing")}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    View Plans
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
