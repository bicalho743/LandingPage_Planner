import { 
  CalendarClock, 
  FileCheck, 
  Users, 
  CreditCard, 
  BarChart3, 
  FolderKanban,
  MessageCircle,
  Smartphone,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <FolderKanban className="text-primary text-2xl" />,
    title: "Project Management",
    description: "Create customizable project templates for different organization scenarios with detailed task breakdowns and status tracking.",
    bgColor: "bg-blue-100"
  },
  {
    icon: <FileCheck className="text-green-600 text-2xl" />,
    title: "Task Organization",
    description: "Manage tasks with priority settings, due dates, and status updates. Keep track of all your client organization projects in one place.",
    bgColor: "bg-green-100"
  },
  {
    icon: <Users className="text-violet-600 text-2xl" />,
    title: "Client Management",
    description: "Store client information, track communication history, and manage project details with our intuitive client dashboard.",
    bgColor: "bg-violet-100"
  },
  {
    icon: <CreditCard className="text-red-500 text-2xl" />,
    title: "Invoicing & Payment",
    description: "Generate professional invoices, track payments, and offer multiple payment options to your clients with secure processing.",
    bgColor: "bg-red-100"
  },
  {
    icon: <CalendarClock className="text-amber-500 text-2xl" />,
    title: "Scheduling & Calendar",
    description: "Coordinate appointments, schedule tasks, and manage your organizing sessions with an integrated calendar system.",
    bgColor: "bg-amber-100"
  },
  {
    icon: <BarChart3 className="text-teal-500 text-2xl" />,
    title: "Business Analytics",
    description: "Gain insights into your organizing business with reports on project completion, client acquisition, and revenue tracking.",
    bgColor: "bg-teal-100"
  },
  {
    icon: <MessageCircle className="text-blue-500 text-2xl" />,
    title: "Client Communication",
    description: "Stay connected with your clients through integrated messaging, project updates, and automated reminders.",
    bgColor: "bg-blue-50"
  },
  {
    icon: <Smartphone className="text-purple-500 text-2xl" />,
    title: "Mobile Access",
    description: "Access your planner system on the go with our mobile-friendly interface designed for professional organizers in the field.",
    bgColor: "bg-purple-50"
  },
  {
    icon: <Clock className="text-indigo-500 text-2xl" />,
    title: "Time Tracking",
    description: "Track the time spent on organizing projects and tasks to improve productivity and accurately bill your clients.",
    bgColor: "bg-indigo-50"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Designed for Professional Organizers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools specifically designed for personal organizers to streamline workflows, manage clients, and grow your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white rounded-xl border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
