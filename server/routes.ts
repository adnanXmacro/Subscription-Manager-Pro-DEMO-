import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertSubscriptionPlanSchema, insertSubscriptionSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe functionality will be limited.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching metrics: " + error.message });
    }
  });

  // Subscription Plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching plans: " + error.message });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating plan: " + error.message });
    }
  });

  app.put("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(id, validatedData);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating plan: " + error.message });
    }
  });

  app.delete("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscriptionPlan(id);
      
      if (!success) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting plan: " + error.message });
    }
  });

  // Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching subscriptions: " + error.message });
    }
  });

  app.get("/api/subscriptions/recent", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      // Return the 5 most recent subscriptions
      const recent = subscriptions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      res.json(recent);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recent subscriptions: " + error.message });
    }
  });

  // Payment Issues
  app.get("/api/payment-issues", async (req, res) => {
    try {
      const issues = await storage.getPaymentIssues();
      res.json(issues);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching payment issues: " + error.message });
    }
  });

  app.post("/api/payment-issues/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.resolvePaymentIssue(id);
      
      if (!issue) {
        return res.status(404).json({ message: "Payment issue not found" });
      }
      
      res.json(issue);
    } catch (error: any) {
      res.status(500).json({ message: "Error resolving payment issue: " + error.message });
    }
  });

  // Stripe payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe subscription creation
  app.post('/api/create-subscription', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    try {
      const { planId, email, name } = req.body;
      
      // Get the plan details
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan || !plan.stripePriceId) {
        return res.status(400).json({ message: "Invalid plan or Stripe price not configured" });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: plan.stripePriceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
