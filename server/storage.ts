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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private subscriptions: Map<number, Subscription>;
  private paymentIssues: Map<number, PaymentIssue>;
  private currentUserId: number;
  private currentPlanId: number;
  private currentSubscriptionId: number;
  private currentPaymentIssueId: number;

  constructor() {
    this.users = new Map();
    this.subscriptionPlans = new Map();
    this.subscriptions = new Map();
    this.paymentIssues = new Map();
    this.currentUserId = 1;
    this.currentPlanId = 1;
    this.currentSubscriptionId = 1;
    this.currentPaymentIssueId = 1;

    // Initialize with default plans
    this.initializeDefaultPlans();
  }

  private initializeDefaultPlans() {
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

    defaultPlans.forEach(plan => {
      const id = this.currentPlanId++;
      const planData: SubscriptionPlan = {
        id,
        ...plan,
        stripePriceId: null,
        createdAt: new Date(),
      };
      this.subscriptionPlans.set(id, planData);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || user.stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(plan => plan.isActive);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentPlanId++;
    const plan: SubscriptionPlan = {
      ...insertPlan,
      id,
      description: insertPlan.description || null,
      features: insertPlan.features || [],
      stripePriceId: insertPlan.stripePriceId || null,
      isActive: insertPlan.isActive !== undefined ? insertPlan.isActive : true,
      createdAt: new Date(),
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(id: number, planUpdate: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;

    const updatedPlan = { ...plan, ...planUpdate };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return false;

    const updatedPlan = { ...plan, isActive: false };
    this.subscriptionPlans.set(id, updatedPlan);
    return true;
  }

  async getSubscriptions(): Promise<(Subscription & { user: User; plan: SubscriptionPlan })[]> {
    const result = [];
    for (const subscription of Array.from(this.subscriptions.values())) {
      const user = this.users.get(subscription.userId);
      const plan = this.subscriptionPlans.get(subscription.planId);
      if (user && plan) {
        result.push({ ...subscription, user, plan });
      }
    }
    return result;
  }

  async getUserSubscriptions(userId: number): Promise<(Subscription & { plan: SubscriptionPlan })[]> {
    const result = [];
    for (const subscription of Array.from(this.subscriptions.values())) {
      if (subscription.userId === userId) {
        const plan = this.subscriptionPlans.get(subscription.planId);
        if (plan) {
          result.push({ ...subscription, plan });
        }
      }
    }
    return result;
  }

  async getSubscription(id: number): Promise<(Subscription & { user: User; plan: SubscriptionPlan }) | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const user = this.users.get(subscription.userId);
    const plan = this.subscriptionPlans.get(subscription.planId);
    
    if (user && plan) {
      return { ...subscription, user, plan };
    }
    return undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId || null,
      currentPeriodStart: insertSubscription.currentPeriodStart || null,
      currentPeriodEnd: insertSubscription.currentPeriodEnd || null,
      cancelledAt: insertSubscription.cancelledAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscriptionUpdate: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updatedSubscription = { 
      ...subscription, 
      ...subscriptionUpdate,
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async getPaymentIssues(): Promise<(PaymentIssue & { user: User; subscription: Subscription })[]> {
    const result = [];
    for (const issue of Array.from(this.paymentIssues.values())) {
      const user = this.users.get(issue.userId);
      const subscription = this.subscriptions.get(issue.subscriptionId);
      if (user && subscription) {
        result.push({ ...issue, user, subscription });
      }
    }
    return result;
  }

  async createPaymentIssue(insertIssue: InsertPaymentIssue): Promise<PaymentIssue> {
    const id = this.currentPaymentIssueId++;
    const issue: PaymentIssue = {
      ...insertIssue,
      id,
      retryDate: insertIssue.retryDate || null,
      resolvedAt: insertIssue.resolvedAt || null,
      createdAt: new Date(),
    };
    this.paymentIssues.set(id, issue);
    return issue;
  }

  async resolvePaymentIssue(id: number): Promise<PaymentIssue | undefined> {
    const issue = this.paymentIssues.get(id);
    if (!issue) return undefined;

    const resolvedIssue = {
      ...issue,
      status: "resolved" as const,
      resolvedAt: new Date(),
    };
    this.paymentIssues.set(id, resolvedIssue);
    return resolvedIssue;
  }

  async getDashboardMetrics() {
    const subscriptions = Array.from(this.subscriptions.values());
    const plans = Array.from(this.subscriptionPlans.values());
    const issues = Array.from(this.paymentIssues.values());

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    
    // Calculate total revenue from active subscriptions
    let totalRevenue = 0;
    for (const subscription of subscriptions) {
      if (subscription.status === 'active') {
        const plan = plans.find(p => p.id === subscription.planId);
        if (plan) {
          totalRevenue += parseFloat(plan.price);
        }
      }
    }

    const failedPayments = issues.filter(i => i.status === 'pending').length;
    
    // Simple churn rate calculation (could be more sophisticated)
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalSubscriptions = subscriptions.length || 1;
    const churnRate = (cancelledSubscriptions / totalSubscriptions) * 100;

    return {
      totalRevenue,
      activeSubscriptions,
      churnRate: Math.round(churnRate * 10) / 10,
      failedPayments,
    };
  }
}

export const storage = new MemStorage();
