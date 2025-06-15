import { Sidebar } from "@/components/sidebar";
import { MetricsCards } from "@/components/metrics-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, User, RotateCcw, Mail, Phone, Wifi, WifiOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { Link } from "wouter";

interface RecentSubscription {
  id: number;
  user: {
    username: string;
    email: string;
  };
  plan: {
    name: string;
    price: string;
  };
  status: string;
  createdAt: string;
}

interface PaymentIssue {
  id: number;
  user: {
    username: string;
  };
  reason: string;
  amount: string;
  status: string;
  retryDate: string | null;
}

interface PlanDistribution {
  id: number;
  name: string;
  subscribers?: number;
  percentage?: number;
}

export default function Dashboard() {
  const { isConnected, lastEvent } = useRealtime();
  
  const { data: recentSubscriptions, isLoading: loadingSubscriptions } = useQuery<RecentSubscription[]>({
    queryKey: ["/api/subscriptions/recent"],
  });

  const { data: paymentIssues, isLoading: loadingIssues } = useQuery<PaymentIssue[]>({
    queryKey: ["/api/payment-issues"],
  });

  const { data: plans, isLoading: loadingPlans } = useQuery<PlanDistribution[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-success/10 text-success",
      trial: "bg-warning/10 text-warning",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-600";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your subscriptions today.</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time Status Indicator */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi size={16} className="mr-1" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <WifiOff size={16} className="mr-1" />
                    <span className="text-sm font-medium">Offline</span>
                  </div>
                )}
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </button>
              <Link href="/subscribe/1">
                <Button>
                  <Plus size={16} className="mr-2" />
                  New Subscription
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Metrics Cards */}
          <MetricsCards />

          {/* Charts and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Revenue Trend</CardTitle>
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                      <option>Last 12 months</option>
                      <option>Last 6 months</option>
                      <option>Last 3 months</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">📊</div>
                      <p className="text-gray-500">Revenue chart visualization</p>
                      <p className="text-sm text-gray-400">Chart integration coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPlans ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : plans ? (
                  <div className="space-y-4">
                    {plans.map((plan, index) => {
                      const colors = ["bg-primary", "bg-success", "bg-warning"];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={plan.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${color} rounded-full`}></div>
                            <span className="text-sm font-medium text-slate-900">{plan.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">{plan.subscribers || 0}</p>
                            <p className="text-xs text-gray-500">{plan.percentage || 0}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No plan data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Customer Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Subscriptions</CardTitle>
                  <Link href="/customers">
                    <a className="text-sm text-primary hover:text-primary/80 font-medium">View all</a>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSubscriptions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentSubscriptions && recentSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="text-gray-600" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{subscription.user.username}</p>
                          <p className="text-xs text-gray-500">{subscription.plan.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">${subscription.plan.price}/mo</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(subscription.createdAt)}</p>
                        </div>
                        <Badge className={getStatusBadge(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <User className="mx-auto text-gray-300 mb-2" size={24} />
                    <p>No recent subscriptions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Issues */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Issues</CardTitle>
                  {paymentIssues && paymentIssues.length > 0 && (
                    <Badge className="bg-destructive/10 text-destructive">
                      {paymentIssues.length} pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingIssues ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-3 border border-red-100 bg-red-50 rounded-lg">
                        <div className="h-4 bg-red-200 rounded mb-2"></div>
                        <div className="h-3 bg-red-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : paymentIssues && paymentIssues.length > 0 ? (
                  <div className="space-y-4">
                    {paymentIssues.slice(0, 3).map((issue) => (
                      <div key={issue.id} className="flex items-center space-x-4 p-3 border border-red-100 bg-red-50 rounded-lg">
                        <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                          <span className="text-destructive">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{issue.user.username}</p>
                          <p className="text-xs text-gray-600">{issue.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">${issue.amount}</p>
                          <p className="text-xs text-gray-500">
                            {issue.retryDate ? `Retry in 3 days` : 'Requires attention'}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="text-destructive hover:text-destructive/80 p-1">
                            <RotateCcw size={14} />
                          </button>
                          <button className="text-destructive hover:text-destructive/80 p-1">
                            <Mail size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-2xl mb-2">✅</div>
                    <p>No payment issues</p>
                    <p className="text-xs">All payments are processing smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
