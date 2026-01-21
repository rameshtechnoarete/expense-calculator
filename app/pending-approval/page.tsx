"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Clock, LogOut, RefreshCw } from "lucide-react";

export default function PendingApprovalPage() {
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkApprovalStatus = async () => {
    setChecking(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

      if (profile?.is_approved) {
        router.push("/");
        router.refresh();
        return;
      }
    }
    setChecking(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          <CardDescription>
            Your account is awaiting administrator approval
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Thank you for signing up! An administrator needs to approve your
            account before you can access the expense tracker. This usually
            takes a short while.
          </p>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              You&apos;ll be able to access the app once your account has been
              approved. Check back soon!
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={checkApprovalStatus}
            disabled={checking}
          >
            {checking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check approval status
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
