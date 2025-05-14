import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Use Stripe price IDs from your provided code
const STRIPE_PRICE_MONTHLY = "price_1RFE2ULWUPER7pUXw1i1X5oR";
const STRIPE_PRICE_ANNUAL = "price_1RFZw4LWUPER7pUX2D1hjJWj";
const STRIPE_PRICE_LIFETIME = "price_1RFBULLWUPER7pUXCiGZn3Jn";

const planFeatures = {
  basic: [
    "Client management (up to 10 clients)",
    "Task organization",
    "Basic reporting",
    "Email support"
  ],
  pro: [
    "Unlimited clients",
    "Advanced task organization",
    "Custom project templates",
    "Priority email support",
    "Time tracking",
    "Client portal access"
  ],
  business: [
    "Everything in Pro plan",
    "Team collaboration",
    "Unlimited storage",
    "White-label options",
    "API access",
    "Priority phone support",
    "Onboarding session"
  ]
};

interface PlanProps {
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  billingType: "monthly" | "annually";
  priceId: string;
  ctaText: string;
}

function PricingPlan({ title, monthlyPrice, yearlyPrice, description, features, isPopular, billingType, priceId, ctaText }: PlanProps) {
  const price = billingType === "monthly" ? monthlyPrice : yearlyPrice;
  const displayPrice = price === 0 ? "Free" : `$${price}`;
  const billingLabel = billingType === "monthly" ? "/month" : "/year";
  
  const handleSubscribe = () => {
    // Pegar o nome do plano baseado no título
    let planType = "";
    
    if (title === "Basic") {
      planType = "free";
      console.log(`Iniciando registro no plano gratuito`);
    } else if (title === "Professional") {
      planType = billingType === "monthly" ? "mensal" : "anual";
      console.log(`Iniciando assinatura do plano ${title} (${planType})`);
    } else if (title === "Business") {
      planType = "vitalicio";
      console.log(`Iniciando assinatura do plano ${title} (${planType})`);
    }
    
    // Usar URLSearchParams para construir a query string
    const params = new URLSearchParams();
    
    // Adicionar parâmetros à URL
    if (planType) {
      params.append('plano', planType);
    }
    
    // Redirecionar para a página de registro com os parâmetros
    window.location.href = `/registro?${params.toString()}`;
  };
  
  return (
    <Card className={`border ${isPopular ? "border-primary shadow-lg" : "border-gray-200"} h-full flex flex-col`}>
      {isPopular && (
        <div className="bg-primary text-white text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      <CardHeader className={`${isPopular ? "pt-5" : "pt-6"}`}>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-3xl font-bold">{displayPrice}</span>
          {price > 0 && <span className="text-gray-500 ml-1">{billingLabel}</span>}
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-2 mt-1 bg-green-100 p-1 rounded-full">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={handleSubscribe}
          className={`w-full ${isPopular ? "bg-primary hover:bg-primary/90" : "bg-gray-800 hover:bg-gray-700"} text-white`}
        >
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPlans() {
  const [billingType, setBillingType] = useState<"monthly" | "annually">("monthly");
  
  const toggleBillingType = () => {
    setBillingType(billingType === "monthly" ? "annually" : "monthly");
  };
  
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`font-medium ${billingType === "monthly" ? "text-primary" : "text-gray-500"}`}>
              Monthly
            </span>
            <div className="flex items-center space-x-2">
              <Switch checked={billingType === "annually"} onCheckedChange={toggleBillingType} />
              <Label>
                {billingType === "annually" && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                )}
              </Label>
            </div>
            <span className={`font-medium ${billingType === "annually" ? "text-primary" : "text-gray-500"}`}>
              Annually
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingPlan
            title="Basic"
            monthlyPrice={0}
            yearlyPrice={0}
            description="Perfect for getting started with organizing"
            features={planFeatures.basic}
            billingType={billingType}
            priceId="free_tier"
            ctaText="Get Started Free"
          />
          
          <PricingPlan
            title="Professional"
            monthlyPrice={29}
            yearlyPrice={279}
            description="For organizers with growing businesses"
            features={planFeatures.pro}
            isPopular={true}
            billingType={billingType}
            priceId={billingType === "monthly" ? STRIPE_PRICE_MONTHLY : STRIPE_PRICE_ANNUAL}
            ctaText="Subscribe Now"
          />
          
          <PricingPlan
            title="Business"
            monthlyPrice={79}
            yearlyPrice={749}
            description="For established organizing businesses"
            features={planFeatures.business}
            billingType={billingType}
            priceId={STRIPE_PRICE_LIFETIME}
            ctaText="Subscribe Now"
          />
        </div>
        
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-sm text-gray-500">
            Need a custom plan for your team? <a href="#contact" className="text-primary hover:underline">Contact us</a> for enterprise pricing.
          </p>
        </div>
      </div>
    </section>
  );
}