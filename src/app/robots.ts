import type { MetadataRoute } from "next";

// Guests reach the site by typing the address from their invitation, so there
// is nothing to gain from being indexed — and the guest list is the one thing
// we'd rather search engines never touch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
