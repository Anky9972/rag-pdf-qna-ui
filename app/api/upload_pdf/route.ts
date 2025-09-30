// app/api/upload_pdf/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UploadResponse, ErrorResponse } from "../types";

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    // Parse incoming form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ detail: "File is required" }, { status: 400 });
    }

    // Forward the request to backend with Bearer token
    const response = await fetch("http://localhost:8000/upload_pdf/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // directly forward formData
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: UploadResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
