// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UpdateUserProfileRequest, UserProfileResponse, ErrorResponse } from "../../types";

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

    const body: UpdateUserProfileRequest = await request.json();

    const response = await fetch("http://localhost:8000/user/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // use user's token from cookie
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data: UserProfileResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
