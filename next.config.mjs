import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default function nextConfig(phase) {
  return {
    // Keep production builds from overwriting a running development server.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    webpack(config, { dev }) {
      // Avoid large filesystem cache buffers on memory-limited 32-bit Node.
      if (dev && process.arch === "ia32") config.cache = false;
      return config;
    },
  };
}
