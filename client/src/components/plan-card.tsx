import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import { SubscriptionPlan } from "@shared/schema";

interface PlanCardProps {
  plan: SubscriptionPlan & { subscribers?: number };
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: number) => void;
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const isPopular = plan.name === "Professional";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
          {isPopular && (
            <Badge className="bg-success/10 text-success">Popular</Badge>
          )}
          {!isPopular && (
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
          <span className="text-gray-500">/{plan.billingCycle === 'monthly' ? 'month' : plan.billingCycle}</span>
        </div>
        
        {plan.description && (
          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
        )}
        
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <Check className="text-success mr-2 flex-shrink-0" size={16} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Active subscribers</span>
          <span className="text-sm font-medium text-slate-900">
            {plan.subscribers || 0}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(plan)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(plan.id)}
            className="text-gray-400 hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
