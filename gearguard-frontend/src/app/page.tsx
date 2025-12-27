import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Subtle Top Border Decor */}
      <div className="h-1 w-full bg-blue-600" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-4xl space-y-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3 h-3" /> Asset Intelligence Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
              Gear<span className="text-blue-600">Guard</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Centralized monitoring for your asset maintenance operations. 
              Connect teams, equipment, and requests in one unified interface.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 h-12 text-md shadow-sm">
                Access Dashboard
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-50 px-10 h-12 text-md shadow-sm">
                Register New Unit
              </Button>
            </Link>
          </div>

          {/* Quick Stats/Features to match Dashboard Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-200">
            {[
              { label: "Predictive Analytics", icon: Activity },
              { label: "Kanban Workflows", icon: Settings },
              { label: "Global Compliance", icon: Shield },
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-center gap-3 text-slate-500">
                <feature.icon className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}