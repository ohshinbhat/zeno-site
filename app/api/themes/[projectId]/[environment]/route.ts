import { createHostedThemeResponse, createThemeCorsResponse, getActiveTheme } from "../../theme-store";

type RouteContext = {
  params: Promise<{
    projectId: string;
    environment: string;
  }>;
};

function parseEnvironment(segment: string): { environment: string; kind: "json" | "css" } | null {
  if (segment.endsWith(".json")) {
    return { environment: segment.slice(0, -5), kind: "json" };
  }

  if (segment.endsWith(".css")) {
    return { environment: segment.slice(0, -4), kind: "css" };
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const { projectId, environment: environmentSegment } = await context.params;
    const parsed = parseEnvironment(environmentSegment);
    if (!parsed) {
      return Response.json({ error: "Use .json or .css theme endpoints." }, { status: 404 });
    }

    const theme = await getActiveTheme(projectId, parsed.environment);
    if (!theme) {
      return Response.json({ error: "Theme not found." }, { status: 404 });
    }

    return createHostedThemeResponse(theme, parsed.kind);
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme lookup failed."
    }, { status: 400 });
  }
}

export function OPTIONS(): Response {
  return createThemeCorsResponse();
}
