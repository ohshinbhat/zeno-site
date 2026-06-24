import { createHostedThemeResponse, createThemeCorsResponse, getThemeVersion } from "../../../theme-store";

type RouteContext = {
  params: Promise<{
    projectId: string;
    version: string;
  }>;
};

function parseVersion(segment: string): { version: string; kind: "json" | "css" } | null {
  if (segment.endsWith(".json")) {
    return { version: segment.slice(0, -5), kind: "json" };
  }

  if (segment.endsWith(".css")) {
    return { version: segment.slice(0, -4), kind: "css" };
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const { projectId, version: versionSegment } = await context.params;
    const parsed = parseVersion(versionSegment);
    if (!parsed) {
      return Response.json({ error: "Use .json or .css theme endpoints." }, { status: 404 });
    }

    const theme = await getThemeVersion(projectId, parsed.version);
    if (!theme) {
      return Response.json({ error: "Theme version not found." }, { status: 404 });
    }

    return createHostedThemeResponse(theme, parsed.kind);
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme version lookup failed."
    }, { status: 400 });
  }
}

export function OPTIONS(): Response {
  return createThemeCorsResponse();
}
