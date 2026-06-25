import { readZenoTokenConfig } from "@zeno-site/tokens";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as unknown;
    const result = readZenoTokenConfig(body);

    return Response.json(result, {
      status: result.valid ? 200 : 400
    });
  } catch (error) {
    return Response.json({
      valid: false,
      error: error instanceof Error ? error.message : "Theme validation failed."
    }, { status: 400 });
  }
}
