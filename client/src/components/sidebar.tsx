import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Layers,
  FileText,
  TrendingUp,
  Settings,
  CreditCard,
  User,
  MoreHorizontal,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Subscription Plans", href: "/plans", icon: Layers },
  { name: "Billing", href: "/billing", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CreditCard className="text-white text-sm" size={16} />
          </div>
          <span className="text-xl font-bold text-slate-900">SubscriptionPro</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 text-sm" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">John Smith</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        {/* Branding */}
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">By Adnan POS</p>
        </div>
      </div>
    </aside>
  );
}
