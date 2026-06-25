import { generateRuntimeThemeCss } from "@zeno-site/tailwind-preset";
import type { ZenoTokens } from "@zeno-site/tokens";

export function generateNativeWindThemeCss(tokens: ZenoTokens): string {
  return generateRuntimeThemeCss(tokens, "@theme");
}
