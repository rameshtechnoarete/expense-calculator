import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isPendingRoute = request.nextUrl.pathname === "/pending-approval";

  // If user is not logged in and trying to access protected routes
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in
  if (user) {
    // Check if user is approved
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved, role")
      .eq("id", user.id)
      .single();

    // If trying to access auth routes while logged in, redirect appropriately
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      if (profile?.is_approved) {
        url.pathname = "/";
      } else {
        url.pathname = "/pending-approval";
      }
      return NextResponse.redirect(url);
    }

    // If user is not approved and not on pending page
    if (!profile?.is_approved && !isPendingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/pending-approval";
      return NextResponse.redirect(url);
    }

    // If user is approved but on pending page, redirect to home
    if (profile?.is_approved && isPendingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // If trying to access admin routes without admin role
    if (isAdminRoute && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
