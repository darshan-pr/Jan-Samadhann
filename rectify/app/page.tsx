"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "./lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on user role
        if (user.role === 'user') {
          router.push('/dashboard');
        } else if (user.role === 'admin') {
          router.push('/admin');
        }
      } else {
        // Not authenticated, redirect to signup
        router.push('/signup');
      }
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Image src="/logo.png" alt="Jan Samadhan" width={64} height={64} className="mr-4" />
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent" style={{ fontFamily: 'Aptos, sans-serif' }}>
              Jan Samadhan
            </div>
            <p className="text-sm text-gray-400 mt-1">Community & Direct Digital Governance</p>
          </div>
        </div>
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}