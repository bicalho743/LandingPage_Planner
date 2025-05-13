import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "ModernBiz transformed our operations completely. Their solution streamlined our processes and helped us increase productivity by 35% in just three months.",
    name: "Sarah Johnson",
    role: "CEO, TechForward",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "The customer service at ModernBiz is exceptional. Their team was with us every step of the way, ensuring we maximized the value of their platform.",
    name: "Michael Roberts",
    role: "CTO, GrowthNow",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "Implementing ModernBiz's platform was the best business decision we made last year. We've seen a 28% increase in revenue and significantly improved our customer satisfaction.",
    name: "Jennifer Chen",
    role: "COO, InnovateCorp",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our solutions have helped businesses like yours achieve remarkable results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white rounded-xl shadow-md transition-all hover:shadow-lg border-none">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
