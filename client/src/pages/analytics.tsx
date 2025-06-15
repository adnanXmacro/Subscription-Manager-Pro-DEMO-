import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Download 
} from "lucide-react";

export default function Analytics() {
  // Mock analytics data
  const metrics = {
    monthlyRecurringRevenue: 47250,
    averageRevenuePerUser: 165,
    customerLifetimeValue: 1980,
    churnRate: 3.2,
    newCustomers: 127,
    upgrades: 23,
    downgrades: 8,
    cancellations: 15,
  };

  const revenueGrowth = [
    { month: 'Jan', revenue: 32000 },
    { month: 'Feb', revenue: 35000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 42000 },
    { month: 'May', revenue: 45000 },
    { month: 'Jun', revenue: 47250 },
  ];

  const customerMetrics = [
    { metric: 'New Customers', value: metrics.newCustomers, change: '+12%', trend: 'up' },
    { metric: 'Upgrades', value: metrics.upgrades, change: '+5%', trend: 'up' },
    { metric: 'Downgrades', value: metrics.downgrades, change: '-2%', trend: 'down' },
    { metric: 'Cancellations', value: metrics.cancellations, change: '-8%', trend: 'down' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
              <p className="text-gray-600">Insights into your subscription business performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>This year</option>
              </select>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${metrics.monthlyRecurringRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-success" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-success mr-1" size={14} />
                  <span className="text-success font-medium">+15.2%</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
                    <p className="text-2xl font-bold text-slate-900">${metrics.averageRevenuePerUser}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-success mr-1" size={14} />
                  <span className="text-success font-medium">+3.8%</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Lifetime Value</p>
                    <p className="text-2xl font-bold text-slate-900">${metrics.customerLifetimeValue}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Calendar className="text-warning" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-success mr-1" size={14} />
                  <span className="text-success font-medium">+7.1%</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{metrics.churnRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="text-destructive" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingDown className="text-success mr-1" size={14} />
                  <span className="text-success font-medium">-0.8%</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 mb-2">📈</div>
                    <p className="text-gray-500">Revenue trend visualization</p>
                    <p className="text-sm text-gray-400">Chart integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerMetrics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.trend === 'up' ? 'bg-success' : 'bg-warning'
                        }`}></div>
                        <span className="text-sm font-medium text-slate-900">{item.metric}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{item.value}</p>
                        <p className={`text-xs ${
                          item.trend === 'up' ? 'text-success' : 'text-warning'
                        }`}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Basic Plan</h3>
                  <p className="text-3xl font-bold text-primary mb-1">$17,910</p>
                  <p className="text-sm text-gray-500">618 subscribers</p>
                  <div className="mt-4 bg-primary/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: '38%'}}></div>
                  </div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Professional</h3>
                  <p className="text-3xl font-bold text-success mb-1">$97,218</p>
                  <p className="text-sm text-gray-500">982 subscribers</p>
                  <div className="mt-4 bg-success/20 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{width: '62%'}}></div>
                  </div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Enterprise</h3>
                  <p className="text-3xl font-bold text-warning mb-1">$372,853</p>
                  <p className="text-sm text-gray-500">1,247 subscribers</p>
                  <div className="mt-4 bg-warning/20 rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
