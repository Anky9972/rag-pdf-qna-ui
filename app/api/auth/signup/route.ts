// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserSignupRequest, TokenResponse, ErrorResponse } from "../../types";

export async function POST(request: Request) {
  try {
    const body: UserSignupRequest = await request.json();

    const response = await fetch("http://localhost:8000/auth/signup", {
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

    // Save token in cookie (httpOnly)
    const res = NextResponse.json(data, { status: 201 });
    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour (adjust if needed)
    });

    return res;
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
