"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Trello, Calendar, HardDrive, 
  LogOut, User, Settings, LogIn, UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
    { name: "Kanban Board", icon: <Trello size={18} />, href: "/kanban" },
    { name: "Calendar", icon: <Calendar size={18} />, href: "/calendar" },
    { name: "Equipment", icon: <HardDrive size={18} />, href: "/equipment" },
  ];

  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between h-full shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 px-2 py-6">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Settings size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">GearGuard</span>
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

      {/* Bottom Section - Conditional Rendering based on User Auth */}
      <div className="p-4 border-t bg-slate-50/50 space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-9 w-9 border border-white shadow-sm">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                  {user.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate mb-0.5">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
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
              <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 hover:bg-white">
                <LogIn size={18} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Login</span>
              </Button>
            </Link>
            <Link href="/signup" className="w-full block">
              <Button className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700">
                <UserPlus size={18} />
                <span className="text-sm font-medium">Create Account</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}