import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Native Rust React Compiler inside Turbopack instead of the Babel
    // transform — avoids the multi-second per-route dev compile stalls.
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
