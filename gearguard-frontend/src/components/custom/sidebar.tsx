"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Trello, Calendar, HardDrive, 
  LogOut, Settings, LogIn, BarChart3,
  Users, Layers, MapPin, ClipboardList, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname]); // Refresh user details on navigation changes

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  const getMenuItems = () => {
    const role = user?.role;
    if (role === "admin") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
        { name: "Kanban Board", icon: <Trello size={18} />, href: "/kanban" },
        { name: "Assets", icon: <HardDrive size={18} />, href: "/equipment" },
        { name: "Categories", icon: <Layers size={18} />, href: "/categories" },
        { name: "Locations", icon: <MapPin size={18} />, href: "/locations" },
        { name: "Users", icon: <Users size={18} />, href: "/users" },
      ];
    }
    if (role === "manager") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
        { name: "Kanban Board", icon: <Trello size={18} />, href: "/kanban" },
        { name: "Asset Requests", icon: <ClipboardList size={18} />, href: "/requests-management" },
        { name: "Audit Logs", icon: <FileText size={18} />, href: "/audit-logs" },
      ];
    }
    if (role === "user") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
        { name: "My Requests", icon: <ClipboardList size={18} />, href: "/my-requests" },
      ];
    }
    if (role === "technician") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
        { name: "Kanban Board", icon: <Trello size={18} />, href: "/kanban" },
        { name: "Calendar", icon: <Calendar size={18} />, href: "/calendar" },
      ];
    }
    if (role === "auditor") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
        { name: "Kanban Board", icon: <Trello size={18} />, href: "/kanban" },
        { name: "Reporting", icon: <BarChart3 size={18} />, href: "/reporting" },
        { name: "Audit Logs", icon: <FileText size={18} />, href: "/audit-logs" },
      ];
    }
    return [
      { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" }
    ];
  };

  const menuItems = getMenuItems();

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case "admin": return { text: "Admin", bg: "bg-red-100 text-red-700" };
      case "manager": return { text: "Manager", bg: "bg-orange-100 text-orange-700" };
      case "technician": return { text: "Technician", bg: "bg-green-100 text-green-700" };
      case "auditor": return { text: "Auditor", bg: "bg-purple-100 text-purple-700" };
      case "user": return { text: "Employee", bg: "bg-blue-100 text-blue-700" };
      default: return { text: "Operator", bg: "bg-slate-100 text-slate-700" };
    }
  };
  const badge = getRoleBadge(user?.role);

  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between h-full shadow-sm shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-2 px-2 py-6">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Settings size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">GearGuard</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname === item.href ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t bg-slate-50/50 space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-9 w-9 border border-white shadow-sm">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                  {user.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden text-slate-900 text-left">
                <p className="text-sm font-semibold truncate mb-0.5">{user.name}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${badge.bg}`}>
                    {badge.text}
                  </span>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <p className="text-[9px] text-slate-400 font-mono">ID: {user.id}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <Link href="/login" className="w-full block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <LogIn size={18} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Login</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}