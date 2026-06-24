import { NextResponse } from "next/server";
import { applyAuthCookie, signInWithPassword } from "../../../auth";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const session = await signInWithPassword(body.email, body.password);
    const response = NextResponse.json({ user: session.user });
    applyAuthCookie(response, session);
    return response;
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Unable to sign in."
    }, { status: 401 });
  }
}
