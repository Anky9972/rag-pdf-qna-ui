// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import type { ForgotPasswordRequest, PasswordResetResponse, ErrorResponse } from "../../types";

export async function POST(req: Request) {
  try {
    const body: ForgotPasswordRequest = await req.json();

    const response = await fetch("http://localhost:8000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data: PasswordResetResponse | ErrorResponse = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
