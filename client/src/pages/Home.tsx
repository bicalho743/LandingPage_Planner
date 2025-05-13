import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ModernBiz - Innovative Solutions for Your Business</title>
        <meta name="description" content="Your trusted partner for innovative solutions that drive business growth and transformation." />
        <meta property="og:title" content="ModernBiz - Innovative Solutions for Your Business" />
        <meta property="og:description" content="Your trusted partner for innovative solutions that drive business growth and transformation." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <About />
        <Testimonials />
        <CallToAction />
        <ContactForm />
      </main>
      
      <Footer />
    </>
  );
}
