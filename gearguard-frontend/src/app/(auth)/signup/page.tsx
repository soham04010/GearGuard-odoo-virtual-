"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ShieldCheck, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "user" });

  const mutation = useMutation({
    mutationFn: (data: any) => authRequest("signup", data),
    onSuccess: () => router.push("/login"),
    onError: (err: any) => alert(err.message),
  });

  const validateAndSubmit = () => {
    if (!form.name || !form.email || !form.password) return alert("Fields cannot be empty!");
    if (form.password !== form.confirmPassword) return alert("Passwords do not match!");
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 p-4">
      <div className="w-full max-w-[460px] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 text-blue-600 rounded-2xl mb-2 shadow-xs">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm">Register your employee account for asset monitoring</p>
        </div>

        <div className="bg-white border border-slate-200/60 shadow-xl rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Full Name
              </label>
              <Input 
                className="h-11 border-slate-200 focus-visible:ring-blue-500 rounded-xl transition-all"
                placeholder="John Doe" 
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" /> Email Address
              </label>
              <Input 
                className="h-11 border-slate-200 focus-visible:ring-blue-500 rounded-xl transition-all"
                placeholder="john@gearguard.com" 
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" /> Password
                </label>
                <Input 
                  type="password"
                  className="h-11 border-slate-200 focus-visible:ring-blue-500 rounded-xl transition-all"
                  placeholder="••••••••" 
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" /> Confirm
                </label>
                <Input 
                  type="password"
                  className="h-11 border-slate-200 focus-visible:ring-blue-500 rounded-xl transition-all"
                  placeholder="••••••••" 
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-2"
            onClick={validateAndSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating Account..." : "Confirm Registration"}
          </Button>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Already registered? <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}