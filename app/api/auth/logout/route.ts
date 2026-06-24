import { NextResponse } from "next/server";
import { clearAuthCookie } from "../../../auth";

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
