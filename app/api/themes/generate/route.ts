import { generateTheme, type ThemeInput } from "@zeno-ui/theme-engine";
import { createZenoTokenConfig } from "@zeno-ui/tokens";
import { getCurrentUserFromRequest } from "../../../auth";

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json() as ThemeInput;
    const generated = generateTheme(body);
    const metadata: { name: string; description?: string } = {
      name: generated.name
    };
    if (body.prompt) metadata.description = body.prompt;

    const config = createZenoTokenConfig({
      metadata,
      tokens: generated.tokens
    });

    return Response.json({
      ...generated,
      config
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme generation failed."
    }, { status: 400 });
  }
}
