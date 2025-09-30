// app/api/conversations/[conversation_id]/messages/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MessageResponse, ErrorResponse } from "../../../types";

export async function GET(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    const response = await fetch(
      `http://localhost:8000/conversations/${params.conversation_id}/messages?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: MessageResponse[] = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const response = await fetch(
      `http://localhost:8000/conversations/${params.conversation_id}/messages`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json({ detail: "Message deleted successfully" });
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
