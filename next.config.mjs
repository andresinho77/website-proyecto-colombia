import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  // 'export' is only needed for the real static-site build (npm run build),
  // never for `next dev`. With output:'export' unconditionally set, Next's
  // dev server enforces the same "every dynamic param must be in
  // generateStaticParams()" constraint a fully static deploy has at
  // runtime — an unmatched /[ciudad]/ slug throws Next's own internal error
  // page instead of ever calling notFound() and rendering
  // app/not-found.tsx, since output:'export' also forces dynamicParams to
  // false. Excluding 'export' in dev restores normal dynamic-route
  // fallback so 404 behavior can actually be tested locally against
  // `next dev` (see ROADMAP.md US-1.6 for the full story, including why
  // the real static export still needs a CloudFront error-page mapping).
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
});

export default nextConfig;
