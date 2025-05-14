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
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateFirebaseUid(userId: number, firebaseUid: string): Promise<User>;
  
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
  // User operations usando consultas SQL diretas (para Render)
  async getUser(id: number): Promise<User | undefined> {
    try {
      const query = `SELECT * FROM users WHERE id = $1;`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      // Fallback para Drizzle se necessário
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const query = `SELECT * FROM users WHERE email = $1;`;
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      // Fallback para Drizzle se necessário
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    }
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      const query = `SELECT * FROM users WHERE firebase_uid = $1;`;
      const result = await pool.query(query, [firebaseUid]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por Firebase UID:", error);
      // Fallback para Drizzle
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
      return user;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        INSERT INTO users (email, name, firebase_uid, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const now = new Date();
      const values = [
        insertUser.email, 
        insertUser.name, 
        insertUser.firebaseUid, 
        insertUser.password,
        now,
        now
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar usuário com SQL:", error);
      // Fallback para o Drizzle
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
  }
  
  async updateFirebaseUid(userId: number, firebaseUid: string): Promise<User> {
    try {
      console.log(`⏳ Atualizando Firebase UID para usuário ID: ${userId}`);
      
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        UPDATE users 
        SET firebase_uid = $1, updated_at = $2
        WHERE id = $3
        RETURNING *;
      `;
      const now = new Date();
      const values = [firebaseUid, now, userId];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }
      
      console.log(`✅ Firebase UID atualizado com sucesso para usuário ID: ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Erro ao atualizar Firebase UID com SQL:`, error);
      
      // Fallback para o Drizzle
      try {
        const [user] = await db
          .update(users)
          .set({ 
            firebaseUid, 
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning();
          
        if (!user) {
          throw new Error(`Usuário com ID ${userId} não encontrado`);
        }
        
        console.log(`✅ Firebase UID atualizado com sucesso via Drizzle para usuário ID: ${userId}`);
        return user;
      } catch (drizzleError) {
        console.error(`❌ Falha ao atualizar Firebase UID via Drizzle:`, drizzleError);
        throw drizzleError;
      }
    }
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
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        INSERT INTO subscriptions (user_id, plan_type, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const now = new Date();
      const values = [userId, planType, 'active', now, now];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar assinatura com SQL:", error);
      // Fallback para o Drizzle
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
  }
  
  async getSubscriptionByUserId(userId: number): Promise<any> {
    try {
      const query = `SELECT * FROM subscriptions WHERE user_id = $1;`;
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar assinatura por ID de usuário:", error);
      // Fallback para Drizzle
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
      
      return subscription;
    }
  }
  
  async updateSubscriptionStatus(userId: number, status: string): Promise<void> {
    try {
      const now = new Date();
      const query = `
        UPDATE subscriptions 
        SET status = $1, updated_at = $2
        WHERE user_id = $3;
      `;
      await pool.query(query, [status, now, userId]);
    } catch (error) {
      console.error("Erro ao atualizar status da assinatura:", error);
      // Fallback para Drizzle
      await db
        .update(subscriptions)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.userId, userId));
    }
  }
}

export const storage = new DatabaseStorage();
