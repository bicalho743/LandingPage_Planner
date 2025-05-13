import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Planner Organizer completely transformed my business. I've saved at least 5 hours a week on admin tasks and can now focus on what I love - helping clients get organized!",
    name: "Emily Peterson",
    role: "Professional Organizer, Tidy Spaces",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "The project templates and client management features are game changers. I've been able to take on 30% more clients while maintaining my high service standards.",
    name: "Marcus Williams",
    role: "Owner, Order & Method Organizing",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "Since implementing Planner Organizer, I've seen a 40% increase in revenue. The invoicing system and time tracking have helped me price my services more accurately.",
    name: "Sofia Chen",
    role: "Founder, Organize with Purpose",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "As someone who helps others get organized, I needed a system that practiced what I preached. Planner Organizer is intuitive, beautiful, and makes me look professional.",
    name: "David Thompson",
    role: "CEO, Clear Space Organizing",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "The customer support team is incredible! They helped me customize my workflow to match my unique approach to home organization projects.",
    name: "Aisha Johnson",
    role: "Professional Organizer, Simply Organized Life",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "I love that I can access my entire client database, project plans, and schedules from my phone when I'm on-site with clients. It's revolutionized my workflow.",
    name: "Carlos Rodriguez",
    role: "Owner, Streamline Organization Services",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-1 text-primary font-medium mb-4">
            <Star className="h-4 w-4 mr-2 fill-amber-400 text-amber-400" />
            <span>Trusted by 2,500+ Professional Organizers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Hear From Our Community
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how Planner Organizer has helped professional organizers streamline their businesses and achieve remarkable results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white rounded-xl shadow-sm border-gray-100 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="mb-6 relative">
                  <Quote className="absolute text-gray-200 h-8 w-8 -left-1 -top-2 z-0 opacity-60" />
                  <p className="text-gray-700 relative z-10 text-sm md:text-base">"{testimonial.text}"</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
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
