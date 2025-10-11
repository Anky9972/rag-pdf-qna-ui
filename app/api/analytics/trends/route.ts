// app/api/analytics/trends/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "7";
    
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const response = await fetch(
      `http://localhost:8000/analytics/trends?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Trends API Error:", errorText);
      return NextResponse.json({ detail: "Failed to fetch trends" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("💥 Trends API Error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}