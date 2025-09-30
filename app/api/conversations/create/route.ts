// app/api/conversations/create/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CreateConversationRequest, ConversationResponse, ErrorResponse } from "../../types";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const body: CreateConversationRequest = await request.json();

    const response = await fetch("http://localhost:8000/conversations/", {
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

    const data: ConversationResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
