import { canPublishWithRequest, publishTheme } from "../theme-store";

export async function POST(request: Request): Promise<Response> {
  if (!canPublishWithRequest(request.headers)) {
    return Response.json({ error: "Publishing requires ZENO_ADMIN_TOKEN." }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      projectId?: string;
      environment?: string;
      config?: unknown;
    };
    const projectId = body.projectId ?? "demo";
    const environment = body.environment ?? "production";

    if (!body.config) {
      return Response.json({ error: "Missing token config." }, { status: 400 });
    }

    const theme = await publishTheme({
      projectId,
      environment,
      config: body.config
    });

    return Response.json({
      projectId: theme.projectId,
      environment: theme.environment,
      version: theme.version,
      hash: theme.hash,
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
