import {
  users,
  leads,
  subscriptions,
  contacts,
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
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateFirebaseUid(userId: number, firebaseUid: string): Promise<User>;
  updateUserStatus(userId: number | undefined, email: string | undefined, status: string): Promise<User | undefined>;
  updateUserPassword(userId: number, password: string): Promise<User | undefined>;
  updateUserTrialDates(userId: number): Promise<User | undefined>;
  
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
      console.log(`🔍 VERIFICAÇÃO DE EMAIL: Buscando ${email} na tabela users via SQL direto`);
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows[0]) {
        console.log(`✅ VERIFICAÇÃO DE EMAIL: Encontrado usuário via SQL direto: ${result.rows[0].id}`);
      } else {
        console.log(`❌ VERIFICAÇÃO DE EMAIL: Usuário NÃO encontrado via SQL direto`);
      }
      return result.rows[0] || undefined;
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      // Fallback para Drizzle
      console.log(`🔍 VERIFICAÇÃO DE EMAIL: Tentando busca via Drizzle para ${email}`);
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) {
        console.log(`✅ VERIFICAÇÃO DE EMAIL: Encontrado usuário via Drizzle: ${user.id}`);
      } else {
        console.log(`❌ VERIFICAÇÃO DE EMAIL: Usuário NÃO encontrado via Drizzle`);
      }
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
  
  async getUsers(): Promise<User[]> {
    try {
      // Usando consulta SQL direta para compatibilidade com Render
      const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      // Fallback para Drizzle
      const allUsers = await db.select().from(users).orderBy(users.id);
      return allUsers;
    }
  }

  async createUser(insertUser: any): Promise<User> {
    try {
      // Se o firebaseUid estiver vazio ou null, não incluiremos este campo na inserção
      const hasFirebaseUid = insertUser.firebaseUid && insertUser.firebaseUid.trim() !== '';
      
      let query;
      let values;
      const now = new Date();
      const status = insertUser.status || 'pendente';
      const senha_hash = insertUser.senha_hash || '';
      
      // Verificar se deve criar com trial period
      const isTrial = insertUser.trial === true;
      const trialStart = isTrial ? now : null;
      const trialEnd = isTrial ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : null; // +7 dias
      
      if (hasFirebaseUid) {
        // Incluir o firebase_uid na inserção
        query = `
          INSERT INTO users (email, name, firebase_uid, password, status, senha_hash, trial_start, trial_end, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *;
        `;
        values = [
          insertUser.email, 
          insertUser.name, 
          insertUser.firebaseUid, 
          insertUser.password,
          status,
          senha_hash,
          trialStart,
          trialEnd,
          now,
          now
        ];
      } else {
        // Omitir o firebase_uid na inserção
        query = `
          INSERT INTO users (email, name, password, status, senha_hash, trial_start, trial_end, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
        values = [
          insertUser.email, 
          insertUser.name, 
          insertUser.password,
          status,
          senha_hash,
          trialStart,
          trialEnd,
          now,
          now
        ];
      }
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      console.error("Erro ao criar usuário com SQL:", error);
      
      // Verificar se é um erro de firebaseUid duplicado (vazio)
      if (error.constraint === 'users_firebase_uid_unique') {
        console.log("⚠️ Erro de restrição de unicidade no campo firebase_uid. Tentando inserir sem este campo...");
        // Omitir o firebase_uid na inserção
        const now = new Date();
        const isTrial = insertUser.trial === true;
        const trialStart = isTrial ? now : null;
        const trialEnd = isTrial ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : null; // +7 dias
        
        const fallbackQuery = `
          INSERT INTO users (email, name, password, status, senha_hash, trial_start, trial_end, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
        const fallbackValues = [
          insertUser.email, 
          insertUser.name, 
          insertUser.password,
          insertUser.status || 'pendente',
          insertUser.senha_hash || '',
          trialStart,
          trialEnd,
          now,
          now
        ];
        
        try {
          const fallbackResult = await pool.query(fallbackQuery, fallbackValues);
          return fallbackResult.rows[0];
        } catch (fallbackError) {
          console.error("❌ Falha na tentativa alternativa de criar usuário:", fallbackError);
          throw fallbackError;
        }
      }
      
      // Fallback para o Drizzle se não for um erro de campo firebase_uid
      try {
        // Evitar enviar firebaseUid vazio
        const now = new Date();
        const isTrial = insertUser.trial === true;
        const trialStart = isTrial ? now : undefined;
        const trialEnd = isTrial ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined; // +7 dias
        
        const drizzleInsert = {
          ...insertUser,
          status: insertUser.status || 'pendente',
          senha_hash: insertUser.senha_hash || '',
          trialStart: trialStart,
          trialEnd: trialEnd,
          createdAt: now,
          updatedAt: now
        };
        
        // Remover firebaseUid se estiver vazio
        if (!insertUser.firebaseUid || insertUser.firebaseUid.trim() === '') {
          delete drizzleInsert.firebaseUid;
        }
        
        const [user] = await db
          .insert(users)
          .values(drizzleInsert)
          .returning();
        return user;
      } catch (drizzleError) {
        console.error("❌ Falha no fallback do Drizzle:", drizzleError);
        throw drizzleError;
      }
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
      console.error(`❌ Falha ao atualizar Firebase UID:`, error);
      
      try {
        // Fallback para Drizzle
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
  
  async updateUserStatus(userId: number | undefined, email: string | undefined, status: string): Promise<User | undefined> {
    try {
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
      } else if (email) {
        query = `
          UPDATE users 
          SET status = $1, updated_at = $2
          WHERE email = $3
          RETURNING *;
        `;
        values = [status, new Date(), email];
      } else {
        throw new Error('É necessário fornecer userId ou email para atualizar o status');
      }
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar status do usuário:', error);
      
      try {
        // Fallback para Drizzle
        let updateResult;
        
        if (userId) {
          updateResult = await db
            .update(users)
            .set({
              status: status as any,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
        } else if (email) {
          updateResult = await db
            .update(users)
            .set({
              status: status as any,
              updatedAt: new Date()
            })
            .where(eq(users.email, email))
            .returning();
        } else {
          throw new Error('É necessário fornecer userId ou email para atualizar o status');
        }
        
        if (updateResult.length === 0) {
          return undefined;
        }
        
        return updateResult[0];
      } catch (drizzleError) {
        console.error('❌ Erro ao atualizar status via Drizzle:', drizzleError);
        throw drizzleError;
      }
    }
  }
  
  async updateUserPassword(userId: number, password: string): Promise<User | undefined> {
    try {
      console.log(`⏳ Atualizando senha para usuário ID: ${userId}`);
      
      // Usando consulta SQL direta
      const query = `
        UPDATE users 
        SET senha_hash = $1, updated_at = $2
        WHERE id = $3
        RETURNING *;
      `;
      const now = new Date();
      const values = [password, now, userId];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Nenhum usuário encontrado para atualizar senha (userId: ${userId})`);
        return undefined;
      }
      
      console.log(`✅ Senha atualizada para usuário ID: ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Falha ao atualizar senha do usuário:`, error);
      
      try {
        // Fallback para Drizzle
        const [user] = await db
          .update(users)
          .set({
            senha_hash: password,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning();
          
        if (!user) {
          console.log(`⚠️ Nenhum usuário encontrado via Drizzle para atualizar senha`);
          return undefined;
        }
        
        console.log(`✅ Senha atualizada via Drizzle para usuário ID: ${userId}`);
        return user;
      } catch (drizzleError) {
        console.error(`❌ Falha ao atualizar senha via Drizzle:`, drizzleError);
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
      console.error("❌ Erro ao salvar lead:", error);
      // Fallback para Drizzle
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
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error("❌ Erro ao buscar leads:", error);
      // Fallback para Drizzle
      const allLeads = await db.select().from(leads).orderBy(leads.createdAt);
      return allLeads;
    }
  }
  
  async convertLeadToUser(email: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE leads SET converted_to_user = true WHERE email = $1',
        [email]
      );
    } catch (error) {
      console.error("❌ Erro ao converter lead para usuário:", error);
      // Fallback para Drizzle
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
      console.error("❌ Erro ao salvar contato:", error);
      // Fallback para Drizzle
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
      const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error("❌ Erro ao buscar contatos:", error);
      // Fallback para Drizzle
      const allContacts = await db.select().from(contacts).orderBy(contacts.createdAt);
      return allContacts;
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
      console.error("❌ Erro ao criar assinatura:", error);
      // Fallback para Drizzle
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
      const result = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("❌ Erro ao buscar assinatura por userId:", error);
      // Fallback para Drizzle
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(subscriptions.createdAt);
      
      return subscription || null;
    }
  }
  
  async updateUserTrialDates(userId: number): Promise<User | undefined> {
    try {
      console.log(`⏳ Atualizando datas de trial para usuário ID: ${userId}`);
      
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dias
      
      const query = `
        UPDATE users 
        SET trial_start = $1, trial_end = $2, updated_at = $3
        WHERE id = $4
        RETURNING *;
      `;
      
      const values = [now, trialEnd, now, userId];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Usuário com ID ${userId} não encontrado ao atualizar datas de trial`);
        return undefined;
      }
      
      console.log(`✅ Datas de trial atualizadas para usuário ID: ${userId}`);
      console.log(`   Trial Start: ${now.toISOString()}`);
      console.log(`   Trial End: ${trialEnd.toISOString()}`);
      
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Falha ao atualizar datas de trial:`, error);
      
      try {
        // Fallback para Drizzle
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dias
        
        const [user] = await db
          .update(users)
          .set({
            trialStart: now,
            trialEnd: trialEnd,
            updatedAt: now
          })
          .where(eq(users.id, userId))
          .returning();
          
        if (!user) {
          console.log(`⚠️ Usuário com ID ${userId} não encontrado ao atualizar datas de trial via Drizzle`);
          return undefined;
        }
        
        console.log(`✅ Datas de trial atualizadas via Drizzle para usuário ID: ${userId}`);
        return user;
      } catch (drizzleError) {
        console.error(`❌ Falha ao atualizar datas de trial via Drizzle:`, drizzleError);
        throw drizzleError;
      }
    }
  }

  async updateSubscriptionStatus(userId: number, status: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE subscriptions SET status = $1, updated_at = $2 WHERE user_id = $3',
        [status, new Date(), userId]
      );
    } catch (error) {
      console.error("❌ Erro ao atualizar status da assinatura:", error);
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