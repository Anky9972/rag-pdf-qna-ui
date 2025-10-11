// app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ChangePasswordRequest, PasswordResetResponse, ErrorResponse } from "../../types";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const body: ChangePasswordRequest = await req.json();

    const response = await fetch("http://localhost:8000/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data: PasswordResetResponse | ErrorResponse = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
