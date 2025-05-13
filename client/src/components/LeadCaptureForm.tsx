import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { leadSchema, type LeadFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mail } from "lucide-react";

export default function LeadCaptureForm() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: ""
    }
  });
  
  const leadMutation = useMutation({
    mutationFn: (data: LeadFormData) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your interest!",
        description: "We'll send you more information about Planner Organizer shortly.",
        variant: "default",
      });
      form.reset();
      setIsSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(data: LeadFormData) {
    leadMutation.mutate(data);
  }

  return (
    <section id="lead-form" className="py-16 bg-white">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Your Free Planner Organization Guide</h2>
          <p className="text-gray-600 mb-8">
            Sign up to receive our exclusive guide with professional organizing tips, workflow templates, and special offers!
          </p>
          
          <Card className="bg-gray-50 border-none shadow-md">
            <CardContent className="p-6">
              {isSuccess ? (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    Check your email for your free guide and exclusive offers. If you don't see it, please check your spam folder.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Your Name" 
                                {...field} 
                                className="h-12"
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
                            <FormControl>
                              <Input 
                                placeholder="Your Email" 
                                type="email" 
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-medium"
                      disabled={leadMutation.isPending}
                    >
                      {leadMutation.isPending ? "Submitting..." : (
                        <>
                          Get Free Guide <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <p className="text-sm text-gray-500 mt-4">
            By signing up, you agree to receive marketing emails from Planner Organizer. We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}