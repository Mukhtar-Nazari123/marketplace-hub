import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DOMAIN = "https://yaktabazar.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch active products and categories in parallel
    const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("slug, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false }),
      supabase
        .from("categories")
        .select("slug, updated_at")
        .eq("is_active", true),
      supabase
        .from("subcategories")
        .select("slug, updated_at")
        .eq("is_active", true),
    ]);

    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const subcategories = subcategoriesRes.data || [];

    const now = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/blog", priority: "0.7", changefreq: "weekly" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Category pages
    for (const cat of categories) {
      const lastmod = cat.updated_at
        ? new Date(cat.updated_at).toISOString().split("T")[0]
        : now;
      xml += `  <url>
    <loc>${DOMAIN}/products?category=${encodeURIComponent(cat.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Subcategory pages
    for (const sub of subcategories) {
      const lastmod = sub.updated_at
        ? new Date(sub.updated_at).toISOString().split("T")[0]
        : now;
      xml += `  <url>
    <loc>${DOMAIN}/products?subcategory=${encodeURIComponent(sub.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    // Product pages
    for (const product of products) {
      const lastmod = product.updated_at
        ? new Date(product.updated_at).toISOString().split("T")[0]
        : now;
      xml += `  <url>
    <loc>${DOMAIN}/product/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
