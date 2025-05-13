import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join hundreds of companies already growing with our innovative solutions.
          </p>
          <Button 
            onClick={() => scrollToSection("contact")}
            className="bg-white hover:bg-gray-100 text-primary px-8 py-4 h-auto font-semibold text-lg"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
}
