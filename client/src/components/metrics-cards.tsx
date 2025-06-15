import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, TrendingDown, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Metrics {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  failedPayments: number;
}

export function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Failed to load metrics</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      change: "+12.5%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Active Subscriptions",
      value: metrics.activeSubscriptions.toLocaleString(),
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      change: "+8.2%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Churn Rate",
      value: `${metrics.churnRate}%`,
      icon: TrendingDown,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      change: "-0.5%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Failed Payments",
      value: metrics.failedPayments.toString(),
      icon: AlertTriangle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      change: metrics.failedPayments > 0 ? `+${Math.min(metrics.failedPayments, 3)} today` : "No issues",
      changeText: metrics.failedPayments > 0 ? "requires attention" : "all good",
      changeColor: metrics.failedPayments > 0 ? "text-destructive" : "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={card.iconColor} size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${card.changeColor}`}>{card.change}</span>
                <span className="text-gray-500 ml-2">{card.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
