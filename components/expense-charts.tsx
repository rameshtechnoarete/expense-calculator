"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Expense } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, startOfDay } from "date-fns";
import { BarChart3, PieChartIcon, TrendingUp } from "lucide-react";

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#ec4899", // pink
  "#a855f7", // purple
  "#eab308", // yellow
  "#ef4444", // red
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#6b7280", // gray
];

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  const dailyData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((day) => {
      const dayExpenses = expenses.filter(
        (e) => startOfDay(new Date(e.date)).getTime() === startOfDay(day).getTime()
      );
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        date: format(day, "MMM d"),
        amount: total,
        fullDate: format(day, "MMM d, yyyy"),
      };
    });
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, "MMM yyyy"),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    return months.map(({ month, start, end }) => {
      const monthExpenses = expenses.filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate >= start && expenseDate <= end;
      });
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        month,
        amount: total,
      };
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-1/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  ${monthlyData[monthlyData.length - 1]?.amount.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categoryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "daily" | "monthly")}>
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily (This Month)</TabsTrigger>
              <TabsTrigger value="monthly">Monthly (6 Months)</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullDate || label
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="monthly">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="amount" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
