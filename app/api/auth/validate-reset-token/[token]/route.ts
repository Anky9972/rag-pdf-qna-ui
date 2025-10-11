// app/api/auth/validate-reset-token/[token]/route.ts
import { NextResponse } from "next/server";
import type { ErrorResponse } from "../../../types";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    console.log("Validating token:", token); // Debug log

    const response = await fetch(`http://localhost:8000/auth/validate-reset-token/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: Record<string, any> | ErrorResponse = await response.json();
    
    console.log("Backend validation response:", data); // Debug log

    // Always return the data with the same status from backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { 
        valid: false, 
        message: "Internal server error",
        detail: "Internal server error" 
      }, 
      { status: 500 }
    );
  }
}