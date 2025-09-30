// app/api/health/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HealthResponse, ErrorResponse } from "../types";

export async function GET() {
  try {
    // Collect cookies from Next.js
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    // Forward cookies to backend
    const response = await fetch("http://localhost:8000/health", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      let error: ErrorResponse;
      try {
        error = await response.json();
      } catch {
        error = { detail: "Health check failed" } as ErrorResponse;
      }
      return NextResponse.json(error, { status: response.status });
    }

    const data: HealthResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Health check proxy failed:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
