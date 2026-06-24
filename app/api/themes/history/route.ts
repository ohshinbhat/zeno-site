import { getCurrentUserFromRequest } from "../../../auth";
import { listPublishHistory } from "../theme-store";

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return Response.json({ error: "Project id is required." }, { status: 400 });
  }

  try {
    const history = await listPublishHistory(projectId, user.id);
    return Response.json({ history });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Publish history failed to load."
    }, { status: 400 });
  }
}
