import { useEffect, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
}

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('Real-time connection established');
        setIsConnected(true);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          setLastEvent(data);
          
          // Handle different event types with notifications
          switch (data.event) {
            case 'payment_success':
              toast({
                title: "Payment Successful",
                description: `Payment of $${data.data.amount} processed successfully`,
              });
              break;
              
            case 'payment_failed':
              toast({
                title: "Payment Failed",
                description: `Payment failed: ${data.data.reason}`,
                variant: "destructive",
              });
              break;
              
            case 'subscription_created':
              toast({
                title: "New Subscription",
                description: "A new subscription has been created",
              });
              break;
              
            case 'subscription_cancelled':
              toast({
                title: "Subscription Cancelled",
                description: "A subscription has been cancelled",
                variant: "destructive",
              });
              break;
              
            case 'invoice_paid':
              toast({
                title: "Invoice Paid",
                description: `Invoice payment of $${data.data.amount} received`,
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        console.log('Real-time connection closed');
        setIsConnected(false);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [toast]);

  return {
    isConnected,
    lastEvent,
  };
}