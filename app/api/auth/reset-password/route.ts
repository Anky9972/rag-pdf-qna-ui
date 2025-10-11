// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch("http://localhost:8000/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: body.token,              // ✅ exact match
        new_password: body.new_password // ✅ exact match
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
