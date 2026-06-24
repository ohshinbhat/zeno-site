import { NextResponse } from "next/server";
import { applyAuthCookie, signUpWithPassword } from "../../../auth";
import { ensureProjectForUser } from "../../themes/theme-store";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const session = await signUpWithPassword(body.email, body.password);
    await ensureProjectForUser(session.user);
    const response = NextResponse.json({ user: session.user });
    applyAuthCookie(response, session);
    return response;
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Unable to create account."
    }, { status: 400 });
  }
}
