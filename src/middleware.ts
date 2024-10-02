import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { persistor } from "./app/reduxUtils/store";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/ident", request.url));
  }

  if (
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname === "/administrator"
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (request.nextUrl.pathname === "/member") {
    return NextResponse.redirect(new URL("/member/explore", request.url));
  }

  if (request.nextUrl.pathname === "/signin") {
    return NextResponse.redirect(new URL("/ident/signin", request.url));
  }

  if (request.nextUrl.pathname === "/ident") {
    return NextResponse.redirect(new URL("/ident/signin", request.url));
  }

  if (
    request.nextUrl.pathname === "/ident/signin" &&
    !request.nextUrl.searchParams.has("usertype")
  ) {
    return NextResponse.redirect(
      new URL("/ident/signin?usertype=member", request.url)
    );
  }

  if (request.nextUrl.pathname === "/signup") {
    return NextResponse.redirect(new URL("/ident/signup", request.url));
  }

  if (
    request.nextUrl.pathname === "/ident/signup" &&
    !request.nextUrl.searchParams.has("usertype")
  ) {
    return NextResponse.redirect(
      new URL("/ident/signup?usertype=member", request.url)
    );
  }

  if (user) {
    const user_type = user.user_metadata.role;
    const account_status = user.user_metadata.account_status;

    if (user_type === "member" && account_status !== "active") {
      const { error } = await supabase.auth.signOut();

      if (!error) {
        persistor.purge();
      }
      return NextResponse.redirect(new URL("/ident/confirmation", request.url));
    }

    if (request.nextUrl.pathname === "/") {
      if (user_type === "member") {
        return NextResponse.redirect(new URL("/member", request.url));
      } else {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (request.nextUrl.pathname.startsWith("/ident")) {
      if (user_type === "member") {
        return NextResponse.redirect(new URL("/member", request.url));
      } else {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (request.nextUrl.pathname.startsWith("/ident/confirmation")) {
      if (user_type === "member" && account_status === "active") {
        return NextResponse.redirect(new URL("/member", request.url));
      } else {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      user_type === "member"
    ) {
      return NextResponse.redirect(new URL("/member", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/member") &&
      user_type !== "member"
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  } else {
    // If no user is logged in, redirect to home page for protected routes
    if (
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/member")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

// Optionally, specify which routes the middleware should run on
export const config = {
  matcher: [
    "/",
    "/ident",
    "/ident/:path*",
    "/admin",
    "/administrator",
    "/admin/:path*",
    "/member",
    "/member/:path*",
    "/signin",
    "/signup",
  ],
};
