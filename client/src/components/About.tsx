import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

// Stats data
const stats = [
  { value: "500+", label: "Clients Worldwide" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Expert Support" },
  { value: "15+", label: "Years of Experience" }
];

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <img 
              src="https://images.unsplash.com/photo-1603201667141-5a2d4c673378?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern office with collaborative workspace" 
              className="rounded-xl shadow-lg w-full h-auto object-cover" 
            />
          </div>
          <div className="md:w-1/2 md:pl-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              At ModernBiz, we're committed to empowering businesses of all sizes with innovative technology solutions that drive growth and success.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Founded in 2015, we've helped over 500 companies transform their operations and achieve remarkable results through our expertise and cutting-edge solutions.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => scrollToSection("contact")}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 h-auto"
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
