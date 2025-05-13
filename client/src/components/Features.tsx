import { 
  LineChartIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  PhoneIcon, 
  RocketIcon, 
  ArrowLeftRightIcon 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <LineChartIcon className="text-primary text-2xl" />,
    title: "Data-Driven Insights",
    description: "Leverage advanced analytics to uncover valuable insights that drive strategic decision-making and business growth.",
    bgColor: "bg-blue-100"
  },
  {
    icon: <ShieldCheckIcon className="text-secondary text-2xl" />,
    title: "Enterprise Security",
    description: "Protect your valuable business data with industry-leading security protocols and compliance measures.",
    bgColor: "bg-green-100"
  },
  {
    icon: <UsersIcon className="text-accent text-2xl" />,
    title: "Team Collaboration",
    description: "Empower your team with robust collaboration tools that enhance productivity and streamline workflows.",
    bgColor: "bg-violet-100"
  },
  {
    icon: <PhoneIcon className="text-red-500 text-2xl" />,
    title: "24/7 Support",
    description: "Access expert assistance whenever you need it with our dedicated support team available around the clock.",
    bgColor: "bg-red-100"
  },
  {
    icon: <RocketIcon className="text-amber-500 text-2xl" />,
    title: "Rapid Implementation",
    description: "Get up and running quickly with streamlined onboarding and implementation processes tailored to your needs.",
    bgColor: "bg-amber-100"
  },
  {
    icon: <ArrowLeftRightIcon className="text-teal-500 text-2xl" />,
    title: "Seamless Integration",
    description: "Connect with your existing tools and systems through our flexible API and extensive integration options.",
    bgColor: "bg-teal-100"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools and services designed to transform your business operations and drive exceptional results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white rounded-xl shadow-md transition-all hover:shadow-lg border-none">
              <CardContent className="p-8">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
