import { getCurrentUserFromRequest } from "../../../auth";
import { publishTheme } from "../theme-store";

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      projectId?: string;
      environment?: string;
      config?: unknown;
      themeId?: string;
    };
    const projectId = body.projectId;
    const environment = body.environment ?? "production";

    if (!projectId || !body.config) {
      return Response.json({ error: "Project id and token config are required." }, { status: 400 });
    }

    const theme = await publishTheme({
      projectId,
      environment,
      config: body.config,
      userId: user.id,
      ...(body.themeId ? { themeId: body.themeId } : {})
    });

    return Response.json({
      projectId: theme.projectId,
      environment: theme.environment,
      version: theme.version,
      hash: theme.hash,
      createdAt: theme.createdAt,
      jsonUrl: `/api/themes/${theme.projectId}/${theme.environment}.json`,
      cssUrl: `/api/themes/${theme.projectId}/${theme.environment}.css`,
      versionUrl: `/api/themes/${theme.projectId}/versions/${theme.version}.json`
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme publish failed."
    }, { status: 400 });
  }
}
