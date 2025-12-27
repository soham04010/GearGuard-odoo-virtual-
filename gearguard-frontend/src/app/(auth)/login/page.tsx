"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const mutation = useMutation({
    mutationFn: (data: any) => authRequest("login", data),
    onSuccess: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    },
    onError: (error: any) => alert(error.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[400px] space-y-8 p-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="text-slate-500 text-sm">Enter your credentials to access GearGuard</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Work Email</label>
              <Input 
                className="h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                placeholder="name@company.com" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Access Password</label>
              <Input 
                type="password"
                className="h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Authenticating..." : "Sign In to Dashboard"}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              New operator? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Secure Terminal Access Protocol v4.0
        </p>
      </div>
    </div>
  );
}