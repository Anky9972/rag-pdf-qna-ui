// app/api/conversations/[conversation_id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ErrorResponse } from "../../types";

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
      `http://localhost:8000/conversations/${params.conversation_id}`,
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

    return NextResponse.json({ detail: "Conversation deleted successfully" });
  } catch (error) {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
