import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, User, Mail, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Customer {
  id: number;
  user: {
    username: string;
    email: string;
    createdAt: string;
  };
  plan: {
    name: string;
    price: string;
  };
  status: string;
  createdAt: string;
}

export default function Customers() {
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/subscriptions"],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-success/10 text-success",
      trial: "bg-warning/10 text-warning",
      cancelled: "bg-destructive/10 text-destructive",
      past_due: "bg-orange-100 text-orange-600",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
              <p className="text-gray-600">Manage your customer subscriptions and accounts</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : customers && customers.length > 0 ? (
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center space-x-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="text-gray-600" size={20} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-slate-900">{customer.user.username}</h3>
                          <Badge className={getStatusBadge(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>{customer.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Joined {formatDate(customer.user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{customer.plan.name}</p>
                        <p className="text-sm text-gray-500">${customer.plan.price}/month</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subscribed</p>
                        <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                  <p className="text-gray-500">When customers subscribe to your plans, they'll appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
