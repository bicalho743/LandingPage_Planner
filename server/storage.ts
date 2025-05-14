import {
  users,
  leads,
  contacts,
  subscriptions,
  tasks,
  type User,
  type InsertUser,
  type Lead,
  type Contact,
  type LeadFormData,
  type ContactFormData
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
  updateUserStatus(userId: number | undefined, email: string | undefined, status: string): Promise<User | undefined>;
  
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
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      // Fallback para Drizzle
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Erro ao buscar usuário por e-mail:", error);
      // Fallback para Drizzle
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Erro ao buscar usuário por Firebase UID:", error);
      // Fallback para Drizzle
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
      return user;
    }
  }

  async createUser(insertUser: any): Promise<User> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        INSERT INTO users (email, name, firebase_uid, password, status, senha_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const now = new Date();
      const status = insertUser.status || 'pendente';
      const senha_hash = insertUser.senha_hash || '';
      
      const values = [
        insertUser.email, 
        insertUser.name, 
        insertUser.firebaseUid, 
        insertUser.password,
        status,
        senha_hash,
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
          status: insertUser.status || 'pendente',
          senha_hash: insertUser.senha_hash || '',
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
        SET firebase_uid = $1, updated_at = $2, status = 'ativo'
        WHERE id = $3
        RETURNING *;
      `;
      const now = new Date();
      const values = [firebaseUid, now, userId];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }
      
      console.log(`✅ Firebase UID atualizado e status ativado para usuário ID: ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Erro ao atualizar Firebase UID com SQL:`, error);
      
      // Fallback para o Drizzle
      try {
        const [user] = await db
          .update(users)
          .set({ 
            firebaseUid,
            status: 'ativo' as any,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning();
          
        if (!user) {
          throw new Error(`Usuário com ID ${userId} não encontrado`);
        }
        
        console.log(`✅ Firebase UID atualizado e status ativado via Drizzle para usuário ID: ${userId}`);
        return user;
      } catch (drizzleError) {
        console.error(`❌ Falha ao atualizar Firebase UID via Drizzle:`, drizzleError);
        throw drizzleError;
      }
    }
  }
  
  // Lead operations
  async createLead(leadData: LeadFormData): Promise<Lead> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        INSERT INTO leads (email, name, created_at)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const now = new Date();
      const values = [leadData.email, leadData.name, now];
      
      try {
        const result = await pool.query(query, values);
        console.log("Lead created:", result.rows[0]);
        return result.rows[0];
      } catch (sqlError) {
        console.error("❌ Erro ao salvar lead no banco de dados:", sqlError);
        throw new Error("Timeout ao salvar lead no banco");
      }
    } catch (error) {
      console.error("❌ Erro ao criar lead com SQL:", error);
      // Fallback para o Drizzle
      const [lead] = await db
        .insert(leads)
        .values({
          email: leadData.email,
          name: leadData.name,
          createdAt: new Date(),
          convertedToUser: false
        })
        .returning();
      return lead;
    }
  }

  async getLeads(): Promise<Lead[]> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar leads com SQL:", error);
      // Fallback para o Drizzle
      return await db.select().from(leads).orderBy(leads.createdAt);
    }
  }

  async convertLeadToUser(email: string): Promise<void> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      await pool.query(
        'UPDATE leads SET converted_to_user = true WHERE email = $1',
        [email]
      );
    } catch (error) {
      console.error("Erro ao converter lead para usuário com SQL:", error);
      // Fallback para o Drizzle
      await db
        .update(leads)
        .set({ convertedToUser: true })
        .where(eq(leads.email, email));
    }
  }

  // Contact operations
  async createContact(contactData: ContactFormData): Promise<Contact> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const query = `
        INSERT INTO contacts (email, name, message, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const now = new Date();
      const values = [contactData.email, contactData.name, contactData.message, now];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar contato com SQL:", error);
      // Fallback para o Drizzle
      const [contact] = await db
        .insert(contacts)
        .values({
          email: contactData.email,
          name: contactData.name,
          message: contactData.message,
          createdAt: new Date()
        })
        .returning();
      return contact;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar contatos com SQL:", error);
      // Fallback para o Drizzle
      return await db.select().from(contacts).orderBy(contacts.createdAt);
    }
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
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return subscription;
    }
  }

  async getSubscriptionByUserId(userId: number): Promise<any> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Erro ao buscar assinatura por ID do usuário com SQL:", error);
      // Fallback para o Drizzle
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
      
      return subscription;
    }
  }
  
  async updateSubscriptionStatus(userId: number, status: string): Promise<void> {
    console.log(`⏳ Atualizando status da assinatura para usuário ${userId}: ${status}`);
    
    try {
      const now = new Date();
      const query = `
        UPDATE subscriptions 
        SET status = $1, updated_at = $2
        WHERE user_id = $3;
      `;
      
      const result = await pool.query(query, [status, now, userId]);
      
      if (result.rowCount === 0) {
        console.log(`⚠️ Nenhuma assinatura encontrada para usuário ${userId}. Tentando criar uma nova.`);
        // Se não existe assinatura, podemos criar uma nova
        try {
          await this.createSubscription(userId, 'monthly'); // Valor padrão
          console.log(`✅ Nova assinatura criada para usuário ${userId} com status ${status}`);
          return;
        } catch (createError) {
          console.error(`❌ Erro ao criar nova assinatura:`, createError);
          // Continua para o fallback
        }
      } else {
        console.log(`✅ Status da assinatura atualizado via SQL para usuário ${userId}: ${status}`);
        return;
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar status da assinatura via SQL:`, error);
      
      try {
        // Fallback para Drizzle
        const result = await db
          .update(subscriptions)
          .set({ 
            status: status as any,
            updatedAt: new Date()
          })
          .where(eq(subscriptions.userId, userId));
        
        console.log(`✅ Status da assinatura atualizado via Drizzle para usuário ${userId}: ${status}`);
      } catch (drizzleError) {
        console.error(`❌ Falha ao atualizar status da assinatura via Drizzle:`, drizzleError);
        throw drizzleError;
      }
    }
  }
  
  async updateUserStatus(userId: number | undefined, email: string | undefined, status: string): Promise<User | undefined> {
    try {
      if (!userId && !email) {
        console.error('❌ Nenhum identificador (userId ou email) fornecido para atualizar status');
        return undefined;
      }
      
      console.log(`⏳ Atualizando status do usuário para: ${status}`);
      
      let query;
      let values;
      
      if (userId) {
        query = `
          UPDATE users 
          SET status = $1, updated_at = $2
          WHERE id = $3
          RETURNING *;
        `;
        values = [status, new Date(), userId];
      } else {
        query = `
          UPDATE users 
          SET status = $1, updated_at = $2
          WHERE email = $3
          RETURNING *;
        `;
        values = [status, new Date(), email];
      }
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        console.log('⚠️ Nenhum usuário encontrado para atualizar status');
        return undefined;
      }
      
      console.log(`✅ Status do usuário atualizado para "${status}" com sucesso!`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Erro ao atualizar status do usuário:", error);
      
      // Fallback para o Drizzle
      try {
        if (userId) {
          const [user] = await db
            .update(users)
            .set({ 
              status: status as any,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
          return user;
        } else if (email) {
          const [user] = await db
            .update(users)
            .set({ 
              status: status as any,
              updatedAt: new Date()
            })
            .where(eq(users.email, email))
            .returning();
          return user;
        }
      } catch (drizzleError) {
        console.error("❌ Erro no fallback Drizzle:", drizzleError);
      }
      
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();