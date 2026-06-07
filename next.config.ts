import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is not (yet) emitted by Turbopack production builds in
  // Next 16, so we ship the full node_modules in the runner image instead.
};

export default nextConfig;
