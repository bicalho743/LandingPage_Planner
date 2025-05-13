import { 
  users, 
  leads,
  contacts,
  tasks,
  subscriptions,
  type User, 
  type InsertUser, 
  type ContactFormData, 
  type Contact,
  type Lead,
  type LeadFormData,
  type InsertLead
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead operations
  createLead(lead: LeadFormData): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  convertLeadToUser(email: string): Promise<void>;
  
  // Contact operations
  createContact(contact: ContactFormData): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Subscription operations
  createSubscription(userId: number, planType: string): Promise<any>;
  getSubscriptionByUserId(userId: number): Promise<any>;
  updateSubscriptionStatus(userId: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return user;
  }
  
  // Lead operations
  async createLead(leadData: LeadFormData): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({
        email: leadData.email,
        name: leadData.name,
        createdAt: new Date(),
        convertedToUser: false
      })
      .returning();
    
    // Here we would also integrate with Brevo/Sendinblue for email marketing
    console.log(`Lead created: ${JSON.stringify(lead)}`);
    return lead;
  }
  
  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads);
  }
  
  async convertLeadToUser(email: string): Promise<void> {
    await db
      .update(leads)
      .set({ convertedToUser: true })
      .where(eq(leads.email, email));
  }

  // Contact operations
  async createContact(contactData: ContactFormData): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({
        name: contactData.name,
        email: contactData.email,
        company: contactData.company || null,
        message: contactData.message,
        createdAt: new Date()
      })
      .returning();
    
    console.log(`Contact form submitted: ${JSON.stringify(contact)}`);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts);
  }
  
  // Subscription operations
  async createSubscription(userId: number, planType: string): Promise<any> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        planType: planType as any,
        status: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return subscription;
  }
  
  async getSubscriptionByUserId(userId: number): Promise<any> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    
    return subscription;
  }
  
  async updateSubscriptionStatus(userId: number, status: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
