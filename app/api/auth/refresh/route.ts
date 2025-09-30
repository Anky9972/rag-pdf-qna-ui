// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TokenResponse, ErrorResponse } from "../../types";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    // Call FastAPI refresh endpoint
    const response = await fetch("http://localhost:8000/auth/refresh", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: TokenResponse = await response.json();

    // Update cookie with refreshed token
    const res = NextResponse.json(data);
    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour, adjust if needed
    });

    return res;
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
