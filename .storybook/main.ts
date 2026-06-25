import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@zeno-site/nativewind-preset": path.resolve(storybookDir, "../vendor/zeno-site/packages/nativewind-preset/src/index.ts"),
      "@zeno-site/react": path.resolve(storybookDir, "../vendor/zeno-site/packages/react/src/index.tsx"),
      "@zeno-site/tailwind-preset": path.resolve(storybookDir, "../vendor/zeno-site/packages/tailwind-preset/src/index.ts"),
      "@zeno-site/theme-engine": path.resolve(storybookDir, "../vendor/zeno-site/packages/theme-engine/src/index.ts"),
      "@zeno-site/tokens": path.resolve(storybookDir, "../vendor/zeno-site/packages/tokens/src/index.ts")
    };
    return config;
  },
  staticDirs: []
};

export default config;
