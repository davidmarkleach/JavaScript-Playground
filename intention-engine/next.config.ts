import path from "node:path";

import type { NextConfig } from "next";

// Published to GitHub Pages as a static export under a project subpath.
// Override for local dev or another host, e.g. INTENTION_BASE_PATH="".
const basePath =
  process.env.INTENTION_BASE_PATH ?? "/JavaScript-Playground/intention-engine";

const nextConfig: NextConfig = {
  // Pages serves plain files, so emit a fully static build to out/.
  output: "export",
  basePath,
  // Static hosts resolve a directory to its index.html; keep links matching.
  trailingSlash: true,
  // The image optimizer needs a server, which a static export does not have.
  images: { unoptimized: true },
  // The repository root holds an unrelated static playground with its own
  // lockfile, so pin the workspace root to this app.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
