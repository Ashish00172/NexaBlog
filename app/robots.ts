export default function Robots() {
  const base = process.env.APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"]
    },
    sitemap: `${base}/sitemap.xml`
  };
}
