import { getCurrentUserFromRequest } from "../../auth";
import { createProjectForUser, ensureProjectForUser, listProjectsForUser } from "../themes/theme-store";

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  await ensureProjectForUser(user);
  const projects = await listProjectsForUser(user.id);
  return Response.json({ projects });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json() as { name?: string };
    const project = await createProjectForUser(user, body.name || "Zeno workspace");
    return Response.json({ project });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Project creation failed."
    }, { status: 400 });
  }
}
