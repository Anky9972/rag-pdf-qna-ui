// app/api/metrics/route.ts
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Grab cookie(s) from Next.js request
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    // Forward request to backend with cookies
    const response = await fetch("http://localhost:8000/metrics", {
      method: "GET",
      headers: {
        Cookie: cookieHeader, // Forward session cookies
      },
      credentials: "include",
    });

    if (!response.ok) {
      let error: any;
      try {
        error = await response.json();
      } catch {
        error = { detail: "Metrics fetch failed" };
      }
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prometheus metrics are plain text
    const data = await response.text();
    return new Response(data, {
      headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
    });
  } catch (error) {
    console.error("💥 Metrics proxy failed:", error);
    return new Response(JSON.stringify({ detail: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
