import type { ZenoTokens } from "@zeno-site/tokens";

export function generateRuntimeThemeCss(tokens: ZenoTokens, selector = ":root"): string {
  const lines = [
    ...Object.entries(tokens.color).map(([key, value]) => [`--color-${toCssKey(key)}`, value]),
    ...Object.entries(tokens.radius).map(([key, value]) => [`--radius-${toCssKey(key)}`, value]),
    ...Object.entries(tokens.spacing).map(([key, value]) => [`--spacing-${toCssKey(key)}`, value]),
    ...Object.entries(tokens.type).map(([key, value]) => [`--text-${toCssKey(key)}`, value]),
    ...Object.entries(tokens.size).map(([key, value]) => [`--size-${toCssKey(key)}`, value]),
    ...Object.entries(tokens.shadow).map(([key, value]) => [`--shadow-${toCssKey(key)}`, value])
  ].map(([key, value]) => `  ${key}: ${value};`);

  return `${selector} {\n${lines.join("\n")}\n}`;
}

export function generateExportBundle(tokens: ZenoTokens): { tailwindThemeCss: string } {
  return {
    tailwindThemeCss: generateRuntimeThemeCss(tokens, "@theme")
  };
}

function toCssKey(value: string): string {
  return value.replace(/[._]/g, "-");
}
