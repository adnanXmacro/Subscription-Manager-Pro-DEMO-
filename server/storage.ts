import { 
  users, 
  subscriptionPlans, 
  subscriptions, 
  paymentIssues,
  type User, 
  type InsertUser,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type PaymentIssue,
  type InsertPaymentIssue
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // Subscription methods
  getSubscriptions(): Promise<(Subscription & { user: User; plan: SubscriptionPlan })[]>;
  getUserSubscriptions(userId: number): Promise<(Subscription & { plan: SubscriptionPlan })[]>;
  getSubscription(id: number): Promise<(Subscription & { user: User; plan: SubscriptionPlan }) | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;

  // Payment Issue methods
  getPaymentIssues(): Promise<(PaymentIssue & { user: User; subscription: Subscription })[]>;
  createPaymentIssue(issue: InsertPaymentIssue): Promise<PaymentIssue>;
  resolvePaymentIssue(id: number): Promise<PaymentIssue | undefined>;

  // Analytics methods
  getDashboardMetrics(): Promise<{
    totalRevenue: number;
    activeSubscriptions: number;
    churnRate: number;
    failedPayments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default plans if needed
    this.initializeDefaultPlans();
  }

  private async initializeDefaultPlans() {
    try {
      const existingPlans = await db.select().from(subscriptionPlans);
      if (existingPlans.length === 0) {
        const defaultPlans = [
          {
            name: "Basic Plan",
            description: "Perfect for small teams and individuals",
            price: "29",
            billingCycle: "monthly",
            features: ["Up to 5 team members", "Basic analytics", "Email support"],
            isActive: true,
          },
          {
            name: "Professional",
            description: "Advanced features for growing businesses",
            price: "99",
            billingCycle: "monthly",
            features: ["Up to 25 team members", "Advanced analytics", "Priority support"],
            isActive: true,
          },
          {
            name: "Enterprise",
            description: "Complete solution for large organizations",
            price: "299",
            billingCycle: "monthly",
            features: ["Unlimited team members", "Custom integrations", "Dedicated support"],
            isActive: true,
          },
        ];

        for (const plan of defaultPlans) {
          await db.insert(subscriptionPlans).values({
            ...plan,
            stripePriceId: null,
          });
        }
      }
    } catch (error) {
      console.warn('Could not initialize default plans:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId || null
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, planUpdate: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .update(subscriptionPlans)
      .set(planUpdate)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan || undefined;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const [plan] = await db
      .update(subscriptionPlans)
      .set({ isActive: false })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return !!plan;
  }

  async getSubscriptions(): Promise<(Subscription & { user: User; plan: SubscriptionPlan })[]> {
    return await db.query.subscriptions.findMany({
      with: {
        user: true,
        plan: true,
      },
    });
  }

  async getUserSubscriptions(userId: number): Promise<(Subscription & { plan: SubscriptionPlan })[]> {
    return await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: {
        plan: true,
      },
    });
  }

  async getSubscription(id: number): Promise<(Subscription & { user: User; plan: SubscriptionPlan }) | undefined> {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
      with: {
        user: true,
        plan: true,
      },
    });
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async updateSubscription(id: number, subscriptionUpdate: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...subscriptionUpdate, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription || undefined;
  }

  async getPaymentIssues(): Promise<(PaymentIssue & { user: User; subscription: Subscription })[]> {
    return await db.query.paymentIssues.findMany({
      with: {
        user: true,
        subscription: true,
      },
    });
  }

  async createPaymentIssue(insertIssue: InsertPaymentIssue): Promise<PaymentIssue> {
    const [issue] = await db
      .insert(paymentIssues)
      .values(insertIssue)
      .returning();
    return issue;
  }

  async resolvePaymentIssue(id: number): Promise<PaymentIssue | undefined> {
    const [issue] = await db
      .update(paymentIssues)
      .set({
        status: "resolved",
        resolvedAt: new Date(),
      })
      .where(eq(paymentIssues.id, id))
      .returning();
    return issue || undefined;
  }

  async getDashboardMetrics() {
    const allSubscriptions = await db.select().from(subscriptions);
    const allPlans = await db.select().from(subscriptionPlans);
    const allIssues = await db.select().from(paymentIssues);

    const activeSubscriptions = allSubscriptions.filter(s => s.status === 'active').length;
    
    // Calculate total revenue from active subscriptions
    let totalRevenue = 0;
    for (const subscription of allSubscriptions) {
      if (subscription.status === 'active') {
        const plan = allPlans.find(p => p.id === subscription.planId);
        if (plan) {
          totalRevenue += parseFloat(plan.price);
        }
      }
    }

    const failedPayments = allIssues.filter(i => i.status === 'pending').length;
    
    // Simple churn rate calculation (could be more sophisticated)
    const cancelledSubscriptions = allSubscriptions.filter(s => s.status === 'cancelled').length;
    const totalSubscriptions = allSubscriptions.length || 1;
    const churnRate = (cancelledSubscriptions / totalSubscriptions) * 100;

    return {
      totalRevenue,
      activeSubscriptions,
      churnRate: Math.round(churnRate * 10) / 10,
      failedPayments,
    };
  }
}

export const storage = new DatabaseStorage();
