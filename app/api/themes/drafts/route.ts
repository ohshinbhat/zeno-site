import { getCurrentUserFromRequest } from "../../../auth";
import { listThemeDrafts, saveThemeDraft } from "../theme-store";

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return Response.json({ error: "Project id is required." }, { status: 400 });
    }

    const drafts = await listThemeDrafts(projectId, user.id);
    return Response.json({ drafts });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme drafts lookup failed."
    }, { status: 400 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      projectId?: string;
      name?: string;
      config?: unknown;
      form?: unknown;
      themeId?: string;
    };
    if (!body.projectId || !body.config) {
      return Response.json({ error: "Project id and token config are required." }, { status: 400 });
    }

    const draft = await saveThemeDraft({
      projectId: body.projectId,
      userId: user.id,
      name: body.name || "Untitled theme",
      config: body.config,
      form: body.form ?? null,
      ...(body.themeId ? { themeId: body.themeId } : {})
    });

    return Response.json({ draft });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme draft save failed."
    }, { status: 400 });
  }
}
