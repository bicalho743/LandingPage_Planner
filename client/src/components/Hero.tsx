import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

export default function Hero() {
  return (
    <section id="hero" className="pt-28 pb-20 md:pt-32 md:pb-24">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Elevate Your Business to New Heights
            </h1>
            <p className="text-lg text-gray-600 mb-8 md:pr-10">
              Innovative solutions that drive growth, streamline operations, and transform your business for the digital era.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => scrollToSection("contact")}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 h-auto"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => scrollToSection("features")}
                variant="outline"
                className="border border-gray-300 hover:border-primary text-dark hover:text-primary px-6 py-3 h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Team collaborating in modern office" 
              className="rounded-xl shadow-lg w-full h-auto object-cover" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
