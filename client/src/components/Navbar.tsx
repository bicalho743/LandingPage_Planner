import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, scrollToSection } from "@/lib/utils";
import { Box, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { text: "Features", href: "#features" },
  { text: "About", href: "#about" },
  { text: "Testimonials", href: "#testimonials" },
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
      "fixed w-full bg-white bg-opacity-95 z-50 transition-all duration-200",
      isScrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <Box className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">ModernBiz</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-gray-600 hover:text-primary font-medium transition-all"
              >
                {link.text}
              </a>
            ))}
          </nav>
          
          <div className="hidden md:block">
            <Button 
              onClick={() => handleNavClick("#contact")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Get Started
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
              <nav className="flex flex-col gap-4 mt-8">
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
                <Button 
                  onClick={() => handleNavClick("#contact")}
                  className="bg-primary hover:bg-primary/90 text-white mt-4 w-full"
                >
                  Get Started
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
