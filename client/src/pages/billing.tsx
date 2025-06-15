import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Calendar, DollarSign, FileText } from "lucide-react";

export default function Billing() {
  // Mock data for billing information
  const invoices = [
    {
      id: "INV-001",
      customer: "Sarah Johnson",
      amount: 299,
      status: "paid",
      date: "2023-12-01",
      plan: "Enterprise Plan",
    },
    {
      id: "INV-002", 
      customer: "Michael Chen",
      amount: 99,
      status: "paid",
      date: "2023-12-01",
      plan: "Professional Plan",
    },
    {
      id: "INV-003",
      customer: "Emma Davis",
      amount: 29,
      status: "pending",
      date: "2023-12-01", 
      plan: "Basic Plan",
    },
    {
      id: "INV-004",
      customer: "Alex Rodriguez", 
      amount: 299,
      status: "failed",
      date: "2023-11-28",
      plan: "Enterprise Plan",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-success/10 text-success",
      pending: "bg-warning/10 text-warning", 
      failed: "bg-destructive/10 text-destructive",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const failedAmount = invoices
    .filter(inv => inv.status === 'failed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
              <p className="text-gray-600">Manage invoices and billing information</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Billing Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-success" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success font-medium">This month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-slate-900">${pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Calendar className="text-warning" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-warning font-medium">Awaiting payment</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                    <p className="text-2xl font-bold text-slate-900">${failedAmount.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-destructive" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-destructive font-medium">Requires attention</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-slate-900">{invoice.id}</h3>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{invoice.customer}</span>
                        <span>•</span>
                        <span>{invoice.plan}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-slate-900">${invoice.amount}</p>
                      <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
