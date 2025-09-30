// app/api/analytics/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "7";
    
    // Get auth token from cookies instead of headers
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    console.log("🔍 Analytics API - Making request to backend...");
    
    const response = await fetch(
      `http://localhost:8000/analytics/dashboard?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📊 Analytics API Response:", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Analytics API Error:", errorText);
      
      let errorDetail = "Failed to fetch analytics";
      try {
        const errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || errorDetail;
      } catch {
        // keep default
      }
      
      return NextResponse.json({ detail: errorDetail }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Analytics data received:", data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("💥 Analytics API Error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
