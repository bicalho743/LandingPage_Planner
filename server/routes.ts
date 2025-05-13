import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
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
        console.error("Contact form submission error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to process your request" 
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
