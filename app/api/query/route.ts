// app/api/query/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { QueryRequest, QueryResponse, ErrorResponse } from "../types";

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 }
      );
    }

    const body: QueryRequest = await request.json();

    // Forward the token to backend
    const response = await fetch("http://localhost:8000/query/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: QueryResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Query API error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
