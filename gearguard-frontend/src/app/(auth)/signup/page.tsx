"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[480px] space-y-8 p-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 text-sm">Register your unit for asset monitoring</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
              <Input 
                className="h-11 border-slate-200 rounded-lg"
                placeholder="John Doe" 
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
              <Input 
                className="h-11 border-slate-200 rounded-lg"
                placeholder="john@gearguard.com" 
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <Input 
                  type="password"
                  className="h-11 border-slate-200 rounded-lg"
                  placeholder="••••••••" 
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm</label>
                <Input 
                  type="password"
                  className="h-11 border-slate-200 rounded-lg"
                  placeholder="••••••••" 
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm mt-2"
            onClick={validateAndSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating Account..." : "Confirm Registration"}
          </Button>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Already registered? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}