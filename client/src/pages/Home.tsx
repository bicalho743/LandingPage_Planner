import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import PricingPlans from "@/components/PricingPlans";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Planner Organizer - Professional Organization System</title>
        <meta name="description" content="The ultimate planner system for personal organizers. Streamline your business, manage clients, and boost productivity with our all-in-one solution." />
        <meta property="og:title" content="Planner Organizer - Professional Organization System" />
        <meta property="og:description" content="The ultimate planner system for personal organizers. Streamline your business, manage clients, and boost productivity with our all-in-one solution." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Navbar />
      
      <main>
        <Hero />
        <LeadCaptureForm />
        <Features />
        <PricingPlans />
        <About />
        <Testimonials />
        <CallToAction />
        <ContactForm />
      </main>
      
      <Footer />
    </>
  );
}
