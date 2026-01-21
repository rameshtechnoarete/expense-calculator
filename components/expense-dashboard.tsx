"use client";

import useSWR from "swr";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { ExpenseCharts } from "./expense-charts";
import { createClient } from "@/lib/supabase/client";
import { Expense } from "@/lib/types";
import { Wallet } from "lucide-react";

const fetcher = async (): Promise<Expense[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export function ExpenseDashboard() {
  const { data: expenses = [], mutate, isLoading } = useSWR("expenses", fetcher);

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
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
