import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";
import { Calendar, Check, ClipboardList } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" className="pt-28 pb-20 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 to-violet-50">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-1 text-primary font-medium mb-4">
              <span className="mr-2">✨</span>
              <span>The Ultimate Tool for Personal Organizers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Organize, Plan, Succeed with Planner Organizer
            </h1>
            <p className="text-lg text-gray-600 mb-8 md:pr-10">
              The all-in-one system designed for professional organizers to streamline operations, manage clients, and boost productivity with elegant organization tools.
            </p>
            
            <div className="mb-8">
              <div className="flex items-start space-x-2 mb-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-gray-700">Client management with customizable projects</p>
              </div>
              <div className="flex items-start space-x-2 mb-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-gray-700">Task organization with priority settings</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 bg-green-100 p-1 rounded-full">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-gray-700">Simple invoicing and time tracking</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => scrollToSection("lead-form")}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 h-auto text-lg"
              >
                Get Started Free
              </Button>
              <Button 
                onClick={() => scrollToSection("pricing")}
                variant="outline"
                className="border border-gray-300 hover:border-primary text-dark hover:text-primary px-6 py-3 h-auto text-lg"
              >
                View Pricing
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-100 rounded-lg flex items-center justify-center z-10">
              <Calendar className="h-10 w-10 text-yellow-600" />
            </div>
            
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center z-10">
              <ClipboardList className="h-10 w-10 text-blue-600" />
            </div>
            
            <img 
              src="https://images.unsplash.com/photo-1584717517833-46c9f6b55b02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional organizer using digital planner" 
              className="rounded-xl shadow-lg w-full h-auto object-cover border-4 border-white relative z-0" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
