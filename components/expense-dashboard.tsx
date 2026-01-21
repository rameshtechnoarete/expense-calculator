"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { ExpenseCharts } from "./expense-charts";
import { createClient } from "@/lib/supabase/client";
import { Expense } from "@/lib/types";
import { Wallet, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  email: string;
  full_name: string | null;
  role: string;
}

const fetcher = async (): Promise<Expense[]> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user?.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export function ExpenseDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { data: expenses = [], mutate, isLoading } = useSWR("expenses", fetcher);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        
        setUserProfile({
          email: user.email || "",
          full_name: profile?.full_name || null,
          role: profile?.role || "user",
        });
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">Expense Tracker</h1>
                <p className="text-muted-foreground text-sm">
                  Track and visualize your daily expenses
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {userProfile?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {userProfile?.full_name || userProfile?.email || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{userProfile?.full_name || "User"}</p>
                    <p className="text-muted-foreground text-xs">{userProfile?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <ExpenseForm onExpenseAdded={handleRefresh} />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <ExpenseCharts expenses={expenses} />
              <ExpenseList expenses={expenses} onExpenseDeleted={handleRefresh} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
