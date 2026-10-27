import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a static copy into out/ for hosting the demo without a Node server
// (GitHub Pages). NEXT_BASE_PATH serves it from a sub-path, e.g. /anvita-sales-marketing-agent.
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const, trailingSlash: true, basePath } : {}),
  cacheComponents: !staticExport,
  partialPrefetching: !staticExport,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
