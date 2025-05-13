import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactSchema, leadSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Import error handling function for consistent error responses
const handleError = (error: any, res: Response) => {
  if (error instanceof ZodError) {
    // Handle validation errors
    const validationError = fromZodError(error);
    res.status(400).json({ 
      success: false, 
      message: "Validation error", 
      errors: validationError.message 
    });
  } else {
    // Handle other errors
    console.error("API error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to process your request" 
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== Contact form API route =====
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = contactSchema.parse(req.body);
      
      // Store contact form submission
      const contact = await storage.createContact(validatedData);
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully", 
        data: contact 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Lead capture API route =====
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = leadSchema.parse(req.body);
      
      // Store lead form submission
      const lead = await storage.createLead(validatedData);
      
      // Return success response
      res.status(201).json({ 
        success: true, 
        message: "Thank you for your interest! We'll be in touch soon.", 
        data: lead 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== User registration API route =====
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists with this email
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists"
        });
      }
      
      // Create new user
      const user = await storage.createUser(validatedData);
      
      // Convert lead to user if email exists in leads
      await storage.convertLeadToUser(validatedData.email);
      
      // Return success response (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        success: true, 
        message: "User registered successfully", 
        data: userWithoutPassword 
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Subscription API routes =====
  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const { userId, planType } = req.body;
      
      if (!userId || !planType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId and planType"
        });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      if (existingSubscription) {
        return res.status(409).json({
          success: false,
          message: "User already has an active subscription"
        });
      }
      
      // Create subscription
      const subscription = await storage.createSubscription(userId, planType);
      
      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  // ===== Webhook for Stripe =====
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    // For actual implementation, we would verify the Stripe signature
    // and handle various event types like payment_success, subscription_updated, etc.
    try {
      const event = req.body;
      
      // Log the event for debugging
      console.log("Received Stripe webhook event:", event.type);
      
      // Process based on event type
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          break;
          
        case 'customer.subscription.updated':
          // Handle subscription update
          break;
          
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      handleError(error, res);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
