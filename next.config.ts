import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

function createConfig(phase: string): NextConfig {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    webpack(config) {
      config.resolve = config.resolve ?? {};
      config.resolve.extensionAlias = {
        ...config.resolve.extensionAlias,
        ".js": [".ts", ".tsx", ".js"],
        ".jsx": [".tsx", ".jsx"]
      };

      return config;
    }
  };
}

export default createConfig;
