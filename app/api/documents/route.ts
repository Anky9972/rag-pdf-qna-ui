// app/api/documents/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DocumentSummary, ErrorResponse } from "../types";

export async function GET(request: Request) {
  try {
    // Get the token from cookies instead of Authorization header
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const response = await fetch(
      `http://localhost:8000/documents/?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Use the token from cookies
        },
      }
    );

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: DocumentSummary[] = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}