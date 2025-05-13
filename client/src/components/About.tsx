import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

// Stats data
const stats = [
  { value: "2,500+", label: "Active Organizers" },
  { value: "99%", label: "Customer Satisfaction" },
  { value: "85%", label: "Time Saved on Admin" },
  { value: "5+", label: "Years of Excellence" }
];

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <img 
              src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional organizer using digital planning tools" 
              className="rounded-xl shadow-lg w-full h-auto object-cover" 
            />
          </div>
          <div className="md:w-1/2 md:pl-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Planner Organizer
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Created by professional organizers for professional organizers, our platform streamlines your business operations so you can focus on what you do best: helping clients get organized.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Since launching in 2020, we've become the trusted solution for over 2,500 professional organizers worldwide, helping them save time, increase client satisfaction, and grow their businesses.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => scrollToSection("pricing")}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 h-auto"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
