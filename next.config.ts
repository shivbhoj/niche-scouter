import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * No CSP here on purpose: the app renders with inline `style` attributes
 * throughout (carried over from the design prototype), so a meaningful
 * script/style CSP would need either nonces threaded through every
 * component or `unsafe-inline`, and the latter is security theatre.
 * Worth adding properly if the styles move to CSS modules.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Only meaningful over HTTPS; browsers ignore it on plain HTTP, so it's
  // safe to send in local dev too.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
