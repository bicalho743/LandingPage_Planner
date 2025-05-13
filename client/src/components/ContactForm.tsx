import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { contactSchema, type ContactFormData } from "@shared/schema";
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

const contactInfo = [
  {
    icon: <Mail className="text-primary" />,
    title: "Email Us",
    content: "info@modernbiz.com"
  },
  {
    icon: <Phone className="text-primary" />,
    title: "Call Us",
    content: "(555) 123-4567"
  },
  {
    icon: <MapPin className="text-primary" />,
    title: "Visit Us",
    content: "123 Business Avenue\nSuite 500\nSan Francisco, CA 94107"
  }
];

const socialLinks = [
  { icon: <Twitter />, href: "#" },
  { icon: <Linkedin />, href: "#" },
  { icon: <Facebook />, href: "#" },
  { icon: <Instagram />, href: "#" }
];

export default function ContactForm() {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: ""
    }
  });
  
  const contactMutation = useMutation({
    mutationFn: (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(data: ContactFormData) {
    contactMutation.mutate(data);
  }
  
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions or ready to get started? Reach out to our team and we'll be happy to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            className="px-4 py-3 h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email address" 
                            type="email" 
                            {...field}
                            className="px-4 py-3 h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company name" 
                            {...field}
                            className="px-4 py-3 h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?" 
                            {...field}
                            className="px-4 py-3 min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 h-auto"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div>
              <Card className="bg-gray-50 rounded-xl border-none h-full">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
                  
                  <div className="space-y-6">
                    {contactInfo.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 whitespace-pre-line">{item.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Connect With Us</h4>
                      <div className="flex space-x-4">
                        {socialLinks.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.href} 
                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-primary flex items-center justify-center text-gray-600 hover:text-white transition-all"
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
