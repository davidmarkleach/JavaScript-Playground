import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repository root holds an unrelated static playground with its own
  // lockfile, so pin the workspace root to this app.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
