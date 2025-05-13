import { users, type User, type InsertUser, type ContactFormData, type Contact } from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: ContactFormData): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private userCounter: number;
  private contactCounter: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.userCounter = 1;
    this.contactCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContact(contactData: ContactFormData): Promise<Contact> {
    const id = this.contactCounter++;
    const contact: Contact = { 
      ...contactData, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.contacts.set(id, contact);
    console.log(`Contact form submitted: ${JSON.stringify(contact)}`);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
}

export const storage = new MemStorage();
