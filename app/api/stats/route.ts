// app/api/stats/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StatsResponse, ErrorResponse } from "../types";

export async function GET() {
  try {
    // Grab cookies from Next.js request
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    // Call FastAPI backend with cookies
    const response = await fetch("http://localhost:8000/stats", {
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
        error = { detail: "Stats fetch failed" } as ErrorResponse;
      }
      return NextResponse.json(error, { status: response.status });
    }

    const data: StatsResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Stats proxy failed:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
