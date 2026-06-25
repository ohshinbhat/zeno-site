import { generateTheme, type ThemeInput } from "@zeno-site/theme-engine";
import { createZenoTokenConfig } from "@zeno-site/tokens";
import { getCurrentUserFromRequest } from "../../../auth";
import { createAIThemeInput } from "../ai-theme-input";

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json() as ThemeInput;
    const aiTheme = await createAIThemeInput(body);
    const generated = generateTheme(aiTheme.input);
    const metadata: { name: string; description?: string } = {
      name: generated.name
    };
    if (aiTheme.input.prompt) metadata.description = aiTheme.input.prompt;

    const config = createZenoTokenConfig({
      metadata,
      tokens: generated.tokens
    });

    return Response.json({
      ...generated,
      input: aiTheme.input,
      ai: aiTheme.source,
      config
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Theme generation failed."
    }, { status: 400 });
  }
}
