// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { UserLoginRequest, TokenResponse, ErrorResponse } from "../../types";

export async function POST(request: Request) {
  try {
    const body: UserLoginRequest = await request.json();

    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: TokenResponse = await response.json();

    // Create response with cookie
    const res = NextResponse.json(data);
    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,  // prevents JS access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
