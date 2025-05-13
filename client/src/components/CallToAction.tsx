import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-accent">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Organizing Business?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of professional organizers who've transformed their businesses with Planner Organizer.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <span className="text-white text-sm">No credit card required for free plan</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <span className="text-white text-sm">14-day free trial on paid plans</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <span className="text-white text-sm">Cancel anytime</span>
            </div>
          </div>
          
          <Button 
            onClick={() => scrollToSection("pricing")}
            className="bg-white hover:bg-gray-100 text-primary px-8 py-4 h-auto font-semibold text-lg group"
          >
            Get Started Today <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
