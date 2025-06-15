import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { insertSubscriptionPlanSchema, insertSubscriptionSchema } from "@shared/schema";
import express from "express";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe functionality will be limited.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
}) : null;

// WebSocket connections for real-time updates
const wsClients = new Set<WebSocket>();

// Real-time event broadcaster
function broadcastUpdate(event: string, data: any) {
  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Raw body parser for Stripe webhooks
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  
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

  // Stripe webhook endpoint for real-time processing
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(400).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        // For development without webhook secret
        event = JSON.parse(req.body);
      }
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment for ${paymentIntent.amount} succeeded!`);
          
          // Broadcast real-time update
          broadcastUpdate('payment_success', {
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customerId: paymentIntent.customer,
          });
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment for ${failedPayment.amount} failed!`);
          
          // Create payment issue record
          if (failedPayment.customer) {
            await storage.createPaymentIssue({
              userId: 1, // TODO: Map Stripe customer to user ID
              subscriptionId: 1, // TODO: Map to actual subscription
              reason: failedPayment.last_payment_error?.message || 'Payment failed',
              amount: (failedPayment.amount / 100).toString(),
              status: 'pending',
              retryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Retry in 24 hours
            });
          }
          
          // Broadcast real-time update
          broadcastUpdate('payment_failed', {
            amount: failedPayment.amount / 100,
            reason: failedPayment.last_payment_error?.message,
            customerId: failedPayment.customer,
          });
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Invoice payment succeeded for ${invoice.amount_paid}`);
          
          // Broadcast real-time update
          broadcastUpdate('invoice_paid', {
            amount: invoice.amount_paid / 100,
            subscriptionId: invoice.subscription,
            customerId: invoice.customer,
          });
          break;

        case 'customer.subscription.created':
          const createdSub = event.data.object as Stripe.Subscription;
          console.log(`Subscription created: ${createdSub.id}`);
          
          // Broadcast real-time update
          broadcastUpdate('subscription_created', {
            subscriptionId: createdSub.id,
            customerId: createdSub.customer,
            status: createdSub.status,
          });
          break;

        case 'customer.subscription.updated':
          const updatedSub = event.data.object as Stripe.Subscription;
          console.log(`Subscription updated: ${updatedSub.id}`);
          
          // Broadcast real-time update
          broadcastUpdate('subscription_updated', {
            subscriptionId: updatedSub.id,
            customerId: updatedSub.customer,
            status: updatedSub.status,
          });
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          console.log(`Subscription cancelled: ${deletedSub.id}`);
          
          // Broadcast real-time update
          broadcastUpdate('subscription_cancelled', {
            subscriptionId: deletedSub.id,
            customerId: deletedSub.customer,
          });
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return res.status(500).send('Webhook processing failed');
    }

    res.json({ received: true });
  });

  // Real-time metrics endpoint
  app.get('/api/realtime/status', (req, res) => {
    res.json({
      stripeConfigured: !!stripe,
      webhookEndpoint: '/api/stripe/webhook',
      activeConnections: wsClients.size,
      features: {
        realTimePayments: !!stripe,
        webhookProcessing: !!stripe,
        liveMetrics: true,
        instantNotifications: true,
      }
    });
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates on a separate path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established for real-time updates');
    wsClients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
      event: 'connected',
      data: { message: 'Real-time updates connected' },
      timestamp: new Date().toISOString()
    }));
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
