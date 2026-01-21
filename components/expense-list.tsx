"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Receipt } from "lucide-react";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800",
  Transportation: "bg-blue-100 text-blue-800",
  Shopping: "bg-pink-100 text-pink-800",
  Entertainment: "bg-purple-100 text-purple-800",
  "Bills & Utilities": "bg-yellow-100 text-yellow-800",
  Healthcare: "bg-red-100 text-red-800",
  Education: "bg-indigo-100 text-indigo-800",
  Travel: "bg-teal-100 text-teal-800",
  "Personal Care": "bg-rose-100 text-rose-800",
  Other: "bg-gray-100 text-gray-800",
};

export function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {
  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      onExpenseDeleted();
    }
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No expenses recorded yet. Add your first expense above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Recent Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-lg">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <Badge className={categoryColors[expense.category] || categoryColors.Other}>
                    {expense.category}
                  </Badge>
                </div>
                {expense.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {expense.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(expense.date), "MMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(expense.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete expense</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
